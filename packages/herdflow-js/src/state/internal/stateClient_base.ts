import { MARKER_STATE_CLIENT } from '../../core/internal/brandSymbols.js';
import type { UnsubscribeFn } from '../../core/types.js';
import type { StateClient, StateListener, StateSelectFn } from '../types/types.js';

export abstract class StateClient_base<S> implements StateClient<S> {
  //brand
  readonly [MARKER_STATE_CLIENT] = true as const;

  abstract get(): S;
  abstract getInitialState(): S;
  abstract subscribe(listener: StateListener<S>): UnsubscribeFn;
  abstract select<U>(selector: StateSelectFn<S, U>): StateClient<U>;
}
