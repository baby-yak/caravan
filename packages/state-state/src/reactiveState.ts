import { enableMapSet, produce, type Draft } from 'immer';
import { ReactiveStateBase } from './reactiveStateBase.js';
import { type StateApi } from './types/types.js';
import { isPlainObject } from './utils.js';

// enables immer Map/Set support globally — see README
enableMapSet();

/**
 * Reactive state container backed by [immer](https://immerjs.github.io/immer/).
 *
 * The default choice. Use `update(draft => { ... })` to mutate state deeply
 * without writing spread boilerplate — immer handles structural sharing under
 * the hood. `update({ field })` is available as a shorthand shallow merge.
 *
 * @see {@link ReactiveStatePure} for an immer-free alternative.
 *
 * @example
 * ```ts
 * const state = new ReactiveState({ count: 0 });
 * state.update(draft => { draft.count++; });
 * ```
 */
export class ReactiveState<S> extends ReactiveStateBase<S> implements StateApi<S> {
  update(recipe: Partial<S> | ((draft: Draft<S>) => void)): void {
    const prev = this._shared.state;
    let next: S;
    if (typeof recipe === 'function') {
      if (typeof prev !== 'object' || prev === null) {
        throw new Error(
          'update() with a recipe is not supported for primitive state. Use set() instead.',
        );
      }
      next = produce(prev, (draft) => {
        recipe(draft);
      });
    } else {
      next = isPlainObject(prev) ? { ...prev, ...recipe } : (recipe as S);
    }
    this.set(next);
  }
}
