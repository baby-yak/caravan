import { _INTERNAL_ } from '../../core/internal/index.js';
import type { TypedEventEmitter } from '../typedEventEmitter.js';
import type { EventClient, EventClientListenOptions } from '../types/eventClient.js';
import type { EventListenerContainer } from '../types/eventListenerContainer.js';
import type { EventListener, EventMap, EventNames, EventParams } from '../types/types.js';
import { __detachClientListeners__ } from './types.js';

export class EventClient_imp<
  T_EventMap extends EventMap = EventMap,
> implements EventClient<T_EventMap> {
  protected source: TypedEventEmitter<T_EventMap>;

  constructor(source: TypedEventEmitter<T_EventMap>) {
    this.source = source;
  }

  protected addSelfToSource<T extends { [_INTERNAL_]?: { source?: EventClient } }>(options: T) {
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

  createListenerContainer(): EventListenerContainer<T_EventMap> {
    return new EventListenerContainer_imp(this.source);
  }
}

//-------------------------------------------------------
//--  EventListenerContainer_imp
//-------------------------------------------------------

export class EventListenerContainer_imp<T_EventMap extends EventMap = EventMap>
  extends EventClient_imp<T_EventMap>
  implements EventListenerContainer<T_EventMap>
{
  detachContainer(event?: EventNames<T_EventMap>): void {
    this.source[__detachClientListeners__](event, this);
  }
}
