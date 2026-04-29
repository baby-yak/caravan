import type {
  ActionHandler,
  ActionInvoker,
  ActionMap,
  ActionNames,
  ActionsBase,
} from './types/types.js';

type Shared<T_Map extends ActionMap> = {
  mapping: Map<ActionNames<T_Map>, ActionHandler<T_Map, any>>;
  invoke: ActionInvoker<T_Map>;
};

export class Actions<T_Map extends ActionMap = ActionMap> implements ActionsBase {
    private _shared = 
  private _mapping: Map<ActionNames<T_Map>, ActionHandler<T_Map, any>> = new Map();
  private _invoke: ActionInvoker<T_Map>;

  get invoke() {
    return this._invoke;
  }

  constructor() {
    const mapping = this._mapping;
    this._invoke = new Proxy(
      {},
      {
        get(target, prop) {
          prop = String(prop);
          const handler = mapping.get(prop);
          if (handler) {
            return handler;
          }
          throw new Error(`Action [${prop}] was not implemented`);
        },
      },
    ) as ActionInvoker<T_Map>;
  }

  setHandler<T_Action extends string | number>(
    action: T_Action,
    handler: ActionHandler<ActionMap, T_Action>,
  ): void;
  setHandler(mapping: { [x: string]: (...args: any[]) => any }): void;
  setHandler<T_Handler extends object>(
    handler: T_Handler,
    mapping: { [x: string]: keyof T_Handler; [x: number]: keyof T_Handler },
  ): void;
  setHandler(handler: unknown, mapping?: unknown): void {
    throw new Error('Method not implemented.');
  }
}
