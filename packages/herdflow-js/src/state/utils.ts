import { targetIs } from '../utils/utils.js';
import { MARKER_REACTIVE_STATE, MARKER_STATE_CLIENT } from './internal/symbols.js';
import type { ReactiveState } from './reactiveState.js';
import type { StateClient } from './types/types.js';

export function isReactiveState(obj: any): obj is ReactiveState<any> {
  return targetIs(obj, MARKER_REACTIVE_STATE);
}

export function isStateClient(obj: any): obj is StateClient<any> {
  return targetIs(obj, MARKER_STATE_CLIENT);
}
