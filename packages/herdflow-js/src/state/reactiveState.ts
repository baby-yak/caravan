import { enableMapSet, produce, type Draft } from 'immer';
import type { UnsubscribeFn } from '../core/types.js';
import { StateClient_imp } from './internal/stateClient_imp.js';
import { StateSelector_imp } from './internal/stateSelector_imp.js';
import {
  type ReadonlyDeep,
  type StateApi,
  type StateClient,
  type StateConstructionParams,
  type StateListener,
  type StateSelectFn,
} from './types/types.js';
import { isPlainObject, makeReadOnlyDeep } from './utils.js';

//-------------------------------------------------------
// -- enables immer Map/Set support globally — see README
enableMapSet();

//-------------------------------------------------------
//-- types

type ListenerContainer<S> = {
  listener: StateListener<S>;
};

type Shared<S> = {
  initial: S;
  state: S;
  listeners: ListenerContainer<S>[];
  options: Required<StateConstructionParams>;
};

const DEFAULT_OPTIONS: Required<StateConstructionParams> = {
  listenersErrorHandling: 'warn',
};

//-------------------------------------------------------

/**
 * Reactive state container backed by [immer](https://immerjs.github.io/immer/).
 *
 * The default choice. Use `update(draft => { ... })` to mutate state deeply
 * without writing spread boilerplate — immer handles structural sharing under
 * the hood. `update({ field })` is available as a shorthand shallow merge.
 *
 * Use `updatePure()` for explicit immutable updates without immer recipes.
 *
 * @example
 * ```ts
 * const state = new ReactiveState({ count: 0 });
 * state.update(draft => { draft.count++; });
 * ```
 */
export class ReactiveState<S> implements StateApi<S> {
  protected _shared: Shared<S>;

  constructor(initial: S, options?: StateConstructionParams) {
    this._shared = {
      initial,
      state: initial,
      listeners: [],
      options: { ...DEFAULT_OPTIONS, ...options },
    };
  }

  get(): ReadonlyDeep<S> {
    return makeReadOnlyDeep(this._shared.state);
  }

  getInitialState(): ReadonlyDeep<S> {
    return makeReadOnlyDeep(this._shared.initial);
  }

  set(state: S): void {
    const prev = this._shared.state;
    if (Object.is(prev, state)) return;

    this._shared.state = state;
    const listeners = [...this._shared.listeners];
    for (const container of listeners) {
      container.listener(makeReadOnlyDeep(state), makeReadOnlyDeep(prev));
    }
  }

  subscribe(listener: StateListener<S>): UnsubscribeFn {
    const safeListener: StateListener<S> = (state, prev) => {
      try {
        listener(state, prev);
      } catch (error) {
        this._handleListenerException(error);
      }
    };
    const container: ListenerContainer<S> = { listener: safeListener };
    this._shared.listeners.push(container);

    safeListener(this.get(), undefined);

    return () => {
      this._shared.listeners = this._shared.listeners.filter((x) => x !== container);
    };
  }

  select<U>(selector: StateSelectFn<S, U>): StateClient<U> {
    return new StateSelector_imp(this, selector);
  }

  createClient(): StateClient<S> {
    return new StateClient_imp(this);
  }

  update(recipe: Partial<S> | ((draft: Draft<S>) => void)): void {
    const prev = this._shared.state;
    let next: S;
    if (typeof recipe === 'function') {
      if (typeof prev !== 'object' || prev === null) {
        throw new Error(
          'update() with a recipe is not supported for primitive state. Use set() instead.',
        );
      }
      next = produce(prev, (draft) => {
        recipe(draft);
      });
    } else {
      next = isPlainObject(prev) ? { ...prev, ...recipe } : (recipe as S);
    }
    this.set(next);
  }

  updatePure(state: Partial<S> | ((state: ReadonlyDeep<S>) => S)): void {
    const prev = this._shared.state;
    const next: S =
      typeof state === 'function'
        ? state(makeReadOnlyDeep(prev))
        : isPlainObject(prev)
          ? { ...prev, ...state }
          : (state as S);
    this.set(next);
  }
  //-------------------------------------------------------
  //-- helpers
  //-------------------------------------------------------

  private _handleListenerException(err: unknown) {
    const handling = this._shared.options.listenersErrorHandling;

    if (handling === 'throw') {
      throw err;
    }

    if (typeof handling === 'function') {
      handling(err);
      return;
    }

    const msg = `[${this.constructor.name}] listener error`;

    switch (handling) {
      case 'ignore':
        break;
      case 'log':
        console.log(msg, err);
        break;
      case 'warn':
        console.warn(msg, err);
        break;
      case 'error':
        console.error(msg, err);
        break;
      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _: never = handling;
        break;
      }
    }
  }
}
