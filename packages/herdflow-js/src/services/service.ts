import { type ActionClient, ActionExecuter } from '../actions/index.js';
import { TypedEventEmitter } from '../events/index.js';
import { ReactiveState } from '../state/reactiveState.js';
import { ServiceClient } from './types/serviceClient.js';
import type {
  DescActions,
  DescEvents,
  DescState,
  ServiceConstructionParams,
  ServiceDescriptor,
} from './types/types.js';

export class Service<Descriptor extends ServiceDescriptor = ServiceDescriptor> {
  readonly name: string;

  readonly state: ReactiveState<DescState<Descriptor>>;
  readonly events: TypedEventEmitter<DescEvents<Descriptor>>;
  readonly actions: ActionExecuter<DescActions<Descriptor>>;
  readonly invoke: ActionClient<DescActions<Descriptor>>;

  constructor(
    name: string,
    initialState: DescState<Descriptor>,
    params?: ServiceConstructionParams,
  ) {
    this.name = name;
    this.state = new ReactiveState<DescState<Descriptor>>(initialState, params?.state);
    this.events = new TypedEventEmitter<DescEvents<Descriptor>>(params?.events);
    this.actions = new ActionExecuter<DescActions<Descriptor>>(params?.actions);
    this.invoke = this.actions.invoke;
  }

  getClient() {
    return new ServiceClient<Descriptor>(this);
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
