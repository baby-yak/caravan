import { ActionExecuter, type Invoker } from '../actions/index.js';
import { EventEmitter } from '../events/index.js';
import type { ModuleClient, ModuleDescriptor } from '../modules/index.js';
import { ReactiveState } from '../state/reactiveState.js';
import { Service_base } from './internal/service_base.js';
import { ServiceClient_imp } from './internal/serviceClient_imp.js';
import { _SERVICE_LIFECYCLE_ } from './internal/types.js';
import type { ServiceClient } from './types/serviceClient.js';
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
export abstract class Service<
  Descriptor extends ServiceDescriptor = ServiceDescriptor,
> extends Service_base<Descriptor> {
  private _module: ModuleClient | undefined;

  readonly name: string;

  /** Reactive state — read and update the service's internal state. */
  readonly state: ReactiveState<DescState<Descriptor>>;

  /** Typed event emitter — emit and listen to service events internally. */
  readonly events: EventEmitter<DescEvents<Descriptor>>;

  /** Returns a read-only `ServiceClient` exposing state, events, and actions to external consumers. */
  readonly client: ServiceClient<Descriptor>;

  /**
   * Action executer — register handlers via `setHandler`.
   * Use `this.invoke` to call actions internally.
   */
  readonly actions: ActionExecuter<DescActions<Descriptor>>;

  /** Shorthand for invoking actions on this service from within the implementation. */
  readonly invoke: Invoker<DescActions<Descriptor>>;

  // Bridge — only Module imports and uses this symbol
  [_SERVICE_LIFECYCLE_] = {
    setModule: (module: ModuleClient) => this.setModule(module),
    init: () => this.onServiceInit(),
    start: () => this.onServiceStart(),
    afterStart: () => this.onServiceAfterStart(),
    beforeStop: () => this.onServiceBeforeStop(),
    stop: () => this.onServiceStop(),
  };

  constructor(
    name: string,
    initialState: DescState<Descriptor>,
    params?: ServiceConstructionParams,
  ) {
    super();

    this.name = name;
    this.state = new ReactiveState<DescState<Descriptor>>(initialState, params?.state);
    this.events = new EventEmitter<DescEvents<Descriptor>>(params?.events);
    this.actions = new ActionExecuter<DescActions<Descriptor>>(params?.actions);
    this.invoke = this.actions.invoke;

    this.client = new ServiceClient_imp<Descriptor>(this);
  }

  /**
   * Returns the parent `ModuleClient`, cast to the provided module descriptor type.
   *
   * Available from `onServiceStart` onward — throws if called earlier (constructor or `onServiceInit`).
   * Use a private getter to cache access and avoid repeating the cast:
   *
   * ```ts
   * private get module() { return this.getModule<AppModule>(); }
   * ```
   *
   * @throws if called before `onServiceStart`
   */
  getModule<M extends ModuleDescriptor>(): ModuleClient<M> {
    if (!this._module) {
      throw new Error(
        `[${this.constructor.name}] getModule() called before onServiceStart — module is not yet available`,
      );
    }
    return this._module as ModuleClient<M>;
  }

  //-------------------------------------------------------
  //-- LIFE CYCLE (used by the module when starting / stopping the services)
  //-------------------------------------------------------

  /** module is injecting itself - happens after init  */
  private setModule(module: ModuleClient) {
    this._module = module;
  }

  /**
   * Called first during `module.start()`.
   * Use for self-contained initialization that does not depend on other services
   * (e.g. connecting to a database, reading config, setting up internal state).
   *
   * `getModule()` is **not** available here — the module is injected after this phase.
   */
  protected onServiceInit(): void | Promise<void> {}

  /**
   * Called after all services have completed `onServiceInit`.
   * `getModule()` is available from this point on.
   *
   * Use for inter-service wiring — register cross-service listeners,
   * read state from sibling services, or invoke actions on them.
   */
  protected onServiceStart(): void | Promise<void> {}

  /**
   * Called after all services have completed `onServiceStart`.
   * Use for final setup that must happen after all services are fully started
   * (e.g. a server registering a catch-all route after all other routes are mounted).
   */
  protected onServiceAfterStart(): void | Promise<void> {}

  /**
   * Called first during `module.stop()`, while all services are still running.
   * Use for any cross-service operations that must happen before services begin shutting down.
   */
  protected onServiceBeforeStop(): void | Promise<void> {}

  /**
   * Called after all services have completed `onServiceBeforeStop`.
   * Use for self-contained teardown (e.g. closing connections, unregistering listeners).
   */
  protected onServiceStop(): void | Promise<void> {}
}
