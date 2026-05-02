import type { StateListener, StateSelectFn, StateClient } from '../types/types.js';
import { MARKER_STATE_CLIENT } from './symbols.js';

export class StateClient_imp<S> implements StateClient<S> {
  //instance marker
  readonly [MARKER_STATE_CLIENT] = true as const;

  private source: StateClient<S>;

  constructor(source: StateClient<S>) {
    this.source = source;
  }
  get() {
    return this.source.get();
  }

  getInitialState() {
    return this.source.getInitialState();
  }
  subscribe(listener: StateListener<S>) {
    return this.source.subscribe(listener);
  }
  select<U>(selector: StateSelectFn<S, U>) {
    return this.source.select(selector);
  }
}
