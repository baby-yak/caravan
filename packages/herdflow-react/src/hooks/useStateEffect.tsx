import type {
  ServiceClient,
  StateClient,
  StateListener,
  StateSelectFn,
} from '@baby-yak/herdflow-js';
import { useEffect, type DependencyList } from 'react';
import { extractState } from '../utils.js';

//-------------------------------------------------------
// overload 1: whole state
//-------------------------------------------------------

/**
 * Runs a side effect whenever state changes — without causing a re-render.
 * The callback is also called once on mount with `prev = undefined`.
 *
 * @param target a `StateClient` or a `ServiceClient` with state
 * @param callback called with `(state, prev)` on every change; `prev` is `undefined` on the first call
 * @param deps controls when the subscription is re-created — include any values the callback closes over
 */
export function useStateEffect<S>(
  target: StateClient<S> | ServiceClient<{ state: S }>,
  callback: StateListener<S>,
  deps?: DependencyList,
): void;

//-------------------------------------------------------
// overload 2: with select function
//-------------------------------------------------------

/**
 * Runs a side effect whenever a selected slice of state changes — without causing a re-render.
 * The callback is also called once on mount with `prev = undefined`.
 *
 * @param target a `StateClient` or a `ServiceClient` with state
 * @param selector extracts the slice of state to watch
 * @param callback called with `(selected, prev)` on every change; `prev` is `undefined` on the first call
 * @param deps controls when the subscription is re-created — include any values the callback closes over
 */
export function useStateEffect<S, U = S>(
  target: StateClient<S> | ServiceClient<{ state: S }>,
  selector: StateSelectFn<S, U>,
  callback: StateListener<U>,
  deps?: DependencyList,
): void;

//-------------------------------------------------------
// overloads implementation (just routing to implementing function bellow)
//-------------------------------------------------------

export function useStateEffect<S, U = S>(
  a: StateClient<S> | ServiceClient<{ state: S }>,
  b: StateListener<S> | StateSelectFn<S, U>,
  c?: DependencyList | StateListener<U>,
  d?: DependencyList,
) {
  // router function to match overloaded args
  const target = a;
  let selector: StateSelectFn<S, U> | undefined = undefined;
  let callback: StateListener<S> | StateListener<U> | undefined = undefined;
  let deps: DependencyList | undefined = undefined;

  if (c == null || Array.isArray(c)) {
    callback = b;
    deps = c;
  } else {
    selector = b as StateSelectFn<S, U>;
    callback = c as StateListener<U>;
    deps = d;
  }
  useStateEffect_imp(target, selector, callback, deps);
}

//-------------------------------------------------------
// implementation
//-------------------------------------------------------

function useStateEffect_imp<S, U = S>(
  target: StateClient<S> | ServiceClient<{ state: S }>,
  selector: StateSelectFn<S, U> | undefined,
  callback: StateListener<any>,
  deps?: DependencyList,
) {
  useEffect(() => {
    if (selector) {
      return extractState(target).select(selector).subscribe(callback);
    }
    return extractState(target).subscribe(callback);
  }, deps ?? []);
}
