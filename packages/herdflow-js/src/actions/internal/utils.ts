import type { ActionClient, ActionHandler, ActionMap } from '../types/types.js';
import type { ActionExecutionMapping } from './types.js';

export function createInvoker<T_Map extends ActionMap>(
  executer: ActionExecutionMapping<T_Map>,
): ActionClient<T_Map> {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop !== 'string') {
          throw new Error(`tried to execute action with a non string identifier...`);
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
