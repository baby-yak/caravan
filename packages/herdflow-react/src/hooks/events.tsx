import {
  type EventClient,
  type EventListener,
  type EventMap,
  type EventNames,
  type ServiceClient,
} from '@baby-yak/herdflow-js';
import { type DependencyList, useEffect } from 'react';
import { extractEvents } from '../utils.js';

export function useEvent<EVENTS extends EventMap, EVENTNAME extends EventNames<EVENTS>>(
  target: EventClient<EVENTS> | ServiceClient<{ events: EVENTS }>,
  event: EVENTNAME,
  listener: EventListener<EVENTS, EVENTNAME>,
  deps?: DependencyList,
) {
  useEffect(() => {
    return extractEvents(target).subscribe(event, listener);
  }, deps ?? []);
}
