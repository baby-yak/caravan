import type { StateListener, StateSelectFn, StateSource } from '../types/types.js';

export class StateSource_imp<S> implements StateSource<S> {
  private source: StateSource<S>;

  constructor(source: StateSource<S>) {
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
