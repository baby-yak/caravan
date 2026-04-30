import { _SERVICE_LIFECYCLE_ } from '../../services/internal/types.js';
import type { Service } from '../../services/service.js';
import type { Module } from '../types/module.js';
import type {
  ConcreteModuleDescriptor,
  ModuleConstructionParams,
  ModuleServiceClients,
} from '../types/types.js';

export class Module_Imp<T_Module extends ConcreteModuleDescriptor> implements Module<T_Module> {
  private params: Required<ModuleConstructionParams>;
  private servicesImplementors: T_Module;

  private longestServiceName = 0;

  /**
   * Typed client facades for each service, keyed by the same names as the constructor input.
   * Use these to interact with services from outside the module.
   */
  readonly services: ModuleServiceClients<T_Module>;

  constructor(services: T_Module, params?: ModuleConstructionParams) {
    this.params = {
      ...{
        verbose: false,
      },
      ...params,
    };

    this.servicesImplementors = services;

    // services -> service clients
    const clientsEntries = Object.entries(services).map(([key, service]) => [
      key,
      service.getClient(),
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
