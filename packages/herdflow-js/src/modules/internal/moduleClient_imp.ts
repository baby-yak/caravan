import { MARKER_MODULE_CLIENT } from '../../core/internal/brandSymbols.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type {
  ConcreteModuleDescriptor,
  Module,
  ModuleClient,
  ModuleEvents,
  ModuleServiceClients,
  ModuleState,
} from '../types/types.js';

export class ModuleClient_imp<
  T_Module extends ConcreteModuleDescriptor,
> implements ModuleClient<T_Module> {
  //instance marker
  readonly [MARKER_MODULE_CLIENT] = true as const;

  readonly state: StateClient<ModuleState>;
  readonly events: EventClient<ModuleEvents>;
  readonly services: ModuleServiceClients<T_Module>;

  constructor(source: Module<T_Module>) {
    this.state = source.state;
    this.events = source.events;
    this.services = source.services;
  }
}
