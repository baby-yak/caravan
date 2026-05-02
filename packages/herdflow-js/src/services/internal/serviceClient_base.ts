import type { ActionClient, Invoker } from '../../actions/index.js';
import { MARKER_SERVICE_CLIENT } from '../../core/internal/brandSymbols.js';
import type { EventClient } from '../../events/index.js';
import type { StateClient } from '../../state/index.js';
import type { ServiceClient } from '../types/serviceClient.js';
import type { DescActions, DescEvents, DescState, ServiceDescriptor } from '../types/types.js';

export abstract class ServiceClient_base<
  Desc extends ServiceDescriptor = ServiceDescriptor,
> implements ServiceClient<Desc> {
  //brand
  readonly [MARKER_SERVICE_CLIENT] = true as const;

  abstract readonly name: string;
  abstract readonly invoke: Invoker<DescActions<Desc>>;
  abstract readonly state: StateClient<DescState<Desc>>;
  abstract readonly events: EventClient<DescEvents<Desc>>;
  abstract readonly actions: ActionClient<DescActions<Desc>>;
}
