import { _INTERNAL_ } from '../core/internal/index.js';
import { EventClient_imp } from './internal/eventClient_imp.js';
import {
  type EventNames_Pure,
  type EventNames_Reserved,
  type EventParams_Pure,
  type EventParams_Reserved,
  isReservedEventName,
} from './internal/types.js';
import type { EventClient, EventClientListenOptions } from './types/eventClient.js';
import type {
  DetachClientOptions,
  EventListener,
  EventListenersErrorHandlingType,
  EventMap,
  EventNames,
  EventParams,
  EventsConstructionParams,
} from './types/index.js';

/**
 * container: { listener + metadata}
 */
type Listener<T_EventMap extends EventMap = EventMap> = {
  listener: EventListener<T_EventMap, EventNames<T_EventMap>>;
  postRemoved?: ((event: EventNames<T_EventMap>) => void) | undefined;
  once: boolean;
  source?: EventClient | undefined;
};

type Shared<T_EventMap extends EventMap> = {
  listeners: Map<string, Array<Listener<T_EventMap>>>;
  defaultHandlers: Map<string, EventListener<T_EventMap, EventNames<T_EventMap>>>;
  options: Required<EventsConstructionParams>;
};

/**
 * A fully typed event emitter. Pass your event map as the type parameter to get
 * compile-time safety on event names and listener signatures.
 *
 * @example
 * ```ts
 * type AppEvents = {
 *   userJoined: (userId: string) => void;
 *   scoreChanged: (userId: string, score: number) => void;
 * };
 *
 * const emitter = new TypedEventEmitter<AppEvents>();
 * emitter.on('userJoined', (id) => console.log(id));
 * emitter.emit('userJoined', 'alice');
 * ```
 */
export class TypedEventEmitter<
  T_EventMap extends EventMap = EventMap,
> implements EventClient<T_EventMap> {
  private static _GLOBAL_MAX_LISTENERS = 10;

  /** this will be shared for all "copies" of this event emitter / event source */
  private _shared: Shared<T_EventMap>;

  /** Default max listeners for all new instances. Set to `0` or `Infinity` to disable. */
  static set defaultMaxListeners(value: number) {
    this._GLOBAL_MAX_LISTENERS = value;
  }
  static get defaultMaxListeners() {
    return this._GLOBAL_MAX_LISTENERS;
  }

  /** Sets the max listener threshold for this instance. Returns `this` for chaining. */
  setMaxListeners(n: number) {
    this._shared.options.maxListeners = n;
    return this;
  }

  /** Returns the current max listener threshold for this instance. */
  getMaxListeners() {
    return this._shared.options.maxListeners;
  }

  //-------------------------------------------------------
  constructor(params?: EventsConstructionParams) {
    this._shared = {
      listeners: new Map(),
      defaultHandlers: new Map(),
      options: {
        ...{
          maxListeners: TypedEventEmitter._GLOBAL_MAX_LISTENERS,
          listenersErrorHandling: 'warn',
        },
        ...params,
      },
    };

    this._shared.options.maxListeners =
      params?.maxListeners ?? TypedEventEmitter.defaultMaxListeners;
    this._shared.options.listenersErrorHandling = params?.listenersErrorHandling ?? 'warn';
  }
  //-------------------------------------------------------

  /**
   * Sets how listener exceptions are handled. Returns `this` for chaining.
   *
   * - `'warn'` — `console.warn` (default)
   * - `'log'` — `console.log`
   * - `'error'` — `console.error`
   * - `'ignore'` — swallow silently
   * - `'throw'` — rethrow; remaining listeners are not called
   * - `(event, err) => void` — custom handler
   */
  setListenersErrorHandling(e: EventListenersErrorHandlingType) {
    this._shared.options.listenersErrorHandling = e;
    return this;
  }

  /** Returns the current error handling mode. */
  getListenersErrorHandling() {
    return this._shared.options.listenersErrorHandling;
  }

  /**
   * Emits an event, calling all registered listeners in order.
   * Returns `true` if at least one listener was called, `false` otherwise.
   *
   * Only user-defined events can be emitted — internal events (`newListener`,
   * `removeListener`) are fired automatically by the emitter.
   */
  emit<T_Event extends EventNames_Pure<T_EventMap>>(
    event: T_Event,
    ...args: EventParams_Pure<T_EventMap, T_Event>
  ): boolean {
    return this._emit({
      event,
      args,
      emitWildcardEvent: true,
    });
  }

  subscribe<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): () => void {
    const remove = () => this._removeListener({ event, listener });
    this._addListener({ event, listener, options });
    return remove;
  }

  on<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    return this._addListener({ event, listener, options });
  }

  once<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    return this._addListener({ event, listener, options, once: true });
  }

  subscribeOnce<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): () => void {
    this._addListener({ event, listener, options, once: true });
    return () => this._removeListener({ event, listener });
  }

  addListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    return this.on(event, listener, options);
  }

  prependListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    return this._addListener({ event, listener, options, prepend: true });
  }

  prependOnceListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    return this._addListener({ event, listener, options, once: true, prepend: true });
  }

  waitFor<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    options?: EventClientListenOptions & { signal?: AbortSignal },
  ): Promise<EventParams<T_EventMap, T_Event>> {
    return new Promise((resolve, reject) => {
      const signal = options?.signal;
      let handled = false;

      // premature abortion
      if (signal?.aborted) {
        handled = true;
        reject(new Error('aborted'));
        return;
      }

      // handle bort
      const onAbort = () => {
        handled = true;
        this._removeListener({ event, listener });
        reject(new Error('aborted'));
      };
      signal?.addEventListener('abort', onAbort, { once: true });

      // register event (once)
      const listener = ((...args: EventParams<T_EventMap, T_Event>) => {
        handled = true;
        signal?.removeEventListener('abort', onAbort);
        resolve(args);
      }) as EventListener<T_EventMap, T_Event>;

      const postRemoved = () => {
        if (handled) return;
        reject(new Error('removed'));
      };

      ///subscribe
      this._addListener({
        event,
        listener,
        options,
        once: true,
        postRemoved: postRemoved,
      });
    });
  }

  off<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
  ): this {
    return this._removeListener({ event, listener });
  }

  removeListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
  ): this {
    return this._removeListener({ event, listener });
  }

  //-------------------------------------------------------
  //-- DEFAULT HANDLERS
  //-------------------------------------------------------
  setDefaultHandler<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event> | undefined,
  ): this {
    if (listener) {
      this._shared.defaultHandlers.set(
        event,
        listener as EventListener<T_EventMap, EventNames<T_EventMap>>,
      );
    } else {
      this._shared.defaultHandlers.delete(event);
    }

    return this;
  }

  /**
   * Removes all listeners for a specific event, or all listeners for all events
   * if no event is specified. Returns `this` for chaining.
   */
  removeAllListeners(event?: EventNames<T_EventMap>): this {
    if (event) {
      const listeners = this.listeners(event);
      for (const listener of listeners) {
        this._removeListener({
          event,
          listener,
        });
      }
    } else {
      //resource
      const events = [...this._shared.listeners.keys()];
      for (const event of events) {
        this.removeAllListeners(event);
      }
    }
    return this;
  }

  /** Returns the number of listeners registered for the given event. */
  listenerCount(event?: EventNames<T_EventMap>): number {
    if (event) {
      return this._shared.listeners.get(event)?.length ?? 0;
    } else {
      const all = [...this._shared.listeners.values()];
      const count = all.reduce((prev, curr) => prev + curr.length, 0);
      return count;
    }
  }

  /** Returns an array of event names that currently have at least one listener. */
  eventNames() {
    const all = [...this._shared.listeners.keys()];
    const withoutWildcard = all.filter((x) => x !== '*');
    return withoutWildcard;
  }

  /**
   * Returns the wrapped listener functions for the given event — these include
   * the auto-remove logic injected by `once()` and `prependOnceListener()`.
   * Use `rawListeners()` to get the original functions.
   */
  listeners<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
  ): EventListener<T_EventMap, T_Event>[] {
    const listeners = this._shared.listeners.get(event) || [];
    return listeners.map((x) => x.listener) as EventListener<T_EventMap, T_Event>[];
  }

  /** Returns the original listener functions, without any once-wrapper logic. */
  rawListeners<T_Event extends EventNames<T_EventMap>>(event: T_Event) {
    const listeners = this._shared.listeners.get(event) || [];
    return listeners.map((x) => x.listener) as EventListener<T_EventMap, T_Event>[];
  }

  createClient(): EventClient<T_EventMap> {
    return new EventClient_imp(this);
  }

  detachClientListeners(event?: EventNames<T_EventMap>, options?: DetachClientOptions): this {
    //get .source or default to this instance
    const internal = options?.[_INTERNAL_];
    const source = internal?.source ?? this;

    if (event != null) {
      const existing = this._shared.listeners.get(event) ?? [];
      const fromSource = existing.filter((x) => x.source === source);
      for (const container of fromSource) {
        const listener = container.listener;

        this._removeListener({
          event,
          listener,
        });
      }
    } else {
      //resource for all events
      const events = [...this._shared.listeners.keys()];
      events.forEach((event) => {
        this.detachClientListeners(event, options);
      });
    }

    return this;
  }

  //-------------------------------------------------------
  //-- utilities
  //-------------------------------------------------------

  private _handleListenerException(event: EventNames<T_EventMap>, err: unknown) {
    let shouldThrow = false;

    try {
      if (typeof this._shared.options.listenersErrorHandling === 'function') {
        this._shared.options.listenersErrorHandling(event, err);
      } else if (this._shared.options.listenersErrorHandling === 'throw') {
        shouldThrow = true;
      } else {
        const msg = `[TypedEventEmitter] listener error on "${event}":`;
        switch (this._shared.options.listenersErrorHandling) {
          case 'ignore':
            break;
          case 'log':
            console.log(msg, err);
            break;
          case 'warn':
            console.warn(msg, err);
            break;
          case 'error':
            console.error(msg, err);
            break;

          default:
            break;
        }
      }
    } catch {
      // this is enough!
    }

    // decided to rethrow !
    if (shouldThrow) {
      throw err;
    }
  }

  /** Allows only internal events. */
  private _emitInternal<Event extends EventNames_Reserved>(
    event: Event,
    ...args: EventParams_Reserved<T_EventMap, Event>
  ) {
    return this._emit({
      event,
      args,
      emitWildcardEvent: false,
    });
  }

  /** allows also internal events ("newListener", "removeListener", etc) */
  private _emit<T_Event extends EventNames<T_EventMap>>(params: {
    event: T_Event;
    args: EventParams<T_EventMap, T_Event>;
    emitWildcardEvent: boolean;
  }): boolean {
    const { event, args, emitWildcardEvent } = params;

    if (event === '*') {
      throw Error(
        `emitting wildcard event ("*") in not allowed. it's automatically sent to listeners on all user events`,
      );
    }

    //fire all wildcard ("*") listeners
    if (emitWildcardEvent) {
      // snapshot before iterating so mid-dispatch mutations don't affect this pass
      const containers = [...(this._shared.listeners.get('*') || [])];

      // no listeners -  fire default:
      if (containers.length === 0) {
        const defaultHandler = this._shared.defaultHandlers.get('*');
        if (defaultHandler) {
          containers.push({
            listener: defaultHandler,
            once: false,
          });
        }
      }
      // fire all listeners
      for (const container of containers) {
        const { listener, once } = container;
        try {
          listener(event, ...args);

          //remove if "once"
          if (once) {
            this._removeListener({
              event: '*',
              listener: listener as EventListener<T_EventMap, '*'>,
            });
          }
        } catch (err) {
          this._handleListenerException('*', err);
        }
      }
    }

    //now the actual listeners
    // snapshot before iterating so mid-dispatch mutations don't affect this pass
    const containers = [...(this._shared.listeners.get(event) || [])];

    // no listeners -  fire default:
    const hasListeners = containers.length > 0;

    if (containers.length === 0) {
      const defaultHandler = this._shared.defaultHandlers.get(event);
      if (defaultHandler) {
        containers.push({
          listener: defaultHandler,
          once: false,
        });
      }
    }

    for (const container of containers) {
      const { listener, once } = container;
      try {
        listener(...args);
        //remove if "once"
        if (once) {
          this._removeListener({
            event: event,
            listener: listener as EventListener<T_EventMap, T_Event>,
          });
        }
      } catch (err) {
        this._handleListenerException(event, err);
      }
    }

    return hasListeners;
  }

  private _addListener<T_Event extends EventNames<T_EventMap>>(params: {
    event: T_Event;
    listener: EventListener<T_EventMap, T_Event>;
    options?: EventClientListenOptions | undefined;
    postRemoved?: (event: EventNames<T_EventMap>) => void;
    once?: boolean;
    prepend?: boolean;
  }): this {
    const { event, listener, postRemoved, options = {}, once = false, prepend = false } = params;

    const internal = options[_INTERNAL_];
    const source = internal?.source ?? this;

    //fire (internal event)
    if (!isReservedEventName(event)) {
      this._emitInternal('newListener', event, listener);
    }

    //get or create list
    let listeners = this._shared.listeners.get(event) ?? [];

    //add
    const container: Listener<T_EventMap> = {
      listener: listener as EventListener<T_EventMap, EventNames<T_EventMap>>,
      postRemoved: postRemoved,
      once: once,
      source: source,
    };

    if (prepend) {
      listeners = [container, ...listeners];
    } else {
      listeners = [...listeners, container];
    }
    this._shared.listeners.set(event, listeners);

    const ignoreLimit =
      this._shared.options.maxListeners === 0 || this._shared.options.maxListeners === Infinity;
    if (!ignoreLimit && listeners.length > this._shared.options.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected.\n${listeners.length} ${event} listeners added to [EventEmitter]. Use setMaxListeners() to increase limit`,
      );
    }
    return this;
  }
  //-------------------------------------------------------
  private _removeListener<T_Event extends EventNames<T_EventMap>>(params: {
    event: T_Event;
    listener: EventListener<T_EventMap, T_Event>;
  }): this {
    const { event, listener } = params;

    const containers = this._shared.listeners.get(event) ?? [];
    // first match goes
    // match against either the raw (for normal remove) or the wrapped (on once() remove with a wrapped listener)
    const idx = containers.findIndex((x) => x.listener === listener);
    if (idx !== -1) {
      const container = containers[idx];
      const postRemoved = container?.postRemoved;

      // splice is in place. no need to update the ref.
      containers.splice(idx, 1);

      //call postRemoved callback if exists
      postRemoved?.(event);

      //fire (internal event)
      if (!isReservedEventName(event)) {
        this._emitInternal('removeListener', event, listener);
      }
    }
    //prune if empty
    if (containers.length === 0) {
      this._shared.listeners.delete(event);
    }
    return this;
  }
}
