import classNames from 'classnames';
import styles from './counter.module.css';
import Card from '../ui/card';
import { useAction, useEvent, useReactiveState } from '@baby-yak/herdflow-react';
import { services } from '../services/app';
import { useRef, useState } from 'react';
import { Logger, type LoggerRef } from '../ui/logger';

const TAG = 'counter';
type Props = {};

export default function Counter({}: Props) {
  const refLogger = useRef<LoggerRef>(null);

  const count = useReactiveState(services.counter, (s) => s.count);
  const running = useReactiveState(services.counter, (s) => s.running);
  const step = useReactiveState(services.counter, (s) => s.step);

  //actions
  const increment = services.counter.actions.increment;
  const decrement = services.counter.actions.decrement;
  const setStep = services.counter.actions.setStep;
  const reset = services.counter.actions.reset;
  const start = services.counter.actions.start;
  const stop = services.counter.actions.stop;

  useEvent(services.counter, 'incremented', (count) => {
    refLogger.current?.log(`incremented: ${count}`);
  });
  useEvent(services.counter, 'decremented', (count) => {
    refLogger.current?.log(`decremented: ${count}`);
  });
  useEvent(services.counter, 'reset', () => {
    refLogger.current?.log(`reset`);
  });

  return (
    <Card data-component={TAG} className={classNames(styles.root)}>
      <div>count : {count} </div>
      <div>running : {running ? 'running' : 'idle'} </div>
      <div>step : {step} </div>
      <div className={classNames(styles.buttons)}>
        <button onClick={() => increment()}>increment</button>
        <button onClick={() => decrement()}>decrement</button>
        <button onClick={() => setStep(10)}>setStep</button>
        <button onClick={() => reset()}>reset</button>
        <button onClick={() => start()}>start</button>
        <button onClick={() => stop()}>stop</button>
      </div>
      <Logger ref={refLogger} />
    </Card>
  );
}
