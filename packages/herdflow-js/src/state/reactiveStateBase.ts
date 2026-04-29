import type { UnsubscribeFn } from '../core/types.js';
import { StateClient_imp } from './internal/stateClient_imp.js';
import { StateSelector } from './stateSelector.js';
import {
  type ReadonlyDeep,
  type StateApiBase,
  type StateClient,
  type StateConstructionParams,
  type StateListener,
  type StateSelectFn,
} from './types/types.js';
import { makeReadOnlyDeep } from './utils.js';

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

export abstract class ReactiveStateBase<S> implements StateApiBase<S> {
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
    return new StateSelector(this, selector);
  }

  getClient(): StateClient<S> {
    return new StateClient_imp(this);
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
        const _: never = handling;
        break;
      }
    }
  }
}
