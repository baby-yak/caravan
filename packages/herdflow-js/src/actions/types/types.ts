//-------------------------------------------------------
//-- map
//-------------------------------------------------------

export type ActionMap = {
  [action: string]: (...args: any[]) => any;
};

//-------------------------------------------------------
//-- utils types
//-------------------------------------------------------

export type ActionNames<T_Map extends ActionMap> = keyof T_Map;
export type ActionParams<T_Map extends ActionMap, T_Action extends ActionNames<T_Map>> = Parameters<
  T_Map[T_Action]
>;
export type ActionHandler<
  T_Map extends ActionMap,
  T_Action extends ActionNames<T_Map>,
> = T_Map[T_Action];

//-------------------------------------------------------
//-- main interfaces
//-------------------------------------------------------
// export type ActionsClient<T_Map extends ActionMap = ActionMap> = {
//   [K in keyof T_Map]: T_Map[K];
// } & {
//   // call signature
//   //   <T_Action extends ActionNames<T_Map>>(action: T_Action): ActionHandler<T_Map, T_Action>;
// };

export type ActionInvoker<T_Map extends ActionMap> = { [K in keyof T_Map]: T_Map[K] };

export type ActionsBase<T_Map extends ActionMap = ActionMap> = {
  readonly invoke: ActionInvoker<T_Map>;

  setHandler<T_Action extends ActionNames<T_Map>>(
    action: T_Action,
    handler: ActionHandler<T_Map, T_Action>,
  ): void;

  setHandler(mapping: { [K in keyof T_Map]: ActionHandler<T_Map, K> }): void;

  setHandler<T_Handler extends object>(
    handler: T_Handler,
    mapping: { [K in ActionNames<T_Map>]: keyof T_Handler },
  ): void;
};
