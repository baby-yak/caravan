import { ActionExecutionMapping } from './internal/types.js';
import { createInvoker } from './internal/utils.js';
import type {
  ActionClient,
  ActionHandler,
  ActionMap,
  ActionNames,
  ActionsBase,
} from './types/types.js';

export class ActionsExecuter<T_Map extends ActionMap = ActionMap> implements ActionsBase<T_Map> {
  readonly invoke: ActionClient<T_Map>;

  private _exec = new ActionExecutionMapping<T_Map>();

  constructor() {
    //create the invoker
    this.invoke = createInvoker(this._exec);
  }

  //-------------------------------------------------------
  //-- setHandler
  //-------------------------------------------------------

  setHandler<T_Action extends ActionNames<T_Map>>(
    action: T_Action,
    handlerFn: ActionHandler<T_Map, T_Action>,
  ): this;
  setHandler(handler: T_Map): this;

  setHandler(action_or_handler: unknown, handlerFn?: unknown): this {
    if (typeof action_or_handler === 'object') {
      const handler = action_or_handler as T_Map & ActionMap;
      return this._setHandler_obj(handler);
    } else {
      const action = action_or_handler as string | number;
      return this._setHandler_fn(action, handlerFn as ActionHandler<T_Map, typeof action>);
    }
  }
  private _setHandler_fn<T_Action extends string | number>(
    action: T_Action,
    handlerFn: ActionHandler<T_Map, T_Action>,
  ) {
    this._exec.mapping.set(action, handlerFn);
    return this;
  }

  private _setHandler_obj(handler: T_Map) {
    this._exec.executionTarget = handler;
    return this;
  }

  getClient(): ActionClient<T_Map> {
    return createInvoker(this._exec);
  }
}
