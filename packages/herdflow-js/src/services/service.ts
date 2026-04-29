import { type ActionClient, ActionExecuter } from '../actions/index.js';
import { TypedEventEmitter } from '../events/index.js';
import { ReactiveState } from '../state/reactiveState.js';
import { ServiceClient } from './types/serviceClient.js';
import type {
  DescActions,
  DescEvents,
  DescState,
  ServiceConstructionParams,
  ServiceDescriptor,
} from './types/types.js';

/**
 * Base class for all services. Extend this class and pass a `ServiceDescriptor`
 * to define the service's typed state, events, and actions.
 *
 * @example
 * type IServer = {
 *   state: { address: string };
 *   events: { connected: () => void };
 *   actions: { connect(port: number): void };
 * };
 *
 * class ServerService extends Service<IServer> {
 *   constructor() {
 *     super('server', { address: '' });
 *     this.actions.setHandler(this);
 *   }
 *
 *   connect(port: number) {
 *     this.state.update(s => { s.address = `host:${port}`; });
 *     this.events.emit('connected');
 *   }
 * }
 */
export class Service<Descriptor extends ServiceDescriptor = ServiceDescriptor> {
  readonly name: string;

  /** Reactive state — read and update the service's internal state. */
  readonly state: ReactiveState<DescState<Descriptor>>;

  /** Typed event emitter — emit and listen to service events internally. */
  readonly events: TypedEventEmitter<DescEvents<Descriptor>>;

  /**
   * Action executer — register handlers via `setHandler`.
   * Use `this.invoke` to call actions internally.
   */
  readonly actions: ActionExecuter<DescActions<Descriptor>>;

  /** Shorthand for invoking actions on this service from within the implementation. */
  readonly invoke: ActionClient<DescActions<Descriptor>>;

  constructor(
    name: string,
    initialState: DescState<Descriptor>,
    params?: ServiceConstructionParams,
  ) {
    this.name = name;
    this.state = new ReactiveState<DescState<Descriptor>>(initialState, params?.state);
    this.events = new TypedEventEmitter<DescEvents<Descriptor>>(params?.events);
    this.actions = new ActionExecuter<DescActions<Descriptor>>(params?.actions);
    this.invoke = this.actions.invoke;
  }

  /** Returns a read-only `ServiceClient` exposing state, events, and actions to external consumers. */
  getClient() {
    return new ServiceClient<Descriptor>(this);
  }

  //-------------------------------------------------------
  //-- LIFE CYCLE (used by the module when starting / stopping the services)
  //-------------------------------------------------------

  /**
   * Called first during `module.start()`.
   * Use for self-contained initialization that does not depend on other services
   * (e.g. connecting to a database, reading config, setting up internal state).
   */
  onServiceInit(): void | Promise<void> {}

  /**
   * Called after all services have completed `onServiceInit`.
   * Safe to interact with other services here — register cross-service listeners,
   * read state from other services, or invoke actions on them.
   */
  onServiceStart(): void | Promise<void> {}

  /**
   * Called after all services have completed `onServiceStart`.
   * Use for final setup that must happen after all services are fully started
   * (e.g. a server registering a catch-all route after all other routes are mounted).
   */
  onServiceAfterStart(): void | Promise<void> {}

  /**
   * Called first during `module.stop()`, while all services are still running.
   * Use for any cross-service operations that must happen before services begin shutting down.
   */
  onServiceBeforeStop(): void | Promise<void> {}

  /**
   * Called after all services have completed `onServiceBeforeStop`.
   * Use for self-contained teardown (e.g. closing connections, unregistering listeners).
   */
  onServiceStop(): void | Promise<void> {}
}
