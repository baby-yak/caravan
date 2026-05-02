import { MARKER_ACTION_CLIENT } from '../../core/internal/brandSymbols.js';
import type { ActionClient, ActionMap, Invoker } from '../types/types.js';

export class ActionsClient_imp<T_Map extends ActionMap = ActionMap> implements ActionClient<T_Map> {
  readonly [MARKER_ACTION_CLIENT] = true as const;
  readonly invoke: Invoker<T_Map>;

  constructor(invoke: Invoker<T_Map>) {
    this.invoke = invoke;
  }
}
