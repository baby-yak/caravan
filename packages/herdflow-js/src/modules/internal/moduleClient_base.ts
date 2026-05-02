import { MARKER_MODULE_CLIENT } from '../../core/internal/brandSymbols.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type {
  ConcreteModuleDescriptor,
  ModuleClient,
  ModuleEvents,
  ModuleServiceClients,
  ModuleState,
} from '../types/index.js';

export abstract class ModuleClient_base<
  T_Module extends ConcreteModuleDescriptor,
> implements ModuleClient<T_Module> {
  //brand
  readonly [MARKER_MODULE_CLIENT] = true as const;

  abstract readonly state: StateClient<ModuleState>;
  abstract readonly events: EventClient<ModuleEvents>;
  abstract readonly services: ModuleServiceClients<T_Module>;
}
