import {
  type ServiceClient,
  type ActionClient,
  type ActionMap,
  type EventClient,
  type EventMap,
  type StateClient,
  isServiceClient,
} from '@baby-yak/herdflow-js';

export function extractActions<A extends ActionMap>(
  target: ActionClient<A> | ServiceClient<{ actions: A }>,
): ActionClient<A> {
  if (isServiceClient(target)) {
    return target.actions as ActionClient<A>;
  }
  return target;
}
export function extractEvents<E extends EventMap>(
  target: EventClient<E> | ServiceClient<{ events: E }>,
): EventClient<E> {
  if (isServiceClient(target)) {
    return target.events as EventClient<E>;
  }
  return target;
}
export function extractState<S>(
  target: StateClient<S> | ServiceClient<{ state: S }>,
): StateClient<S> {
  if (isServiceClient(target)) {
    return target.state;
  }
  return target;
}
