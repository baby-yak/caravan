import { MARKER_ACTION_EXECUTER } from '../../core/internal/brandSymbols.js';
import type { ActionMap } from '../types/types.js';
import { ActionClient_base } from './actionClient_base.js';

export abstract class ActionExecuter_base<
  T_Map extends ActionMap = ActionMap,
> extends ActionClient_base<T_Map> {
  //brand
  readonly [MARKER_ACTION_EXECUTER] = true as const;
}
