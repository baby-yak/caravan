import type { ServiceClient } from '../../services/index.js';
import type { ServiceDescriptor } from '../../services/index.js';
import type { Service } from '../../services/service.js';

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
  [key: string]: Service<any> | ServiceDescriptor;
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
    : // no. check if ServiceDescriptor -> convert to Service<Desc>:
      MODULE[K] extends ServiceDescriptor
      ? Service<MODULE[K]>
      : //no. fallback to default Service
        Service;
};

/** The typed `ServiceClient` map exposed on `module.services`. */
export type ModuleServiceClients<T_Module extends ModuleDescriptor> = {
  [K in keyof T_Module]: ServiceClient<ExtractDescriptor<T_Module[K]>>;
};

/** Extracts the `ServiceDescriptor` from a `ModuleDescriptor` value. */
export type ExtractDescriptor<SERVICE extends Service | ServiceDescriptor> =
  //check if service is Service -> return its descriptor
  SERVICE extends Service<infer DESC>
    ? DESC
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
