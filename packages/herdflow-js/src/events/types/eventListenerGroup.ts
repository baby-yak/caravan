import type { EventClient, EventMap, EventNames } from './index.js';

export interface EventListenerGroup<
  T_EventMap extends EventMap = EventMap,
> extends EventClient<T_EventMap> {
  /**
   * remove all the listeners that was registered under this group at once
   * @param event if provided - only remove listeners for the specific event
   */
  detachGroup(event?: EventNames<T_EventMap>): void;
}
