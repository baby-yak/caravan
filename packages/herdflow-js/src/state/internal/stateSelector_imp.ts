import type { UnsubscribeFn } from '../../core/types.js';
import type { ReadonlyDeep, StateClient, StateListener, StateSelectFn } from '../types/types.js';
import { MARKER_STATE_CLIENT } from './symbols.js';
import { makeReadOnlyDeep } from './utils.js';

export class StateSelector_imp<S, U> implements StateClient<U> {
  //instance marker
  readonly [MARKER_STATE_CLIENT] = true as const;

  private source: StateClient<S>;
  private fn: StateSelectFn<S, U>;

  constructor(state: StateClient<S>, fn: StateSelectFn<S, U>) {
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

  select<W>(selector: StateSelectFn<U, W>): StateClient<W> {
    const fn: StateSelectFn<S, W> = (state) => {
      const sub = makeReadOnlyDeep(this.fn(state));
      return selector(sub);
    };
    return new StateSelector_imp(this.source, fn);
  }
}
