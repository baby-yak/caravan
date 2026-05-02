import { MARKER_EVENT_EMITTER } from '../../core/internal/brandSymbols.js';
import type { EventMap } from '../types/index.js';
import { EventClient_base } from './eventClient_base.js';

export abstract class EventEmitter_base<
  T_EventMap extends EventMap = EventMap,
> extends EventClient_base<T_EventMap> {
  //brand
  readonly [MARKER_EVENT_EMITTER] = true as const;
}
