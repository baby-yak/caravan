import type { ServiceClient } from '../../services/index.js';
import type { ServiceDescriptor } from '../../services/index.js';
import type { Service } from '../../services/service.js';

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
export type Module<T_Module extends ModuleDescriptor = ModuleDescriptor> = {
  readonly services: ModuleServiceClients<T_Module>;
  readonly isStarted: boolean;
  start(): Promise<void>;
  stop(): Promise<void>;
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
