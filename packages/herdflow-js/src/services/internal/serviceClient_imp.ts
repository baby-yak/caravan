import type { ActionClient } from '../../actions/index.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type { Service } from '../service.js';
import type { ServiceClient } from '../types/serviceClient.js';
import type { DescActions, DescEvents, DescState, ServiceDescriptor } from '../types/types.js';
import { MARKER_SERVICE_CLIENT } from './symbols.js';

export class ServiceClient_imp<
  Desc extends ServiceDescriptor = ServiceDescriptor,
> implements ServiceClient {
  //instance marker
  readonly [MARKER_SERVICE_CLIENT] = true as const;

  /** Read-only access to the service's name. */
  readonly name: string;

  /** Read-only access to the service's reactive state. */
  readonly state: StateClient<DescState<Desc>>;

  /** Subscribe to events emitted by the service. */
  readonly events: EventClient<DescEvents<Desc>>;

  /** Invoke actions on the service. */
  readonly actions: ActionClient<DescActions<Desc>>;

  constructor(service: Service<Desc>) {
    this.name = service.name;
    this.state = service.state.client;
    this.events = service.events.client;
    this.actions = service.actions.client;
  }
}
