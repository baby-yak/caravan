import type { EventListener, EventMap, EventNames, EventSource } from '@baby-yak/herdflow-js';
import { type DependencyList, useEffect } from 'react';

export function useEvent<EVENTS extends EventMap, EVENTNAME extends EventNames<EVENTS>>(
  events: EventSource<EVENTS>,
  event: EVENTNAME,
  listener: EventListener<EVENTS, EVENTNAME>,
  deps?: DependencyList,
) {
  useEffect(() => {
    const cleanup = events.subscribe(event, listener);
    return () => {
      cleanup();
    };
  }, deps || []);
}
