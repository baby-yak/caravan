import type { EventClient, EventMap, EventNames } from './index.js';

export interface EventListenerContainer<
  T_EventMap extends EventMap = EventMap,
> extends EventClient<T_EventMap> {
  /**
   * remove all the listeners that was registered under this source at once
   * @param event if provided - only remove listeners for the specific event
   */
  detachContainer(event?: EventNames<T_EventMap>): void;
}
