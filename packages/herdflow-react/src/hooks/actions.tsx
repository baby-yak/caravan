import {
  type ActionClient,
  type ActionMap,
  type ActionNames,
  type ActionParams,
  type ActionReturnType,
  type ServiceClient,
} from '@baby-yak/herdflow-js';
import { useCallback, useRef, useState } from 'react';
import { extractActions } from '../utils.js';

/**
 * Returns a typed action function from a service or action client.
 * Equivalent to calling `services.myService.actions.someAction` directly —
 * just a typed convenience wrapper for uniform hook-style access.
 *
 * @param target an `ActionClient` or a `ServiceClient` with actions
 * @param action the action name to retrieve
 */
export function useAction<T_ActionMap extends ActionMap, T_Action extends ActionNames<T_ActionMap>>(
  target: ActionClient<T_ActionMap> | ServiceClient<{ actions: T_ActionMap }>,
  action: T_Action,
) {
  return extractActions(target)[action];
}

//-------------------------------------------------------
//-- useActionAsync
//-------------------------------------------------------

export function useActionAsync<
  T_ActionMap extends ActionMap,
  T_Action extends ActionNames<T_ActionMap>,
>(
  target: ActionClient<T_ActionMap> | ServiceClient<{ actions: T_ActionMap }>,
  action: T_Action,
): AsyncAction<T_ActionMap, T_Action>;

// export function useActionAsync<
//   T_ActionMap extends ActionMap,
//   T_Action extends ActionNames<T_ActionMap>,
// >(
//   target:()=>,
// ): AsyncAction<T_ActionMap, T_Action>

export function useActionAsync<
  T_ActionMap extends ActionMap,
  T_Action extends ActionNames<T_ActionMap>,
>(
  target: ActionClient<T_ActionMap> | ServiceClient<{ actions: T_ActionMap }>,
  action: T_Action,
): AsyncAction<T_ActionMap, T_Action> {
  const refExecutionContext = useRef({});

  const [state, setState] = useState<AsyncActionState<T_ActionMap, T_Action>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isError: false,
  });

  const execute = useCallback((...args: ActionParams<T_ActionMap, T_Action>) => {
    const fn = extractActions(target)[action];

    const run = async () => {
      //new exec context
      const context = {};
      refExecutionContext.current = context;

      try {
        setState((s) => ({
          ...s,
          data: undefined,
          error: undefined,
          isLoading: true,
          isError: false,
        }));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res = await fn(...args);
        if (context !== refExecutionContext.current) {
          // result does not match last (user re-ran the action) - ignore.
          return;
        }
        setState((s) => ({
          ...s,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: res,
          error: undefined,
          isLoading: false,
          isError: false,
        }));
      } catch (error) {
        if (context !== refExecutionContext.current) {
          // result does not match last (user re-ran the action) - ignore.
          return;
        }
        setState((s) => ({
          ...s,
          data: undefined,
          error: error,
          isLoading: false,
          isError: true,
        }));
      }
    };

    //just run
    run().catch(() => {});
  }, []);

  return { ...state, execute };
}

//-------------------------------------------------------
//-- types
//-------------------------------------------------------

export type AsyncActionState<
  T_ActionMap extends ActionMap,
  T_Action extends ActionNames<T_ActionMap>,
> = {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  data: Awaited<ActionReturnType<T_ActionMap, T_Action>> | undefined;
  error: unknown;
  isLoading: boolean;
  isError: boolean;
};
//-------------------------------------------------------

export type AsyncAction<
  T_ActionMap extends ActionMap,
  T_Action extends ActionNames<T_ActionMap>,
> = AsyncActionState<T_ActionMap, T_Action> & {
  execute: (...args: ActionParams<T_ActionMap, T_Action>) => void;
};
//-------------------------------------------------------
