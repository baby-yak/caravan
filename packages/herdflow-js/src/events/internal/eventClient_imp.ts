import type { EventMap } from '../types/types.js';
import { EventClientBase } from './eventClientBase.js';

export class EventClient_imp<
  T_EventMap extends EventMap = EventMap,
> extends EventClientBase<T_EventMap> {
  // concrete implementor
}
