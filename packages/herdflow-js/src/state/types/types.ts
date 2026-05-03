import type { MARKER_STATE_CLIENT } from '../../core/internal/brandSymbols.js';
import type { ListenersErrorHandlingType, UnsubscribeFn } from '../../core/types.js';

/**
 * Callback invoked whenever state changes.
 * @param state - The new state (deeply readonly).
 * @param prev  - The previous state, or `undefined` on the initial call immediately after subscribing.
 */
export type StateListener<S> = (state: S, prev: S | undefined) => void;

/** A function that derives a value `U` from state `S`. Used with `.select()`. */
export type StateSelectFn<S, U> = (state: S) => U;

//-------------------------------------------------------
//-- state source
//-------------------------------------------------------

/** Read-only view of a reactive state container. */
export interface StateClient<S> {
  //instance marker
  readonly [MARKER_STATE_CLIENT]: true;

  /** Returns the current state (deeply readonly). */
  get(): S;

  /** Returns the initial state (deeply readonly). */
  getInitialState(): S;

  /**
   * Subscribes to state changes. The listener is called immediately with the
   * current state (`prev` will be `undefined` on that first call), then again
   * on every subsequent change.
   * @returns An {@link UnsubscribeFn} that removes the listener when called.
   */
  subscribe(listener: StateListener<S>): UnsubscribeFn;

  /**
   * Creates a derived {@link StateClient} that emits only when the selected
   * value changes (compared with `Object.is`). Chained selectors are flattened
   * into a single selector for efficiency.
   */
  select<U>(selector: StateSelectFn<S, U>): StateClient<U>;
}

//-------------------------------------------------------
// config and construction
//-------------------------------------------------------

export type StateListenersErrorHandlingType = ListenersErrorHandlingType<(error: unknown) => void>;

/** Options passed to the {@link ReactiveState} constructor. */
export type StateConstructionParams = {
  /** how to handle when a listener throws an error — default is `"warn"` */
  listenersErrorHandling?: StateListenersErrorHandlingType;
};
