import { enableMapSet, produce, type Draft } from 'immer';
import type { UnsubscribeFn } from '../core/types.js';
import { ReactiveState_base } from './internal/reactiveState_base.js';
import { StateClient_imp } from './internal/stateClient_imp.js';
import { StateSelector_imp } from './internal/stateSelector_imp.js';
import { isPlainObject } from './internal/utils.js';
import {
  type StateClient,
  type StateConstructionParams,
  type StateListener,
  type StateSelectFn,
} from './types/types.js';

//-------------------------------------------------------
// -- enables immer Map/Set support globally — see README
enableMapSet();

//-------------------------------------------------------
//-- types

type ListenerContainer<S> = {
  listener: StateListener<S>;
};

const DEFAULT_OPTIONS: Required<StateConstructionParams> = {
  listenersErrorHandling: 'warn',
};

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
export class ReactiveState<S> extends ReactiveState_base<S> {
  //instance marker

  private _initial: S;
  private _state: S;
  private _listeners: ListenerContainer<S>[];
  private _options: Required<StateConstructionParams>;

  /**
   * Returns a {@link StateClient} facade that exposes only the read-only interface.
   * Safe to hand to consumers that should not be able to mutate state.
   */
  readonly client: StateClient<S>;

  constructor(initial: S, options?: StateConstructionParams) {
    super();

    this._initial = initial;
    this._state = initial;
    this._listeners = [];
    this._options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.client = new StateClient_imp(this);
  }

  get<U = S>(select?: StateSelectFn<S, U>): U {
    if (select) {
      return select(this._state);
    } else {
      return this._state as unknown as U;
    }
  }

  getInitialState(): S {
    return this._initial;
  }

  /** Replaces the state. No-ops if the new value is the same reference (`Object.is`). */
  set(state: S): void {
    const prev = this._state;
    if (Object.is(prev, state)) return;

    this._state = state;
    const listeners = [...this._listeners];
    for (const container of listeners) {
      container.listener(state, prev);
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
    this._listeners.push(container);

    safeListener(this.get(), undefined);

    return () => {
      this._listeners = this._listeners.filter((x) => x !== container);
    };
  }

  select<U>(selector: StateSelectFn<S, U>): StateClient<U> {
    return new StateSelector_imp(this, selector);
  }

  /**
   * Updates the state in one of two ways:
   * - **Partial object** — shallow-merges into the current state (plain objects only; others are replaced wholesale).
   * - **Immer recipe** — receives a mutable draft; deep changes are applied structurally.
   *   Not supported for primitive state — use {@link set} instead.
   */
  update(recipe: Partial<S> | ((draft: Draft<S>) => void)): void {
    const prev = this._state;
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

  /**
   * Updates the state in one of two ways:
   * - **Partial object** — shallow-merges into the current state (plain objects only; others are replaced wholesale).
   * - **Pure reducer** — receives the current (deeply readonly) state and must return the new state.
   */
  updatePure(state: Partial<S> | ((state: S) => S)): void {
    const prev = this._state;
    const next: S =
      typeof state === 'function'
        ? state(prev)
        : isPlainObject(prev)
          ? { ...prev, ...state }
          : (state as S);
    this.set(next);
  }
  //-------------------------------------------------------
  //-- helpers
  //-------------------------------------------------------

  private _handleListenerException(err: unknown) {
    const handling = this._options.listenersErrorHandling;

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
