import type { ActionMap, ActionsConstructionParams } from '../../actions/index.js';
import type { EventMap, EventsConstructionParams } from '../../events/index.js';
import type { StateConstructionParams } from '../../state/index.js';

/**
 * Describes the shape of a service — its state type, event map, and action map.
 *
 * Pass this as the type parameter to `Service<Desc>` to get full type inference
 * on `state`, `events`, and `actions`.
 *
 * @example
 * type IServer = {
 *   state: { address: string };
 *   events: { connected: () => void };
 *   actions: { connect(port: number): void };
 * };
 * class ServerService extends Service<IServer> { ... }
 */
export type ServiceDescriptor = {
  state?: any;
  events?: EventMap;
  actions?: ActionMap;
};

// Extract each field from a ServiceDescriptor, with sensible defaults
export type DescState<SD extends ServiceDescriptor> = SD['state'] extends undefined
  ? undefined
  : SD['state'];

export type DescEvents<SD extends ServiceDescriptor> = SD['events'] extends EventMap
  ? SD['events']
  : EventMap;

export type DescActions<SD extends ServiceDescriptor> = SD['actions'] extends ActionMap
  ? SD['actions']
  : ActionMap;

/** Advanced construction options passed to the underlying state, events, and actions subsystems. */
export type ServiceConstructionParams = {
  state?: StateConstructionParams;
  events?: EventsConstructionParams;
  actions?: ActionsConstructionParams;
};
