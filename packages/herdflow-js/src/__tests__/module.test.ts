import { describe, expect, it, vi } from 'vitest';
import { createModule } from '../modules/moduleFactory.js';
import { Service } from '../services/service.js';

// ---------------------------------------------------------------------------
// Shared test services
// ---------------------------------------------------------------------------

type ICounter = {
  state: { count: number };
  events: { changed: () => void };
  actions: { increment(): void };
};

type ILogger = {
  actions: { log(msg: string): void };
};

class CounterService extends Service<ICounter> {
  constructor() {
    super('counter', { count: 0 });
    this.actions.setHandler(this);
  }
  increment() {
    this.state.update((s) => {
      s.count += 1;
    });
    this.events.emit('changed');
  }
}

class LoggerService extends Service<ILogger> {
  readonly log = vi.fn();
  constructor() {
    super('logger', undefined);
    this.actions.setHandler('log', this.log);
  }
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('Module', () => {
  //-------------------------------------------------------
  //-- construction
  //-------------------------------------------------------
  type ModuleDescriptor = {
    counter: ICounter;
  };

  describe('construction', () => {
    it('exposes typed clients for each service', () => {
      const app = createModule({ counter: new CounterService() });
      expect(app.services.counter).toBeDefined();
      expect(app.services.counter.state).toBeDefined();
      expect(app.services.counter.events).toBeDefined();
      expect(app.services.counter.actions).toBeDefined();
    });

    it('clients are functional — actions invoke the service', () => {
      const app = createModule({ counter: new CounterService() });
      app.services.counter.actions.increment();
      expect(app.services.counter.state.get().count).toBe(1);
    });

    it('clients receive events emitted by the service', () => {
      const app = createModule<{ counter: ICounter }>({ counter: new CounterService() });
      const listener = vi.fn();
      app.services.counter.events.on('changed', listener);
      app.services.counter.actions.increment();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('accepts multiple services', () => {
      const app = createModule<{
        counter: ICounter;
        logger: ILogger;
      }>({
        counter: new CounterService(),
        logger: new LoggerService(),
      });
      expect(app.services.counter).toBeDefined();
      expect(app.services.logger).toBeDefined();
    });
  });

  //-------------------------------------------------------
  //-- lifecycle — start
  //-------------------------------------------------------

  describe('start()', () => {
    it('calls onServiceInit → onServiceStart → onServiceAfterStart in order', async () => {
      const calls: string[] = [];

      class OrderedService extends Service<ICounter> {
        constructor() {
          super('ordered', { count: 0 });
        }
        onServiceInit() {
          calls.push('init');
        }
        onServiceStart() {
          calls.push('start');
        }
        onServiceAfterStart() {
          calls.push('afterStart');
        }
      }

      const app = createModule<ModuleDescriptor>({ counter: new OrderedService() });
      await app.start();

      expect(calls).toEqual(['init', 'start', 'afterStart']);
    });

    it('completes all services in one phase before moving to the next', async () => {
      const calls: string[] = [];

      class PhaseService extends Service<ICounter> {
        constructor(private id: string) {
          super(id, { count: 0 });
        }
        onServiceInit() {
          calls.push(`${this.id}:init`);
        }
        onServiceStart() {
          calls.push(`${this.id}:start`);
        }
      }

      const app = createModule<{ a: ICounter; b: ICounter }>({
        a: new PhaseService('a'),
        b: new PhaseService('b'),
      });
      await app.start();

      expect(calls).toEqual(['a:init', 'b:init', 'a:start', 'b:start']);
    });

    it('awaits async lifecycle methods', async () => {
      const calls: string[] = [];

      class AsyncService extends Service<ICounter> {
        constructor() {
          super('async', { count: 0 });
        }
        async onServiceInit() {
          await Promise.resolve();
          calls.push('init');
        }
        onServiceStart() {
          calls.push('start');
        }
      }

      const app = createModule<ModuleDescriptor>({ counter: new AsyncService() });
      await app.start();

      expect(calls).toEqual(['init', 'start']);
    });
  });

  //-------------------------------------------------------
  //-- lifecycle — stop
  //-------------------------------------------------------

  describe('stop()', () => {
    it('calls onServiceBeforeStop → onServiceStop in order', async () => {
      const calls: string[] = [];

      class StopService extends Service<ICounter> {
        constructor() {
          super('stop', { count: 0 });
        }
        onServiceBeforeStop() {
          calls.push('beforeStop');
        }
        onServiceStop() {
          calls.push('stop');
        }
      }

      const app = createModule<ModuleDescriptor>({ counter: new StopService() });
      await app.start();
      await app.stop();

      expect(calls).toEqual(['beforeStop', 'stop']);
    });

    it('completes all services in beforeStop before any service runs stop', async () => {
      const calls: string[] = [];

      class StopPhaseService extends Service<ICounter> {
        constructor(private id: string) {
          super(id, { count: 0 });
        }
        onServiceBeforeStop() {
          calls.push(`${this.id}:beforeStop`);
        }
        onServiceStop() {
          calls.push(`${this.id}:stop`);
        }
      }

      const app = createModule<{
        a: ICounter;
        b: ICounter;
      }>({
        a: new StopPhaseService('a'),
        b: new StopPhaseService('b'),
      });
      await app.start();
      await app.stop();

      expect(calls).toEqual(['a:beforeStop', 'b:beforeStop', 'a:stop', 'b:stop']);
    });
  });

  //-------------------------------------------------------
  //-- module.state
  //-------------------------------------------------------

  describe('module.state', () => {
    it('isStarted is false before start()', () => {
      const app = createModule({ counter: new CounterService() });
      expect(app.state.get().isStarted).toBe(false);
    });

    it('isStarted becomes true after start()', async () => {
      const app = createModule({ counter: new CounterService() });
      await app.start();
      expect(app.state.get().isStarted).toBe(true);
    });

    it('isStarted becomes false after stop()', async () => {
      const app = createModule({ counter: new CounterService() });
      await app.start();
      await app.stop();
      expect(app.state.get().isStarted).toBe(false);
    });

    it('notifies subscribers when isStarted changes', async () => {
      const app = createModule({ counter: new CounterService() });
      const listener = vi.fn();
      app.state.subscribe(listener);
      await app.start();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ isStarted: true }),
        expect.anything(),
      );
    });
  });

  //-------------------------------------------------------
  //-- module.events
  //-------------------------------------------------------

  describe('module.events', () => {
    it('emits "started" after start() completes', async () => {
      const app = createModule({ counter: new CounterService() });
      const listener = vi.fn();
      app.events.on('started', listener);
      await app.start();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('emits "stopped" after stop() completes', async () => {
      const app = createModule({ counter: new CounterService() });
      const listener = vi.fn();
      app.events.on('stopped', listener);
      await app.start();
      await app.stop();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('"started" fires after all services have completed afterStart', async () => {
      const calls: string[] = [];

      class TrackedService extends Service<ICounter> {
        constructor() {
          super('tracked', { count: 0 });
        }
        onServiceAfterStart() {
          calls.push('afterStart');
        }
      }

      const app = createModule({ counter: new TrackedService() });
      app.events.on('started', () => calls.push('started'));
      await app.start();

      expect(calls).toEqual(['afterStart', 'started']);
    });

    it('"started" fires after isStarted is true', async () => {
      const app = createModule({ counter: new CounterService() });
      let isStartedOnEvent = false;
      app.events.on('started', () => {
        isStartedOnEvent = app.state.get().isStarted;
      });
      await app.start();
      expect(isStartedOnEvent).toBe(true);
    });
  });

  //-------------------------------------------------------
  //-- module.createClient()
  //-------------------------------------------------------

  describe('createClient()', () => {
    it('returns a client with state, events, and services', () => {
      const app = createModule({ counter: new CounterService() });
      const client = app.createClient();
      expect(client.state).toBeDefined();
      expect(client.events).toBeDefined();
      expect(client.services).toBeDefined();
    });

    it('client state reflects module lifecycle', async () => {
      const app = createModule({ counter: new CounterService() });
      const client = app.createClient();
      expect(client.state.get().isStarted).toBe(false);
      await app.start();
      expect(client.state.get().isStarted).toBe(true);
    });

    it('client events fire when module lifecycle events fire', async () => {
      const app = createModule({ counter: new CounterService() });
      const client = app.createClient();
      const listener = vi.fn();
      client.events.on('started', listener);
      await app.start();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('client does not expose start or stop', () => {
      const app = createModule({ counter: new CounterService() });
      const client = app.createClient();
      expect((client as any as Record<string, any>)['start']).toBeUndefined();
      expect((client as any as Record<string, any>)['stop']).toBeUndefined();
    });

    it('client services are the same as module services', () => {
      const app = createModule({ counter: new CounterService() });
      const client = app.createClient();
      expect(client.services.counter).toBe(app.services.counter);
    });
  });

  //-------------------------------------------------------
  //-- lifecycle guards & mutex
  //-------------------------------------------------------

  describe('lifecycle guards', () => {
    it('double start() is a no-op — lifecycle runs only once', async () => {
      const calls: string[] = [];

      class TrackedService extends Service<ICounter> {
        constructor() {
          super('tracked', { count: 0 });
        }
        onServiceInit() {
          calls.push('init');
        }
      }

      const app = createModule({ counter: new TrackedService() });
      await app.start();
      await app.start();
      expect(calls).toEqual(['init']);
    });

    it('double stop() is a no-op', async () => {
      const calls: string[] = [];

      class TrackedService extends Service<ICounter> {
        constructor() {
          super('tracked', { count: 0 });
        }
        onServiceStop() {
          calls.push('stop');
        }
      }

      const app = createModule({ counter: new TrackedService() });
      await app.start();
      await app.stop();
      await app.stop();
      expect(calls).toEqual(['stop']);
    });

    it('stop() called concurrently with start() waits for start to finish first', async () => {
      const calls: string[] = [];

      class SlowService extends Service<ICounter> {
        constructor() {
          super('slow', { count: 0 });
        }
        async onServiceInit() {
          await new Promise<void>((resolve) => setTimeout(resolve, 10));
          calls.push('init');
        }
        onServiceStop() {
          calls.push('stop');
        }
      }

      const app = createModule({ counter: new SlowService() });
      const startPromise = app.start();
      const stopPromise = app.stop(); // queued behind start
      await Promise.all([startPromise, stopPromise]);
      expect(calls).toEqual(['init', 'stop']);
    });
  });

  //-------------------------------------------------------
  //-- verbose
  //-------------------------------------------------------

  describe('verbose option', () => {
    it('logs each lifecycle phase when verbose is true', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

      class SimpleService extends Service<ICounter> {
        constructor() {
          super('simple', { count: 0 });
        }
      }

      const app = createModule({ counter: new SimpleService() }, { verbose: true });
      await app.start();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not log when verbose is false', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

      class SimpleService extends Service<ICounter> {
        constructor() {
          super('simple', { count: 0 });
        }
      }

      const app = createModule({ counter: new SimpleService() }, { verbose: false });
      await app.start();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
