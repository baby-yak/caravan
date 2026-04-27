import type { StateSelectFn, StateSource } from '@baby-yak/herdflow-js';
import { type DependencyList, useCallback, useMemo, useSyncExternalStore } from 'react';

export function useReactiveState<S>(state: StateSource<S>, deps?: DependencyList) {
  deps = deps ?? [];

  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => state.subscribe(onStoreChange), deps),
    useCallback(() => state.get(), deps),
    useCallback(() => state.getInitialState(), deps),
  );
}

export function useReactiveStateSelect<S, U>(
  state: StateSource<S>,
  selectFn: StateSelectFn<S, U>,
  deps?: DependencyList,
) {
  deps = deps ?? [];

  const selector = useMemo(() => state.select(selectFn), deps);

  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => state.subscribe(onStoreChange), deps),
    useCallback(() => selector.get(), deps),
    useCallback(() => selector.getInitialState(), deps),
  );
}
