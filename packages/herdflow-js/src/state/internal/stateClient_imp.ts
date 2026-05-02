import type { StateClient, StateListener, StateSelectFn } from '../types/types.js';
import { StateClient_base } from './stateClient_base.js';

export class StateClient_imp<S> extends StateClient_base<S> {
  private source: StateClient<S>;

  constructor(source: StateClient<S>) {
    super();
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
