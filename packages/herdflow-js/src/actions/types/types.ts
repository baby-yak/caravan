//-------------------------------------------------------
//-- map
//-------------------------------------------------------

import type { MARKER_ACTION_CLIENT, MARKER_ACTION_EXECUTER } from '../internal/symbols.js';

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
export type ActionReturnType<
  T_Map extends ActionMap,
  T_Action extends ActionNames<T_Map>,
> = ReturnType<T_Map[T_Action]>;
export type ActionHandler<
  T_Map extends ActionMap,
  T_Action extends ActionNames<T_Map>,
> = T_Map[T_Action];

//-------------------------------------------------------
//-- main interfaces
//-------------------------------------------------------

export type ActionClient<T_Map extends ActionMap = ActionMap> =
  //basically a map from action name -> action function
  {
    readonly [MARKER_ACTION_EXECUTER]: true;
  } & {
    [K in keyof T_Map]: T_Map[K];
  };

//export type ActionsConstructionParams = {};
export type ActionsConstructionParams = object;
