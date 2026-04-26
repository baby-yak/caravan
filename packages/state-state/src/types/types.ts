import type { Draft } from 'immer';

/** Call to stop receiving state updates from a subscription. */
export type UnsubscribeFn = () => void;

/**
 * Callback invoked whenever state changes.
 * @param state - The new state (deeply readonly).
 * @param prev  - The previous state, or `undefined` on the initial call immediately after subscribing.
 */
export type StateListener<S> = (state: ReadonlyDeep<S>, prev: ReadonlyDeep<S> | undefined) => void;

/** A function that derives a value `U` from state `S`. Used with `.select()`. */
export type StateSelectFn<S, U> = (state: ReadonlyDeep<S>) => U;

//-------------------------------------------------------
//-- state source
//-------------------------------------------------------

/** Read-only view of a reactive state container. */
export interface StateSource<S> {
  /** Returns the current state (deeply readonly). */
  get(): ReadonlyDeep<S>;

  /** Returns the initial state (deeply readonly). */
  getInitialState(): ReadonlyDeep<S>;

  /**
   * Subscribes to state changes. The listener is called immediately with the
   * current state (`prev` will be `undefined` on that first call), then again
   * on every subsequent change.
   * @returns An {@link UnsubscribeFn} that removes the listener when called.
   */
  subscribe(listener: StateListener<S>): UnsubscribeFn;

  /**
   * Creates a derived {@link StateSource} that emits only when the selected
   * value changes (compared with `Object.is`). Chained selectors are flattened
   * into a single selector for efficiency.
   */
  select<U>(selector: StateSelectFn<S, U>): StateSource<U>;
}

//-------------------------------------------------------
//-- StateApiBase
//-------------------------------------------------------

/** Base read-write API — shared by {@link StateApi} and {@link StateApiPure}. */
export interface StateApiBase<S> extends StateSource<S> {
  /** Replaces the state. No-ops if the new value is the same reference (`Object.is`). */
  set(state: S): void;

  /**
   * Returns a {@link StateSource} facade that exposes only the read-only interface.
   * Safe to hand to consumers that should not be able to mutate state.
   */
  createStateSource(): StateSource<S>;
}

//-------------------------------------------------------
//-- StateApi (default, Immer style updates)
//-------------------------------------------------------

/**
 * Read-write API backed by [immer](https://immerjs.github.io/immer/).
 * Implemented by {@link ReactiveState}.
 */
export interface StateApi<S> extends StateApiBase<S> {
  /**
   * Updates the state in one of two ways:
   * - **Partial object** — shallow-merges into the current state (plain objects only; others are replaced wholesale).
   * - **Immer recipe** — receives a mutable draft; deep changes are applied structurally.
   *   Not supported for primitive state — use {@link StateApiBase.set} instead.
   */
  update(recipe: Partial<S> | ((draft: Draft<S>) => void)): void;
}

//-------------------------------------------------------
//-- StateApi Pure
//-------------------------------------------------------

/**
 * Read-write API with a pure-function update — no immer dependency.
 * Implemented by {@link ReactiveStatePure}.
 */
export interface StateApiPure<S> extends StateApiBase<S> {
  /**
   * Updates the state in one of two ways:
   * - **Partial object** — shallow-merges into the current state (plain objects only; others are replaced wholesale).
   * - **Pure reducer** — receives the current (deeply readonly) state and must return the new state.
   */
  update(recipe: Partial<S> | ((state: ReadonlyDeep<S>) => S)): void;
}

//-------------------------------------------------------
// config and construction
//-------------------------------------------------------

/**
 * Controls what happens when a state listener throws an error.
 *
 * - `'ignore'`  — silently swallow the error.
 * - `'log'`     — log via `console.log`.
 * - `'warn'`    — log via `console.warn` *(default)*.
 * - `'error'`   — log via `console.error`.
 * - `'throw'`   — rethrow the error (stops remaining listeners from running).
 * - `function`  — call the provided handler with the error.
 */
export type ListenersErrorHandlingType =
  | 'ignore'
  | 'log'
  | 'warn'
  | 'error'
  | 'throw'
  | ((err: unknown) => void);

/** Options passed to the {@link ReactiveState} / {@link ReactiveStatePure} constructor. */
export type ConstructionParams = {
  /** how to handle when a listener throws an error — default is `"warn"` */
  listenersErrorHandling?: ListenersErrorHandlingType;
};

//-------------------------------------------------------
//-- UTILS
//-------------------------------------------------------

/**
 * Recursively makes all properties of `T` readonly.
 * Handles objects, arrays, `Map`, `Set`, and functions (passed through unchanged).
 * Primitives are returned as-is.
 */
export type ReadonlyDeep<T> = T extends (...args: any[]) => any
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<ReadonlyDeep<K>, ReadonlyDeep<V>>
    : T extends Set<infer U>
      ? ReadonlySet<ReadonlyDeep<U>>
      : T extends (infer U)[]
        ? ReadonlyArray<ReadonlyDeep<U>>
        : T extends object
          ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
          : T;
