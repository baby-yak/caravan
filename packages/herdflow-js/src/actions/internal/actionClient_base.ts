import { MARKER_ACTION_CLIENT } from '../../core/internal/brandSymbols.js';
import type { ActionClient, ActionMap, Invoker } from '../types/types.js';

export abstract class ActionClient_base<
  T_Map extends ActionMap = ActionMap,
> implements ActionClient<T_Map> {
  //brand
  readonly [MARKER_ACTION_CLIENT] = true as const;
  
  abstract readonly invoke: Invoker<T_Map>;
}
