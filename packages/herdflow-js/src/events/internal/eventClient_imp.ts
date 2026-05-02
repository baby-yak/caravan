import type { EventMap } from '../types/types.js';
import { EventClient_base } from './eventClient_base.js';

export class EventClient_imp<
  T_EventMap extends EventMap = EventMap,
> extends EventClient_base<T_EventMap> {
  // concrete implementor
}
