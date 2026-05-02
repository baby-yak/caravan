import type { ActionMap, Invoker } from '../types/types.js';
import { ActionClient_base } from './actionClient_base.js';

export class ActionsClient_imp<
  T_Map extends ActionMap = ActionMap,
> extends ActionClient_base<T_Map> {
  readonly invoke: Invoker<T_Map>;

  constructor(invoke: Invoker<T_Map>) {
    super();
    this.invoke = invoke;
  }
}
