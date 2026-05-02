import type { ListenersErrorHandlingType } from '../../core/types.js';
import type { CombinedEvents } from '../internal/types.js';
import type { EventClient } from './eventClient.js';

export type EventMap = {
  [event: string]: (...args: any[]) => void;
};

export type EventListener<
  T_EventMap extends EventMap,
  T_Event extends EventNames<T_EventMap>,
> = CombinedEvents<T_EventMap>[T_Event];

export type EventNames<T_Map extends EventMap> = keyof CombinedEvents<T_Map> & string;

export type EventParams<T_Map extends EventMap, T_Event extends EventNames<T_Map>> = Parameters<
  CombinedEvents<T_Map>[T_Event]
>;

//-------------------------------------------------------
// config and construction
//-------------------------------------------------------
export type EventListenersErrorHandlingType = ListenersErrorHandlingType<
  (event: string, error: unknown) => void
>;

export type EventsConstructionParams = {
  /** per event. \
   * default is 10 */
  maxListeners?: number;

  /** how to handle when a listener throws an error \
   * default is "warn" */
  listenersErrorHandling?: EventListenersErrorHandlingType;
};

export type EventGroupContext<T_EventMap extends EventMap = EventMap> = {
  client: EventClient<T_EventMap>;
  detachGroup: (event?: EventNames<T_EventMap>) => void;
};
