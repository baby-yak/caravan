import type { EventListenerGroup } from '../types/eventListenerGroup.js';
import type { EventMap } from '../types/types.js';
import { EventClientBase } from './eventClientBase.js';

export class EventListenerGroup_imp<T_EventMap extends EventMap = EventMap>
  extends EventClientBase<T_EventMap>
  implements EventListenerGroup
{
  constructor(groupName: string | undefined, root: EventClientBase<T_EventMap> | undefined) {
    // create new group token
    const token = { name: groupName ?? 'group' };
    super(token, root);
  }

  detachGroup(event?: string): void {
    this._detachClientListeners(event, this.groupToken);
  }
}
