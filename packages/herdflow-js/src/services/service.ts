import { type ActionClient, ActionExecuter, type ActionMap } from '../actions/index.js';
import { type EventMap, TypedEventEmitter } from '../events/index.js';
import { ReactiveState } from '../state/reactiveState.js';
import { ServiceClient } from './types/serviceClient.js';
import type { ServiceConstructionParams } from './types/types.js';

export class Service<
  State = undefined,
  Actions extends ActionMap = ActionMap,
  Events extends EventMap = EventMap,
> {
  readonly name: string;

  readonly state: ReactiveState<State>;
  readonly events: TypedEventEmitter<Events>;
  readonly actions: ActionExecuter<Actions>;
  readonly invoke: ActionClient<Actions>;

  constructor(name: string, initialState: State, params?: ServiceConstructionParams) {
    this.name = name;
    this.state = new ReactiveState(initialState, params?.state);
    this.events = new TypedEventEmitter(params?.events);
    this.actions = new ActionExecuter(params?.actions);
    this.invoke = this.actions.invoke;
  }

  getClient() {
    return new ServiceClient(this);
  }

  //-------------------------------------------------------
  //-- LIFE CYCLE (used by the module when starting / stopping the services)
  //-------------------------------------------------------

  onServiceInit(): void | Promise<void> {}
  onServiceStart(): void | Promise<void> {}
  onServiceAfterStart(): void | Promise<void> {}
  onServiceBeforeStop(): void | Promise<void> {}
  onServiceStop(): void | Promise<void> {}
}
