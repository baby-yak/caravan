import type { _INTERNAL_ } from '../../core/internal/index.js';
import type { EventListener, EventMap, EventNames, EventParams } from './index.js';

export type EventClientListenOptions = {
  [_INTERNAL_]?: {
    source?: EventClient;
  };
};
export type DetachClientOptions = {
  [_INTERNAL_]?: {
    source?: EventClient;
  };
};

export interface EventClient<T_EventMap extends EventMap = EventMap> {
  /**
   * Adds a listener and returns an unsubscribe function.
   * Calling the returned function removes the listener.
   *
   * @example
   * ```ts
   * const unsub = emitter.subscribe('click', handler);
   * unsub(); // removes the listener
   * ```
   */
  subscribe<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): () => void;

  /**
   * Adds a listener for the given event. The same function can be added multiple
   * times and will be called once per registration. Returns `this` for chaining.
   */
  on<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this;

  /**
   * Adds a one-time listener. It is automatically removed after the first time
   * the event is emitted. Returns `this` for chaining.
   */
  once<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this;

  /**
   * Adds a one-time listener. It is automatically removed after the first time
   * Calling the returned function removes the listener.
   * (whichever happens first )
   */
  subscribeOnce<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): () => void;

  /** Alias for `on()`. */
  addListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this;

  /**
   * Adds a listener at the front of the call queue so it is called before
   * any previously registered listeners. Returns `this` for chaining.
   */
  prependListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this;

  /** Like `prependListener`, but auto-removes after the first emit. */
  prependOnceListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this;

  /**
   * Returns a `Promise` that resolves with the event's arguments the next time
   * the event fires, then auto-removes the listener.
   *
   * Pass an `AbortSignal` to cancel the wait — the promise will reject with an
   * `Error('aborted')`. If the signal is already aborted when `waitFor` is
   * called, the promise rejects immediately.
   *
   * @example
   * ```ts
   * // basic
   * const [userId] = await emitter.waitFor('userJoined');
   *
   * // with timeout (Node ≥ 18)
   * const [userId] = await emitter.waitFor('userJoined', {
   *   signal: AbortSignal.timeout(5000),
   * });
   * ```
   */
  waitFor<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    options?: EventClientListenOptions & { signal?: AbortSignal },
  ): Promise<EventParams<T_EventMap, T_Event>>;

  /**
   * Removes the first matching registration of `listener` for `event`.
   * If the same function was registered multiple times, only the first is removed.
   * Returns `this` for chaining.
   */
  off<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
  ): this;

  /** Alias for `off()`. */
  removeListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
  ): this;

  /**
   * creates a client for just listening to events  \
   * also acts a "bucket" for event listening, that can be removed in a single call to detachSource()
   */
  createClient(): EventClient<T_EventMap>;

  /**
   * remove all the listeners that was registered under this source at once
   */
  detachClientListeners(event?: EventNames<T_EventMap>, options?: DetachClientOptions): this;
}
