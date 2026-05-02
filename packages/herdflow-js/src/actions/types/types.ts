import type { MARKER_ACTION_CLIENT } from '../../core/internal/brandSymbols.js';

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

export type Invoker<T_Map extends ActionMap = ActionMap> = { [K in keyof T_Map]: T_Map[K] };

export interface ActionClient<T_Map extends ActionMap = ActionMap> {
  readonly [MARKER_ACTION_CLIENT]: true;
  readonly invoke: Invoker<T_Map>;
}

//export type ActionsConstructionParams = {};
export type ActionsConstructionParams = object;
