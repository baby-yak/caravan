import type { Service } from '../../services/service.js';

/**
 * Describes the shape of a module — an object whose values are `Service` instances.
 * Used as the type parameter for `Module<T>` to preserve per-service type inference.
 *
 * @example
 * type App = {
 *   server: Service<IServer>;
 *   db: Service<IDb>;
 * };
 * const app = new Module<App>({ server: new ServerService(), db: new DbService() });
 */
export type ModuleDescriptor = {
  [key: string]: Service<any>;
};

/** Construction options for a `Module`. */
export type ModuleConstructionParams = {
  /** Log each lifecycle phase transition for every service. Default: `false`. */
  verbose?: boolean;
};
