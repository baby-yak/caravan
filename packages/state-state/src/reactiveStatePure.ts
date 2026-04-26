import { ReactiveStateBase } from './reactiveStateBase.js';
import { type ReadonlyDeep, type StateApiPure } from './types/types.js';
import { isPlainObject, makeReadOnlyDeep } from './utils.js';

/**
 * Reactive state container with pure-function updates — no immer dependency.
 *
 * Use this when you want to avoid immer entirely and manage state updates
 * yourself. `update(state => newState)` receives the current (deeply readonly)
 * state and must return the next state. `update({ field })` is available as a
 * shorthand shallow merge.
 *
 * @see {@link ReactiveState} for the immer-backed default.
 *
 * @example
 * ```ts
 * const state = new ReactiveStatePure({ count: 0 });
 * state.update(s => ({ ...s, count: s.count + 1 }));
 * ```
 */
export class ReactiveStatePure<S> extends ReactiveStateBase<S> implements StateApiPure<S> {
  update(recipe: Partial<S> | ((state: ReadonlyDeep<S>) => S)): void {
    const prev = this._shared.state;
    const next: S =
      typeof recipe === 'function'
        ? recipe(makeReadOnlyDeep(prev))
        : isPlainObject(prev)
          ? { ...prev, ...recipe }
          : (recipe as S);
    this.set(next);
  }
}
