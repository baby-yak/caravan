import { _SERVICE_LIFECYCLE_ } from '../../services/internal/types.js';
import type { Service } from '../../services/service.js';
import { AsyncMutex } from '../../utils/mutex.js';
import type {
  ConcreteModuleDescriptor,
  Module,
  ModuleConstructionParams,
  ModuleServiceClients,
} from '../types/types.js';

export class Module_Imp<T_Module extends ConcreteModuleDescriptor> implements Module<T_Module> {
  private params: Required<ModuleConstructionParams>;
  private servicesImplementors: T_Module;

  private longestServiceName = 0;
  private _isStarted = false;
  private _lock = new AsyncMutex();

  /**
   * Typed client facades for each service, keyed by the same names as the constructor input.
   * Use these to interact with services from outside the module.
   */
  readonly services: ModuleServiceClients<T_Module>;

  /** `true` after `start()` completes successfully, `false` after `stop()`. */
  get isStarted() {
    return this._isStarted;
  }

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
      service.createClient(),
    ]);

    this.services = Object.fromEntries(clientsEntries) as ModuleServiceClients<T_Module>;

    //calc longestServiceName
    this.longestServiceName = Object.values(this.servicesImplementors).reduce(
      (prev, x) => Math.max(prev, x.name.length),
      0,
    );
  }

  /** Start all services in sequence: `onServiceInit` → `onServiceStart` → `onServiceAfterStart`. */
  start() {
    return this._lock.doLocked(async () => {
      if (this._isStarted) return;
      await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].init(), 'init');
      await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].start(), 'start');
      await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].afterStart(), 'after-start');
      this._isStarted = true;
    });
  }

  /** Stop all services in sequence: `onServiceBeforeStop` → `onServiceStop`. */
  stop() {
    return this._lock.doLocked(async () => {
      if (!this._isStarted) return;
      await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].beforeStop(), 'before-stop');
      await this.doAll(async (s) => s[_SERVICE_LIFECYCLE_].stop(), 'stop');
      this._isStarted = false;
    });
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
