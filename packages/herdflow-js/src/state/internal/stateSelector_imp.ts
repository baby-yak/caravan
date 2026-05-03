import type { UnsubscribeFn } from '../../core/types.js';
import type { StateClient, StateListener, StateSelectFn } from '../types/types.js';
import { StateClient_base } from './stateClient_base.js';

export class StateSelector_imp<S, U> extends StateClient_base<U> {
  private source: StateClient<S>;
  private fn: StateSelectFn<S, U>;

  constructor(state: StateClient<S>, fn: StateSelectFn<S, U>) {
    super();

    this.source = state;
    this.fn = fn;
  }

  get(): U {
    const state = this.source.get();
    const select = this.fn(state);
    return select;
  }
  getInitialState(): U {
    const state = this.source.getInitialState();
    const select = this.fn(state);
    return select;
  }
  subscribe(listener: StateListener<U>): UnsubscribeFn {
    let prev: U | undefined = undefined;

    return this.source.subscribe((state) => {
      // no change on selected value - NOOP
      // (do run first time though)

      const selected = this.fn(state);

      if (prev !== undefined && Object.is(prev, selected)) {
        return;
      }

      listener(selected, prev);
      prev = selected;
    });
  }
  select<W>(selector: StateSelectFn<U, W>): StateClient<W> {
    const fn: StateSelectFn<S, W> = (state) => {
      const sub = this.fn(state);
      return selector(sub);
    };
    return new StateSelector_imp(this.source, fn);
  }
}
