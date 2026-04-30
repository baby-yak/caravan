import {
  type ActionClient,
  type ActionMap,
  type ActionNames,
  type ServiceClient,
} from '@baby-yak/herdflow-js';
import { extractActions } from '../utils.js';


export function useAction<T_ActionMap extends ActionMap, T_Action extends ActionNames<T_ActionMap>>(
  target: ActionClient<T_ActionMap> | ServiceClient<{ actions: T_ActionMap }>,
  action: T_Action,
) {
  return extractActions(target)[action];
}
