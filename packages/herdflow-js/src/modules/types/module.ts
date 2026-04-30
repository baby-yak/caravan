import type { ConcreteModuleDescriptor, ModuleDescriptor, ModuleServiceClients } from './types.js';

/**
 * Orchestrates a set of services through a shared lifecycle.
 *
 * Accepts a map of named `Service` instances, wires up their typed clients,
 * and manages startup/shutdown sequencing across five lifecycle phases.
 *
 * @example
 * type App = {
 *   server: Service<IServer>;
 *   db: Service<IDb>;
 * };
 *
 * const app = new Module<App>({
 *   server: new ServerService(),
 *   db: new DbService(),
 * });
 *
 * await app.start();
 * app.services.server.actions.connect(8080);
 * await app.stop();
 */
export type Module<T_Module extends ModuleDescriptor = ModuleDescriptor> = {
  readonly services: ModuleServiceClients<T_Module>;
  start(): Promise<void>;
  stop(): Promise<void>;
};
