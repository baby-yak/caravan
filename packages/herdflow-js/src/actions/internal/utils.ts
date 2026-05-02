import type { ActionClient, ActionHandler, ActionMap } from '../types/types.js';
import { MARKER_ACTION_CLIENT } from './symbols.js';
import type { ActionExecutionMapping } from './types.js';

export function createInvoker<T_Map extends ActionMap>(
  executer: ActionExecutionMapping<T_Map>,
): ActionClient<T_Map> {
  return new Proxy(
    {},
    {
      get(target, prop) {
        // MARKER_ACTION_CLIENT instance identifier
        if (prop === MARKER_ACTION_CLIENT) {
          return true;
        }

        //should only be string action names
        if (typeof prop !== 'string') {
          return undefined;
        }

        let handler: ActionHandler<T_Map, any> | undefined;

        //first look in mapping (this can also be viewed as overrides)
        handler = executer.mapping.get(prop);
        if (handler) {
          return handler;
        }

        //then look in .executionTarget:
        //(return a bound method!)
        handler = executer.executionTarget?.[prop] as ActionHandler<T_Map, any> | undefined;
        if (handler) {
          return handler.bind(executer.executionTarget);
        }

        //oh my
        throw new Error(`Action [${prop}] was not implemented`);
      },
    },
  ) as ActionClient<T_Map>;
}
