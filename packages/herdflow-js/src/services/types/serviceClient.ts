import type { ActionClient } from '../../actions/index.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type { Service } from '../service.js';
import type { DescActions, DescEvents, DescState, ServiceDescriptor } from './types.js';

/**
 * Read-only client facade for a `Service`.
 *
 * Exposes the service's state, events, and actions as typed client interfaces —
 * without access to the service's internal implementation or lifecycle methods.
 *
 * Obtained via `service.getClient()`, which is called automatically by `Module`
 * and stored in `module.services`.
 */
export class ServiceClient<Desc extends ServiceDescriptor = ServiceDescriptor> {
  private source: Service<Desc>;

  /** Read-only access to the service's reactive state. */
  state: StateClient<DescState<Desc>>;

  /** Subscribe to events emitted by the service. */
  events: EventClient<DescEvents<Desc>>;

  /** Invoke actions on the service. */
  actions: ActionClient<DescActions<Desc>>;

  constructor(service: Service<Desc>) {
    this.source = service;
    this.state = service.state.getClient();
    this.events = service.events.getClient();
    this.actions = service.actions.getClient();
  }
}
