import { CombinedEvents } from './internal/types.js';

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

export type ListenersErrorHandlingType =
  | 'ignore'
  | 'log'
  | 'warn'
  | 'error'
  | 'throw'
  | ((event: string, err: unknown) => void);

export type ConstructionParams = {
  /** per event. \
   * default is 10 */
  maxListeners?: number;

  /** how to handle when a listener throws an error \
   * default is "warn" */
  listenersErrorHandling?: ListenersErrorHandlingType;
};
