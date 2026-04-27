import type { UnsubscribeFn } from '../core/types.js';
import type { ReadonlyDeep, StateListener, StateSelectFn, StateSource } from './types/types.js';
import { makeReadOnlyDeep } from './utils.js';

export class StateSelector<S, U> implements StateSource<U> {
  private source: StateSource<S>;
  private fn: StateSelectFn<S, U>;

  constructor(state: StateSource<S>, fn: StateSelectFn<S, U>) {
    this.source = state;
    this.fn = fn;
  }

  get(): ReadonlyDeep<U> {
    const state = this.source.get();
    const select = this.fn(state);
    return makeReadOnlyDeep(select);
  }

  getInitialState(): ReadonlyDeep<U> {
    const state = this.source.getInitialState();
    const select = this.fn(state);
    return makeReadOnlyDeep(select);
  }

  subscribe(listener: StateListener<U>): UnsubscribeFn {
    let prev: ReadonlyDeep<U> | undefined = undefined;

    return this.source.subscribe((state) => {
      // no change on selected value - NOOP
      // (do run first time though)

      const selected = makeReadOnlyDeep(this.fn(state));

      if (prev !== undefined && Object.is(prev, selected)) {
        return;
      }

      listener(selected, prev);
      prev = selected;
    });
  }

  select<W>(selector: StateSelectFn<U, W>): StateSource<W> {
    const fn: StateSelectFn<S, W> = (state) => {
      const sub = makeReadOnlyDeep(this.fn(state));
      return selector(sub);
    };
    return new StateSelector(this.source, fn);
  }
}
