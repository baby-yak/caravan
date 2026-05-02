import type { ActionExecuter } from '../actions/actionExecuter.js';
import type { ActionClient } from '../actions/types/types.js';
import type { TypedEventEmitter } from '../events/typedEventEmitter.js';
import type { EventClient } from '../events/types/eventClient.js';
import type { Module, ModuleClient } from '../modules/types/types.js';
import type { Service } from '../services/service.js';
import type { ServiceClient } from '../services/types/serviceClient.js';
import type { ServiceDescriptor } from '../services/types/types.js';
import type { ReactiveState } from '../state/reactiveState.js';
import type { StateClient } from '../state/types/types.js';
import { targetIs } from '../utils/utils.js';
import {
  MARKER_ACTION_CLIENT,
  MARKER_ACTION_EXECUTER,
  MARKER_EVENT_CLIENT,
  MARKER_EVENT_EMITTER,
  MARKER_MODULE,
  MARKER_MODULE_CLIENT,
  MARKER_REACTIVE_STATE,
  MARKER_SERVICE,
  MARKER_SERVICE_CLIENT,
  MARKER_STATE_CLIENT,
} from './internal/brandSymbols.js';

export function isActionExecuter(obj: unknown): obj is ActionExecuter<any> {
  return targetIs(obj, MARKER_ACTION_EXECUTER);
}
export function isActionClient(obj: unknown): obj is ActionClient<any> {
  return targetIs(obj, MARKER_ACTION_CLIENT);
}

export function isEventEmitter(obj: unknown): obj is TypedEventEmitter<any> {
  return targetIs(obj, MARKER_EVENT_EMITTER);
}
export function isEventClient(obj: unknown): obj is EventClient<any> {
  return targetIs(obj, MARKER_EVENT_CLIENT);
}

export function isStateClient(obj: unknown): obj is StateClient<any> {
  return targetIs(obj, MARKER_STATE_CLIENT);
}
export function isReactiveState(obj: unknown): obj is ReactiveState<any> {
  return targetIs(obj, MARKER_REACTIVE_STATE);
}

export function isServiceClient(obj: unknown): obj is ServiceClient<any> {
  return targetIs(obj, MARKER_SERVICE_CLIENT);
}
export function isService<T extends ServiceDescriptor>(obj: unknown): obj is Service<T> {
  return targetIs(obj, MARKER_SERVICE);
}

export function isModuleClient(obj: unknown): obj is ModuleClient<any> {
  return targetIs(obj, MARKER_MODULE_CLIENT);
}
export function isModule(obj: unknown): obj is Module<any> {
  return targetIs(obj, MARKER_MODULE);
}
