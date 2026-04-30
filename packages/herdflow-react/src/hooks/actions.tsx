import {
  type ActionClient,
  type ActionMap,
  type ActionNames,
  type ServiceClient,
} from '@baby-yak/herdflow-js';
import { extractActions } from '../utils.js';


/**
 * Returns a typed action function from a service or action client.
 * Equivalent to calling `services.myService.actions.someAction` directly —
 * just a typed convenience wrapper for uniform hook-style access.
 *
 * @param target an `ActionClient` or a `ServiceClient` with actions
 * @param action the action name to retrieve
 */
export function useAction<T_ActionMap extends ActionMap, T_Action extends ActionNames<T_ActionMap>>(
  target: ActionClient<T_ActionMap> | ServiceClient<{ actions: T_ActionMap }>,
  action: T_Action,
) {
  return extractActions(target)[action];
}
