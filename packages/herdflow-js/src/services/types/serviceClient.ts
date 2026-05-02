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
 * Obtained via `service.client`, which is called automatically by `Module`
 * and stored in `module.services`.
 */
export class ServiceClient<Desc extends ServiceDescriptor = ServiceDescriptor> {
  private source: Service<Desc>;

  /** Read-only access to the service's name. */
  readonly name: string;

  /** Read-only access to the service's reactive state. */
  readonly state: StateClient<DescState<Desc>>;

  /** Subscribe to events emitted by the service. */
  readonly events: EventClient<DescEvents<Desc>>;

  /** Invoke actions on the service. */
  readonly actions: ActionClient<DescActions<Desc>>;

  constructor(service: Service<Desc>) {
    this.source = service;
    this.name = service.name;
    this.state = service.state.client;
    this.events = service.events.client;
    this.actions = service.actions.client;
  }
}
