import type { ActionMap, ActionsConstructionParams } from '../../actions/index.js';
import type { EventMap, EventsConstructionParams } from '../../events/index.js';
import type { StateConstructionParams } from '../../state/index.js';
import type { Service } from '../service.js';

export type ServiceDescriptor = {
  state?: object;
  events?: EventMap;
  actions?: ActionMap;
};

export type ModuleDescriptor = {
  [key: string]: Service<any, any, any>;
};

export type ServiceConstructionParams = {
  state?: StateConstructionParams;
  events?: EventsConstructionParams;
  actions?: ActionsConstructionParams;
  // and self?
};
