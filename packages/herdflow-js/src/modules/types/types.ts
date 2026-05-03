import type { MARKER_MODULE, MARKER_MODULE_CLIENT } from '../../core/internal/brandSymbols.js';
import type { EventClient } from '../../events/index.js';
import type { ServiceClient, ServiceDescriptor } from '../../services/index.js';
import type { Service } from '../../services/service.js';
import type { StateClient } from '../../state/index.js';

/**
 * Orchestrates a set of services through a shared lifecycle.
 *
 * Accepts a map of named `Service` instances, wires up their typed clients,
 * and manages startup/shutdown sequencing across five lifecycle phases.
 * Within each phase all services run in parallel; phases are sequential.
 *
 * @example
 * // Explicit descriptor:
 * type App = {
 *   server: Service<IServer>;
 *   db: Service<IDb>;
 * };
 * const app = createModule<App>({
 *   server: new ServerService(),
 *   db: new DbService(),
 * });
 *
 * // Implicit — descriptor inferred from the provided services:
 * const app = createModule({
 *   server: new ServerService(),
 *   db: new DbService(),
 * });
 *
 * app.start();
 * app.services.server.actions.invoke.connect(8080);
 * app.stop();
 */
export interface Module<
  T_Module extends ModuleDescriptor = ModuleDescriptor,
> extends ModuleClient<T_Module> {
  //instance marker
  readonly [MARKER_MODULE]: true;

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
  //instance marker
  readonly [MARKER_MODULE_CLIENT]: true;

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
 * Describes the shape of a module — a map of names to `Service` instances.
 *
 * @example
 * type App = {
 *   server: Service<IServer>;
 *   db: Service<IDb>;
 * };
 */
export type ModuleDescriptor = {
  [key: string]: Service<any>;
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

/** Extracts the `ServiceDescriptor` from a `Service`. */
export type ExtractDescriptor<S extends Service<any>> =
  S extends Service<infer D> ? D : ServiceDescriptor;

//-------------------------------------------------------
//-------------------------------------------------------

/** Construction options for a `Module`. */
export type ModuleConstructionParams = {
  /** Log each lifecycle phase transition for every service. Default: `false`. */
  verbose?: boolean;
};
