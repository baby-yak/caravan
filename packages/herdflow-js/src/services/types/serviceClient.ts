import type { ActionClient } from '../../actions/index.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type { Service } from '../service.js';
import type { DescActions, DescEvents, DescState, ServiceDescriptor } from './types.js';

export class ServiceClient<Desc extends ServiceDescriptor = ServiceDescriptor> {
  private source: Service<Desc>;

  state: StateClient<DescState<Desc>>;
  events: EventClient<DescEvents<Desc>>;
  actions: ActionClient<DescActions<Desc>>;

  constructor(service: Service<Desc>) {
    this.source = service;
    this.state = service.state.getClient();
    this.events = service.events.getClient();
    this.actions = service.actions.getClient();
  }
}
