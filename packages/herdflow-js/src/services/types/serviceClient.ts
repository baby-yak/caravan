import type { ActionClient, ActionMap } from '../../actions/index.js';
import type { EventClient, EventMap } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type { Service } from '../service.js';

export class ServiceClient<
  State = undefined,
  Actions extends ActionMap = ActionMap,
  Events extends EventMap = EventMap,
> {
  private source: Service<State, Actions, Events>;

  state: StateClient<State>;
  events: EventClient<Events>;
  actions: ActionClient<Actions>;

  constructor(service: Service<State, Actions, Events>) {
    this.source = service;
    this.state = service.state.getClient();
    this.events = service.events.getClient();
    this.actions = service.actions.getClient();
  }
}
