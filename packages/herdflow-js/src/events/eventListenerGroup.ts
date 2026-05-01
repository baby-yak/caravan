import type { EventClientBase } from './internal/eventClientBase.js';
import type { GroupToken } from './internal/types.js';
import type { EventClient, EventMap, EventNames } from './types/index.js';

export class EventListenerGroup<T_EventMap extends EventMap = EventMap> {
  private _clientBase: EventClientBase<T_EventMap>;
  private _groupToken: GroupToken;

  readonly client: EventClient<T_EventMap>;

  constructor(groupToken: GroupToken, client: EventClientBase<T_EventMap>) {
    this._clientBase = client;
    this._groupToken = groupToken;
    this.client = client;
  }
  /**
   * remove all the listeners that was registered under this group at once
   * @param event if provided - only remove listeners for the specific event
   */
  detachGroup(event?: EventNames<T_EventMap>): void {
    this._clientBase.detachGroup(event, this._groupToken);
  }
}
