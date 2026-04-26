import {
  EventListener,
  EventMap,
  EventNames,
  EventSource,
  TypedEventEmitter,
} from '@baby-yak/events-events';
import { ReactiveState, StateListener, StateSelectFn, StateSource } from '@baby-yak/state-state';
import {
  DependencyList,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

type Events = {
  beep: () => void;
  countup: (x: number) => void;
};
const events = new TypedEventEmitter<Events>();
const state = new ReactiveState({ a: 1, b: 2 });

setInterval(() => {
  events.emit('beep');
  //events.emit('countup', 9 as any, 9 as any);
}, 1000);

let x = 0;
setInterval(() => {
  x++;
  events.emit('countup', x);
}, 100);

events.subscribe('newListener', (event) => console.log(`>>   sub: ${event}`));
events.subscribe('removeListener', (event) => console.log(`>> unsub: ${event}`));
events.subscribe('*', (event) => console.log(`>> event: ${event}`));

//-------------------------------------------------------
//-------------------------------------------------------

function useEvent<EVENTS extends EventMap, EVENTNAME extends EventNames<EVENTS>>(
  events: EventSource<EVENTS>,
  event: EVENTNAME,
  listener: EventListener<EVENTS, EVENTNAME>,
  deps?: DependencyList,
) {
  useEffect(() => {
    const cleanup = events.subscribe(event, listener);
    return () => {
      cleanup();
    };
  }, deps || []);
}

function useReactiveState<S>(state: StateSource<S>, deps?: DependencyList) {
  deps = deps ?? [];

  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => state.subscribe(onStoreChange), deps),
    useCallback(() => state.get(), deps),
    useCallback(() => state.getInitialState(), deps),
  );
}

function useReactiveStateSelect<S, U>(
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

//-------------------------------------------------------
//-------------------------------------------------------

export function App() {
  const [beep, setBeeps] = useState(false);
  useEvent(events, 'beep', () => {
    setBeeps((s) => !s);
  });
  const s = useReactiveState(state);

  return (
    <div>
      <h1>Caravan Demo</h1>
      <p>Demo app for @baby-yak packages.</p>
      <pre>{JSON.stringify(s, null, 2)}</pre>
      <button onClick={() => state.update((x) => x.a++)}>A</button>
      <button onClick={() => state.update((x) => (x.b = x.a ** 2))}>B</button>
      <button onClick={() => state.update({ a: 100 })}>?</button>

      <div>
        <div> beep {beep ? 'ON' : 'OFF'}</div>
      </div>
      <br />
      {beep && (
        <>
          <Test />
          <Test />
          <Test />
        </>
      )}
    </div>
  );
}

type TestProps = {};

function Test({}: TestProps) {
  const [x, setX] = useState(0);

  const s = useReactiveStateSelect(state, (s) => s.a, []);

  useEvent(events, 'countup', (x) => {
    setX(x);
  });
  return (
    <div>
      Test {x} <pre>{JSON.stringify(s, null, 2)}</pre>
    </div>
  );
}
