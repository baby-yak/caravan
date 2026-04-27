import {
  useState
} from 'react';

import {
  ReactiveState,
  TypedEventEmitter
} from '@baby-yak/herdflow-js';
import { useEvent, useReactiveState, useReactiveStateSelect } from '@baby-yak/herdflow-react';

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
