import type { Service } from './service.js';
import type { ModuleDescriptor } from './types/types.js';

export class Module<T extends ModuleDescriptor> {
  private servicesImplementors: T;

  /** these are the service clients to be used by other components in the system */
  readonly services: { [K in keyof T]: ReturnType<T[K]['getClient']> };

  constructor(services: T) {
    this.servicesImplementors = services;

    // services -> service clients
    const clientsEntries = Object.entries(services).map(([key, service]) => [
      key,
      service.getClient(),
    ]);

    this.services = Object.fromEntries(clientsEntries) as {
      [K in keyof T]: ReturnType<T[K]['getClient']>;
    };
  }

  async start() {
    await this.doAll(async (s) => s.onServiceInit());
    await this.doAll(async (s) => s.onServiceStart());
    await this.doAll(async (s) => s.onServiceAfterStart());
  }

  async stop() {
    await this.doAll(async (s) => s.onServiceBeforeStop());
    await this.doAll(async (s) => s.onServiceStop());
  }

  //-------------------------------------------------------
  //-- HELPERS
  //-------------------------------------------------------

  private async doAll(fn: (service: Service<any, any, any>) => Promise<void>) {
    const all = this.servicesImplementors;
    for (const key in all) {
      if (!Object.hasOwn(all, key)) continue;
      const service = all[key];
      try {
        if (service) {
          await fn(service);
        }
      } catch (err) {
        console.error('Error in services module operation', err);
      }
    }
  }
}
