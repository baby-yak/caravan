import { useState } from 'react';

import { ReactiveState, TypedEventEmitter } from '@baby-yak/herdflow-js';
import { useEvent, useReactiveState } from '@baby-yak/herdflow-react';
import { services } from './services/app';

//-------------------------------------------------------
//-------------------------------------------------------

//-------------------------------------------------------
//-------------------------------------------------------

export function App() {
  const [beep, setBeeps] = useState(false);
  const count = useReactiveState(services.counter, (s) => s.count);
  const running = useReactiveState(services.counter, (s) => s.running);
  const step = useReactiveState(services.counter, (s) => s.step);

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

  const s = useReactiveState(state, (s) => s.a, []);

  useEvent(events, 'countup', (x) => {
    setX(x);
  });
  return (
    <div>
      Test {x} <pre>{JSON.stringify(s, null, 2)}</pre>
    </div>
  );
}
