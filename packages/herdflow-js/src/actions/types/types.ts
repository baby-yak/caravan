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
// export type ActionClient<T_Map extends ActionMap = ActionMap> = {
//   [K in keyof T_Map]: T_Map[K];
// } & {
//   // call signature
//   //   <T_Action extends ActionNames<T_Map>>(action: T_Action): ActionHandler<T_Map, T_Action>;
// };

export type ActionClient<T_Map extends ActionMap> =
  //basically a map from action name -> action function
  { [K in keyof T_Map]: T_Map[K] };

export interface ActionsBase<T_Map extends ActionMap = ActionMap> {
  readonly invoke: ActionClient<T_Map>;

  setHandler<T_Action extends ActionNames<T_Map>>(
    action: T_Action,
    handlerFn: ActionHandler<T_Map, T_Action>,
  ): this;

  setHandler(handler: T_Map): this;

  getClient(): ActionClient<T_Map>;
}
