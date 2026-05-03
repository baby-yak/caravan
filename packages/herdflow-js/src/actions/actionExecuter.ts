import { ActionExecuter_base } from './internal/actionExecuter_base.js';
import { ActionsClient_imp } from './internal/actionsClient_imp.js';
import { ActionExecutionMapping } from './internal/types.js';
import { createInvoker } from './internal/utils.js';
import type {
  ActionClient,
  ActionHandler,
  ActionMap,
  ActionNames,
  ActionsConstructionParams,
  Invoker,
} from './types/types.js';

export class ActionExecuter<
  T_Map extends ActionMap = ActionMap,
> extends ActionExecuter_base<T_Map> {
  readonly invoke: Invoker<T_Map>;

  private _exec = new ActionExecutionMapping<T_Map>();
  readonly client: ActionClient<T_Map>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_params?: ActionsConstructionParams) {
    super();

    //create the invoker
    this.invoke = createInvoker(this._exec);
    this.client = new ActionsClient_imp(this.invoke);
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
    //null check
    if (action_or_handler == null) {
      throw new Error("Handler can't be null");
    }

    //handler executor object
    if (typeof action_or_handler === 'object') {
      const handler = action_or_handler as T_Map & ActionMap;
      return this._setHandler_obj(handler);
    }

    //handler function for a specific method
    const action = action_or_handler as string | number;
    return this._setHandler_fn(action, handlerFn as ActionHandler<T_Map, typeof action>);
  }

  //-------------------------------------------------------
  //-- internal
  //-------------------------------------------------------
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
}
