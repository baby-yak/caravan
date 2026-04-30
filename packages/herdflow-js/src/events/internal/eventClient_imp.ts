import { _INTERNAL_ } from '../../core/internal/index.js';
import type {
  DetachClientOptions,
  EventClient,
  EventClientListenOptions,
} from '../types/eventClient.js';
import type { EventListener, EventMap, EventNames, EventParams } from '../types/types.js';

export class EventClient_imp<
  T_EventMap extends EventMap = EventMap,
> implements EventClient<T_EventMap> {
  private source: EventClient<T_EventMap>;
  constructor(source: EventClient<T_EventMap>) {
    this.source = source;
  }

  private addSelfToSource<T extends { [_INTERNAL_]?: { source?: EventClient } }>(options: T) {
    options[_INTERNAL_] = options[_INTERNAL_] ?? {};
    options[_INTERNAL_].source = options[_INTERNAL_].source ?? this;
    return options;
  }

  subscribe<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): () => void {
    options = this.addSelfToSource(options ?? {});
    return this.source.subscribe(event, listener, options);
  }
  on<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    options = this.addSelfToSource(options ?? {});
    this.source.on(event, listener, options);
    return this;
  }
  once<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    options = this.addSelfToSource(options ?? {});
    this.source.once(event, listener, options);
    return this;
  }
  subscribeOnce<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): () => void {
    options = this.addSelfToSource(options ?? {});
    return this.source.subscribeOnce(event, listener, options);
  }
  addListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    options = this.addSelfToSource(options ?? {});
    this.source.addListener(event, listener, options);
    return this;
  }
  prependListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    options = this.addSelfToSource(options ?? {});
    this.source.prependListener(event, listener, options);
    return this;
  }
  prependOnceListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
    options?: EventClientListenOptions,
  ): this {
    options = this.addSelfToSource(options ?? {});
    this.source.prependOnceListener(event, listener, options);
    return this;
  }
  waitFor<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    options?: EventClientListenOptions & { signal?: AbortSignal },
  ): Promise<EventParams<T_EventMap, T_Event>> {
    options = this.addSelfToSource(options ?? {});
    return this.source.waitFor(event, options);
  }

  off<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
  ): this {
    this.source.off(event, listener);
    return this;
  }
  removeListener<T_Event extends EventNames<T_EventMap>>(
    event: T_Event,
    listener: EventListener<T_EventMap, T_Event>,
  ): this {
    this.source.removeListener(event, listener);
    return this;
  }

  createClient(): EventClient<T_EventMap> {
    return this.source.createClient();
  }

  detachClientListeners(event?: EventNames<T_EventMap>, options?: DetachClientOptions): this {
    options = this.addSelfToSource(options ?? {});

    this.source.detachClientListeners(event, options);
    return this;
  }
}
