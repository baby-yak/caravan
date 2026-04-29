import { describe, expect, it, vi } from 'vitest';
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

  //-------------------------------------------------------
  //-- lifecycle defaults
  //-------------------------------------------------------

  describe('lifecycle defaults', () => {
    it('onServiceInit returns undefined by default', async () => {
      const s = new CounterService();
      await expect(Promise.resolve(s.onServiceInit())).resolves.toBeUndefined();
    });

    it('onServiceStart returns undefined by default', async () => {
      const s = new CounterService();
      await expect(Promise.resolve(s.onServiceStart())).resolves.toBeUndefined();
    });

    it('onServiceAfterStart returns undefined by default', async () => {
      const s = new CounterService();
      await expect(Promise.resolve(s.onServiceAfterStart())).resolves.toBeUndefined();
    });

    it('onServiceBeforeStop returns undefined by default', async () => {
      const s = new CounterService();
      await expect(Promise.resolve(s.onServiceBeforeStop())).resolves.toBeUndefined();
    });

    it('onServiceStop returns undefined by default', async () => {
      const s = new CounterService();
      await expect(Promise.resolve(s.onServiceStop())).resolves.toBeUndefined();
    });
  });
});
