import { delayReject } from './utils.js';

export class AsyncMutex {
  private _lock = Promise.resolve();

  doLocked<T>(fn: () => Promise<T>, timeout?: number): Promise<T> {
    // fn will run when after lock is done
    const next = this._lock.then(fn);

    // trigger next action (errors are only eaten internally, client will also get them)
    this._lock = next.catch(() => {}).then(() => {});

    if (timeout) {
      const bomb = delayReject<T>(timeout, new Error('async mutex timeout'));
      return Promise.race([bomb, next]);
    }
    return next;
  }
}
