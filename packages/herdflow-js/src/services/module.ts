import type { Service } from './service.js';
import type { ModuleConstructionParams, ModuleDescriptor } from './types/types.js';

export class Module<T extends ModuleDescriptor> {
  private params: Required<ModuleConstructionParams>;
  private servicesImplementors: T;

  private longestServiceName = 0;

  /** these are the service clients to be used by other components in the system */
  readonly services: { [K in keyof T]: ReturnType<T[K]['getClient']> };

  constructor(services: T, params?: ModuleConstructionParams) {
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

    this.services = Object.fromEntries(clientsEntries) as {
      [K in keyof T]: ReturnType<T[K]['getClient']>;
    };

    //calc longestServiceName
    this.longestServiceName = Object.values(services).reduce(
      (prev, x) => Math.max(prev, x.name.length),
      0,
    );
  }

  async start() {
    await this.doAll(async (s) => s.onServiceInit(), 'init');
    await this.doAll(async (s) => s.onServiceStart(), 'start');
    await this.doAll(async (s) => s.onServiceAfterStart(), 'after-start');
  }

  async stop() {
    await this.doAll(async (s) => s.onServiceBeforeStop(), 'before-stop');
    await this.doAll(async (s) => s.onServiceStop(), 'stop');
  }

  //-------------------------------------------------------
  //-- HELPERS
  //-------------------------------------------------------

  private async doAll(fn: (service: Service<any>) => Promise<void>, verboseMessage: string) {
    const all = this.servicesImplementors;
    for (const key in all) {
      if (!Object.hasOwn(all, key)) continue;
      const service = all[key];
      try {
        if (!service) {
          continue;
        }

        if (this.params.verbose) {
          const paddedName = service.name.padEnd(this.longestServiceName);

          console.log(`service [ ${paddedName} ] : ${verboseMessage}`);
        }

        await fn(service);
      } catch (err) {
        console.error('Error in services module operation', err);
      }
    }
  }
}
