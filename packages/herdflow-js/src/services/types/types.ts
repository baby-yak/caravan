import type { ActionMap, ActionsConstructionParams } from '../../actions/index.js';
import type { EventMap, EventsConstructionParams } from '../../events/index.js';
import type { StateConstructionParams } from '../../state/index.js';
import type { Service } from '../service.js';

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

export type ModuleDescriptor = {
  [key: string]: Service<any>;
};

export type ServiceConstructionParams = {
  state?: StateConstructionParams;
  events?: EventsConstructionParams;
  actions?: ActionsConstructionParams;
};

export type ModuleConstructionParams = {
  verbose?: boolean;
};
