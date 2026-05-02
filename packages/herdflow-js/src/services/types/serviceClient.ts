import type { ActionClient, Invoker } from '../../actions/index.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type { MARKER_SERVICE_CLIENT } from '../../core/internal/brandSymbols.js';
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
export interface ServiceClient<Desc extends ServiceDescriptor = ServiceDescriptor> {
  //instance marker
  readonly [MARKER_SERVICE_CLIENT]: true;

  /** Read-only access to the service's name. */
  readonly name: string;

  /** Shorthand for invoking actions on this service from within the implementation. */
  readonly invoke: Invoker<DescActions<Desc>>;

  /** Read-only access to the service's reactive state. */
  readonly state: StateClient<DescState<Desc>>;

  /** Subscribe to events emitted by the service. */
  readonly events: EventClient<DescEvents<Desc>>;

  /** Invoke actions on the service. */
  readonly actions: ActionClient<DescActions<Desc>>;
}
