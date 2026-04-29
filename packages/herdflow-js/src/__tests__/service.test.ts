import { describe, expect, it, vi } from 'vitest';
import { Module } from '../modules/module.js';
import { createService } from '../services/serviceFactory.js';
import { Service } from '../services/service.js';

// ---------------------------------------------------------------------------
// Shared test descriptors
// ---------------------------------------------------------------------------

type ICounter = {
  state: { count: number };
  events: { changed: () => void };
  actions: { increment(): void; add(n: number): number };
};

type IStateless = {
  actions: { ping(): string };
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

  add(n: number) {
    this.state.update((s) => {
      s.count += n;
    });
    return this.state.get().count;
  }
}

class StatelessService extends Service<IStateless> {
  constructor() {
    super('stateless', undefined);
    this.actions.setHandler('ping', () => 'pong');
  }
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('Service', () => {
  //-------------------------------------------------------
  //-- construction
  //-------------------------------------------------------

  describe('construction', () => {
    it('stores the name', () => {
      const s = new CounterService();
      expect(s.name).toBe('counter');
    });

    it('initializes state with the given value', () => {
      const s = new CounterService();
      expect(s.state.get().count).toBe(0);
    });

    it('supports undefined state when no state in descriptor', () => {
      const s = new StatelessService();
      expect(s.state.get()).toBeUndefined();
    });

    it('expose invoke as shorthand for the action client', () => {
      const s = new CounterService();
      expect(s.invoke).toBe(s.actions.invoke);
    });
  });

  //-------------------------------------------------------
  //-- getClient
  //-------------------------------------------------------

  describe('getClient()', () => {
    it('returns a client with state, events, and actions', () => {
      const client = new CounterService().getClient();
      expect(client.state).toBeDefined();
      expect(client.events).toBeDefined();
      expect(client.actions).toBeDefined();
    });

    it('returns a new instance on each call', () => {
      const s = new CounterService();
      expect(s.getClient()).not.toBe(s.getClient());
    });

    it('client state reflects service state updates', () => {
      const s = new CounterService();
      const client = s.getClient();
      s.state.update((d) => {
        d.count = 42;
      });
      expect(client.state.get().count).toBe(42);
    });

    it('client can subscribe to state changes', () => {
      const s = new CounterService();
      const client = s.getClient();
      const listener = vi.fn();
      client.state.subscribe(listener);
      s.invoke.increment();
      // subscribe fires immediately (initial state), then again on each update
      // listener receives (newState, prevState)
      expect(listener).toHaveBeenLastCalledWith(
        expect.objectContaining({ count: 1 }),
        expect.anything(),
      );
    });

    it('client receives events emitted by the service', () => {
      const s = new CounterService();
      const client = s.getClient();
      const listener = vi.fn();
      client.events.on('changed', listener);
      s.invoke.increment();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('client can invoke actions', () => {
      const s = new CounterService();
      const client = s.getClient();
      client.actions.increment();
      expect(s.state.get().count).toBe(1);
    });

    it('client action return values are preserved', () => {
      const s = new CounterService();
      const client = s.getClient();
      const result = client.actions.add(5);
      expect(result).toBe(5);
    });
  });

  //-------------------------------------------------------
  //-- this.invoke inside the service
  //-------------------------------------------------------

  describe('this.invoke', () => {
    it('calls through to registered handlers', () => {
      const s = new CounterService();
      s.invoke.increment();
      expect(s.state.get().count).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// createService
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('createService()', () => {
  //-------------------------------------------------------
  //-- construction
  //-------------------------------------------------------

  describe('construction', () => {
    it('stores the name', () => {
      const s = createService<ICounter>('counter', { count: 0 });
      expect(s.name).toBe('counter');
    });

    it('initializes state with the given value', () => {
      const s = createService<ICounter>('counter', { count: 7 });
      expect(s.state.get().count).toBe(7);
    });

    it('supports undefined state when no state in descriptor', () => {
      const s = createService<IStateless>('stateless', undefined);
      expect(s.state.get()).toBeUndefined();
    });

    it('getClient() returns a client with state, events, and actions', () => {
      const client = createService<ICounter>('counter', { count: 0 }).getClient();
      expect(client.state).toBeDefined();
      expect(client.events).toBeDefined();
      expect(client.actions).toBeDefined();
    });

    it('actions and events work the same as OOP style', () => {
      const s = createService<ICounter>('counter', { count: 0 });
      const listener = vi.fn();
      s.actions.setHandler('increment', () => {
        s.state.update((d) => {
          d.count += 1;
        });
        s.events.emit('changed');
      });
      s.getClient().events.on('changed', listener);
      s.invoke.increment();
      expect(s.state.get().count).toBe(1);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  //-------------------------------------------------------
  //-- lifecycle callbacks
  //-------------------------------------------------------
  type ModuleDescriptor = {
    s: ICounter;
  };

  describe('lifecycle callbacks', () => {
    it('onInit is called during module.start()', async () => {
      const s = createService<ICounter>('counter', { count: 0 });
      const onInit = vi.fn();
      s.onInit = onInit;
      await new Module<ModuleDescriptor>({ s }).start();
      expect(onInit).toHaveBeenCalledTimes(1);
    });

    it('onStart is called during module.start()', async () => {
      const s = createService<ICounter>('counter', { count: 0 });
      const onStart = vi.fn();
      s.onStart = onStart;
      await new Module<ModuleDescriptor>({ s }).start();
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('onAfterStart is called during module.start()', async () => {
      const s = createService<ICounter>('counter', { count: 0 });
      const onAfterStart = vi.fn();
      s.onAfterStart = onAfterStart;
      await new Module<ModuleDescriptor>({ s }).start();
      expect(onAfterStart).toHaveBeenCalledTimes(1);
    });

    it('onBeforeStop is called during module.stop()', async () => {
      const s = createService<ICounter>('counter', { count: 0 });
      const onBeforeStop = vi.fn();
      s.onBeforeStop = onBeforeStop;
      const app = new Module<ModuleDescriptor>({ s });
      await app.start();
      await app.stop();
      expect(onBeforeStop).toHaveBeenCalledTimes(1);
    });

    it('onStop is called during module.stop()', async () => {
      const s = createService<ICounter>('counter', { count: 0 });
      const onStop = vi.fn();
      s.onStop = onStop;
      const app = new Module<ModuleDescriptor>({ s });
      await app.start();
      await app.stop();
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('all five callbacks fire in correct phase order', async () => {
      const calls: string[] = [];
      const s = createService<ICounter>('counter', { count: 0 });
      s.onInit = () => {
        calls.push('init');
      };
      s.onStart = () => {
        calls.push('start');
      };
      s.onAfterStart = () => {
        calls.push('afterStart');
      };
      s.onBeforeStop = () => {
        calls.push('beforeStop');
      };
      s.onStop = () => {
        calls.push('stop');
      };
      const app = new Module<ModuleDescriptor>({ s });
      await app.start();
      await app.stop();
      expect(calls).toEqual(['init', 'start', 'afterStart', 'beforeStop', 'stop']);
    });

    it('async callbacks are awaited before the next phase', async () => {
      const calls: string[] = [];
      const s = createService<ICounter>('counter', { count: 0 });
      s.onInit = async () => {
        await Promise.resolve();
        calls.push('init');
      };
      s.onStart = () => {
        calls.push('start');
      };
      await new Module<ModuleDescriptor>({ s }).start();
      expect(calls).toEqual(['init', 'start']);
    });

    it('unassigned callbacks are no-ops — no throw', async () => {
      const s = createService<ICounter>('counter', { count: 0 });
      // no callbacks assigned
      await expect(new Module<ModuleDescriptor>({ s }).start()).resolves.toBeUndefined();
    });
  });

  //-------------------------------------------------------
  //-- interop with OOP services
  //-------------------------------------------------------

  describe('interop', () => {
    it('works alongside OOP services in the same Module', async () => {
      const calls: string[] = [];

      class OopCounter extends Service<ICounter> {
        constructor() {
          super('oop', { count: 0 });
        }
        protected onServiceInit() {
          calls.push('oop:init');
        }
        protected onServiceStart() {
          calls.push('oop:start');
        }
      }

      const composed = createService<ICounter>('composed', { count: 0 });
      composed.onInit = () => {
        calls.push('composed:init');
      };
      composed.onStart = () => {
        calls.push('composed:start');
      };

      await new Module<{ oop: ICounter; composed: ICounter }>({
        oop: new OopCounter(),
        composed,
      }).start();

      expect(calls).toEqual(['oop:init', 'composed:init', 'oop:start', 'composed:start']);
    });
  });
});
