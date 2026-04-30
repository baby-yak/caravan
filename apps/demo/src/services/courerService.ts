import { Service } from '@baby-yak/herdflow-js';

export type ICounter = {
  state: {
    count: number;
    step: number;
    running: boolean;
  };
  events: {
    incremented: (count: number) => void;
    decremented: (count: number) => void;
    reset: () => void;
  };
  actions: {
    increment(): void;
    decrement(): void;
    setStep(step: number): void;
    reset(): void;
    start(): void;
    stop(): void;
  };
};

export class CounterService extends Service<ICounter> {
  timer: number | undefined;

  constructor() {
    super('counter', { count: 0, step: 1, running: false });
    this.actions.setHandler(this);
  }

  start() {
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.increment();
    }, 1000);

    this.state.update({ running: true });
  }
  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    this.state.update({ running: false });
  }

  increment() {
    const { count, step } = this.state.get();
    this.state.update((s) => {
      s.count += step;
    });
    this.events.emit('incremented', count + step);
  }

  decrement() {
    const { count, step } = this.state.get();
    this.state.update((s) => {
      s.count -= step;
    });
    this.events.emit('decremented', count - step);
  }

  setStep(step: number) {
    this.state.update((s) => {
      s.step = step;
    });
  }

  reset() {
    this.state.update((s) => {
      s.count = 0;
    });
    this.events.emit('reset');
  }
}
