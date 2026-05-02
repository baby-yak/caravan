import type { ActionHandler, ActionMap, Invoker } from '../types/types.js';
import type { ActionExecutionMapping } from './types.js';

export function createInvoker<T_Map extends ActionMap>(
  executer: ActionExecutionMapping<T_Map>,
): Invoker<T_Map> {
  return new Proxy(
    {},
    {
      get(target, prop) {
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
  ) as Invoker<T_Map>;
}
