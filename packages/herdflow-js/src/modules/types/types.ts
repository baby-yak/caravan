import type { EventClient } from '../../events/index.js';
import type { ServiceClient, ServiceDescriptor } from '../../services/index.js';
import type { Service } from '../../services/service.js';
import type { StateClient } from '../../state/index.js';

/**
 * Orchestrates a set of services through a shared lifecycle.
 *
 * Accepts a map of named `Service` instances, wires up their typed clients,
 * and manages startup/shutdown sequencing across five lifecycle phases.
 *
 * @example
 * type App = {
 *   server: IServer; // service descriptor (easiest)
 *   db: Service<IDb>; // Service<descriptor> wrapper - also works
 *   counter: ServiceClient<ICounter>; // ServiceClient<descriptor> wrapper - also work
 * };
 *
 * const app = createModule<App>({
 *   server: new ServerService(),
 *   db: new DbService(),
 *   counter: new Counter(),
 * });
 *
 * await app.start();
 * app.services.server.actions.connect(8080);
 * await app.stop();
 */
/**
 * Orchestrates a set of services through a shared lifecycle.
 *
 * Accepts a map of named `Service` instances, wires up their typed clients,
 * and manages startup/shutdown sequencing across five lifecycle phases.
 * Within each phase all services run in parallel; phases are sequential.
 *
 * @example
 * const app = createModule<App>({
 *   server: new ServerService(),
 *   db: new DbService(),
 * });
 *
 * await app.start();
 * app.services.server.actions.connect(8080);
 * await app.stop();
 */
export interface Module<
  T_Module extends ModuleDescriptor = ModuleDescriptor,
> extends ModuleClient<T_Module> {
  /** Returns a read-only `ModuleClient` safe to share with consumers. Does not expose `start`/`stop`. */
  readonly client: ModuleClient<T_Module>;
  /** Run the full startup sequence: `init` → `start` → `afterStart`. */
  start(): void;
  /** Run the full shutdown sequence: `beforeStop` → `stop`. */
  stop(): void;
  /** resolves on 'started' (or immediately if already started), rejects on 'error' */
  waitForStart(): Promise<void>;
  /** resolves on 'stopped' (or immediately if already stopped), rejects on 'error' */
  waitForStop(): Promise<void>;
}

/**
 * Read-only facade for a `Module`.
 *
 * Exposes reactive lifecycle state, lifecycle events, and the typed service clients —
 * without access to `start` or `stop`. Safe to pass to components and consumers.
 *
 * Obtained via `module.client`.
 */
export interface ModuleClient<T_Module extends ModuleDescriptor = ModuleDescriptor> {
  /** Reactive lifecycle state — subscribe to react to `isStarted` changes. */
  readonly state: StateClient<ModuleState>;
  /** Lifecycle events — fired after `start()` and `stop()` complete. */
  readonly events: EventClient<ModuleEvents>;
  /** Typed `ServiceClient` map, keyed by the same names as the constructor input. */
  readonly services: ModuleServiceClients<T_Module>;
}

/** Reactive state exposed on every module. */
export type ModuleState = {
  /** `true` after `start()` completes successfully, `false` after `stop()`. */
  isStarted: boolean;
};

/** Lifecycle events emitted by a module. */
export type ModuleEvents = {
  /** Fired once after `start()` completes successfully. */
  started: () => void;
  /** Fired once after `stop()` completes successfully. */
  stopped: () => void;
  /** Fired when stat errored. */
  errorStarting: (error: Error) => void;
  /** Fired when stop errored. */
  errorStopping: (error: Error) => void;
};

/**
 * Describes the shape of a module. Each value is either a `Service<D>` or a bare descriptor `D`.
 * Using a bare descriptor is shorthand — it is equivalent to `Service<D>`.
 *
 * @example
 * type App = {
 *   server: Service<IServer>; // explicit
 *   db: IDatabase;            // shorthand — same as Service<IDatabase>
 * };
 * const app = new Module<App>({
 *   server: new ServerService(),  // extends Service<IServer>
 *   db: new DbService(),          // extends Service<IDatabase>
 * });
 */
export type ModuleDescriptor = {
  [key: string]: Service<any> | ServiceClient<any> | ServiceDescriptor;
};

export type ConcreteModuleDescriptor = {
  [key: string]: Service<any>;
};

/**
 * Maps each `ModuleDescriptor` value to the actual `Service<D>` required by the constructor.
 * - `Service<D>` values pass through unchanged.
 * - Bare descriptor values `D` are wrapped as `Service<D>`.
 */
export type ServiceImplementors<MODULE extends ModuleDescriptor> = {
  // {key : value (will be converted to Service)}
  // check if Service -> return as is:
  [K in keyof MODULE]: MODULE[K] extends Service<any>
    ? MODULE[K]
    : // no. check if ServiceClient -> convert to Service<Desc>:
      MODULE[K] extends ServiceClient<any>
      ? Service<ExtractDescriptor<MODULE[K]>>
      : // no. check if ServiceDescriptor -> convert to Service<Desc>:
        MODULE[K] extends ServiceDescriptor
        ? Service<MODULE[K]>
        : //no. fallback to default Service
          Service;
};

/** The typed `ServiceClient` map exposed on `module.services`.\
 * can accept either a ModuleDescriptor or a (typeof(myModule))\
 * and convert it to : `{ [name] : ServiceClient<descriptor> }`\
 * this is the type of the `myModule.services` fields
 */
export type ModuleServiceClients<T_Module extends ModuleDescriptor | Module<any>> =
  // check if ModuleDescriptor -> map to ServiceClients
  T_Module extends ModuleDescriptor
    ? {
        [K in keyof T_Module]: ServiceClient<ExtractDescriptor<T_Module[K]>>;
      }
    : // no. check if Module -> map to inferred ServiceClients
      T_Module extends Module<infer DESC>
      ? {
          [K in keyof DESC]: ServiceClient<ExtractDescriptor<DESC[K]>>;
        }
      : //no. won't happen
        never;

/** Extracts the `ServiceDescriptor` from a `ModuleDescriptor` value. */
export type ExtractDescriptor<SERVICE extends Service | ServiceClient | ServiceDescriptor> =
  //check if service is Service -> return its descriptor
  SERVICE extends Service<infer SERVICE_DESC>
    ? SERVICE_DESC
    : //no. check if its a ServiceClient -> return its descriptor
      SERVICE extends ServiceClient<infer CLIENT_DESC>
      ? CLIENT_DESC
      : //no. check if its a ServiceDescriptor -> return as is
        SERVICE extends ServiceDescriptor
        ? SERVICE
        : //no. fallback to default ServiceDescriptor
          ServiceDescriptor;

//-------------------------------------------------------
//-------------------------------------------------------

/** Construction options for a `Module`. */
export type ModuleConstructionParams = {
  /** Log each lifecycle phase transition for every service. Default: `false`. */
  verbose?: boolean;
};
