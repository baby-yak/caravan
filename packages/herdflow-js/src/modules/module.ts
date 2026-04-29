import { _SERVICE_LIFECYCLE_ } from '../services/internal/types.js';
import type { Service } from '../services/service.js';
import type {
  ModuleConstructionParams,
  ModuleDescriptor,
  ModuleServiceClients,
  ServiceImplementors,
} from './types/types.js';

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
export class Module<T_Module extends ModuleDescriptor> {
  private params: Required<ModuleConstructionParams>;
  private servicesImplementors: Record<string, Service<any>>;

  private longestServiceName = 0;

  /**
   * Typed client facades for each service, keyed by the same names as the constructor input.
   * Use these to interact with services from outside the module.
   */
  readonly services: ModuleServiceClients<T_Module>;

  constructor(services: ServiceImplementors<T_Module>, params?: ModuleConstructionParams) {
    this.params = {
      ...{
        verbose: false,
      },
      ...params,
    };

    this.servicesImplementors = services as Record<string, Service<any>>;

    // services -> service clients
    const clientsEntries = Object.entries(services).map(([key, service]) => [
      key,
      (service as Service<any>).getClient(),
    ]);

    this.services = Object.fromEntries(clientsEntries) as ModuleServiceClients<T_Module>;

    //calc longestServiceName
    this.longestServiceName = Object.values(this.servicesImplementors).reduce(
      (prev, x) => Math.max(prev, x.name.length),
      0,
    );
  }

  /** Start all services in sequence: `onServiceInit` → `onServiceStart` → `onServiceAfterStart`. */
  async start() {
    await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].init(), 'init');
    await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].start(), 'start');
    await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].afterStart(), 'after-start');
  }

  /** Stop all services in sequence: `onServiceBeforeStop` → `onServiceStop`. */
  async stop() {
    await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].beforeStop(), 'before-stop');
    await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].stop(), 'stop');
  }

  //-------------------------------------------------------
  //-- HELPERS
  //-------------------------------------------------------

  private async doAll(fn: (service: Service<any>) => Promise<void>, verboseMessage: string) {
    const all = this.servicesImplementors;
    for (const key in all) {
      if (!Object.hasOwn(all, key)) continue;
      const service = all[key] as Service<any>;

      if (this.params.verbose) {
        const paddedName = service.name.padEnd(this.longestServiceName);

        console.log(`service [ ${paddedName} ] : ${verboseMessage}`);
      }

      await fn(service);
    }
  }
}
