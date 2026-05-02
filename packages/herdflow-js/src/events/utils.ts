import { targetIs } from '../utils/utils.js';
import { MARKER_EVENT_CLIENT, MARKER_EVENT_EMITTER } from './internal/symbols.js';
import type { TypedEventEmitter } from './typedEventEmitter.js';
import type { EventClient } from './types/eventClient.js';

export function isEventEmitter(obj: any): obj is TypedEventEmitter<any> {
  return targetIs(obj, MARKER_EVENT_EMITTER);
}

export function isEventClient(obj: any): obj is EventClient<any> {
  return targetIs(obj, MARKER_EVENT_CLIENT);
}
