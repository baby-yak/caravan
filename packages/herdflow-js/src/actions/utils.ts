import { targetIs } from '../utils/utils.js';
import type { ActionExecuter } from './actionExecuter.js';
import { MARKER_ACTION_CLIENT, MARKER_ACTION_EXECUTER } from './internal/symbols.js';
import type { ActionClient } from './types/types.js';

export function isActionExecuter(obj: any): obj is ActionExecuter<any> {
  return targetIs(obj, MARKER_ACTION_EXECUTER);
}

export function isActionClient(obj: any): obj is ActionClient<any> {
  return targetIs(obj, MARKER_ACTION_CLIENT);
}
