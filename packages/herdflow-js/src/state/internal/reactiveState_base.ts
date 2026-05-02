import { MARKER_REACTIVE_STATE } from '../../core/internal/brandSymbols.js';
import { StateClient_base } from './stateClient_base.js';

export abstract class ReactiveState_base<S> extends StateClient_base<S> {
  //brand
  readonly [MARKER_REACTIVE_STATE] = true as const;
}
