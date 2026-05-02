import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type {
  ConcreteModuleDescriptor,
  Module,
  ModuleEvents,
  ModuleServiceClients,
  ModuleState,
} from '../types/types.js';
import { ModuleClient_base } from './moduleClient_base.js';

export class ModuleClient_imp<
  T_Module extends ConcreteModuleDescriptor,
> extends ModuleClient_base<T_Module> {
  readonly state: StateClient<ModuleState>;
  readonly events: EventClient<ModuleEvents>;
  readonly services: ModuleServiceClients<T_Module>;

  constructor(source: Module<T_Module>) {
    super();

    this.state = source.state;
    this.events = source.events;
    this.services = source.services;
  }
}
