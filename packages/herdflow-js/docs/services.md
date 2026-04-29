# Services

A typed base class for building self-contained, composable services. Each service owns its state, events, and actions — and exposes a read-only client for use by the rest of the application.

## Quick start

```ts
import { Service } from '@baby-yak/herdflow-js';

type ICounter = {
  state: { count: number };
  events: { changed: () => void };
  actions: { increment(): void; reset(): void };
};

class CounterService extends Service<ICounter> {
  constructor() {
    super('counter', { count: 0 });
    this.actions.setHandler(this);
  }

  increment() {
    this.state.update(s => { s.count += 1; });
    this.events.emit('changed');
  }

  reset() {
    this.state.update(s => { s.count = 0; });
    this.events.emit('changed');
  }
}

const counter = new CounterService();
const client = counter.getClient();

client.events.on('changed', () => console.log(client.state.get().count));
client.actions.increment(); // 1
client.actions.increment(); // 2
client.actions.reset();     // 0
```

## Defining a service descriptor

A descriptor is a plain type literal that describes the shape of the service. Pass it as the type parameter to `Service<Desc>`.

```ts
type IServer = {
  state: { address: string; port: number };
  events: { connected: () => void; disconnected: (reason: string) => void };
  actions: { connect(port: number): void; disconnect(): void };
};

class ServerService extends Service<IServer> { ... }
```

All three fields are optional. Omit any you don't need:

```ts
type ILogger = {
  actions: { log(message: string): void };
  // no state, no events
};
```

## State

`this.state` is a `ReactiveState` instance scoped to this service. Use `update()` to mutate and `get()` to read.

```ts
this.state.update(s => { s.address = `host:${port}`; }); // immer recipe
this.state.update({ address: 'host:8080' });              // shallow merge
this.state.get();                                          // read current value
```

## Events

`this.events` is a `TypedEventEmitter` scoped to this service. Emit events internally; external consumers listen through the client.

```ts
this.events.emit('connected');
this.events.emit('disconnected', 'timeout');
```

## Actions

`this.actions` is an `ActionExecuter`. Register handlers using `setHandler`.

```ts
// Bulk — wire up all methods from a class instance at once
this.actions.setHandler(this);

// Individual — useful for lambdas or overriding one method
this.actions.setHandler('connect', (port) => { ... });
```

Use `this.invoke` to call actions from within the service itself:

```ts
this.invoke.connect(8080);
```

## Getting a client

`getClient()` returns a `ServiceClient` — a read-only facade with typed `state`, `events`, and `actions`. This is what external code (and `Module`) uses to interact with the service.

```ts
const client = service.getClient();

client.state.get();                        // read state
client.state.subscribe(s => { ... });      // reactive subscription
client.events.on('connected', () => { }); // listen to events
client.actions.connect(8080);             // invoke actions
```

Each call to `getClient()` creates a new client instance. This is intentional — different consumers can manage their own listener groups independently.

## Lifecycle methods

Override these in your subclass. They are called automatically by `Module` during startup and shutdown, in order.

| Method | When is it called | Intended use |
|--------|-------------|--------------|
| `onServiceInit` | First, before any other service starts | Self-contained setup — connect to DB, read config, initialize internal state |
| `onServiceStart` | After all services have initialized | Cross-service wiring — register listeners on other services, invoke actions on them |
| `onServiceAfterStart` | After all services have started | Post-wiring cleanup — e.g. attach a catch-all route after all other routes are mounted |
| `onServiceBeforeStop` | First, while all services are still running | Cross-service operations before teardown |
| `onServiceStop` | After all services have completed `onServiceBeforeStop` | Self-contained teardown — close connections, unregister listeners |

```ts
class ServerService extends Service<IServer> {
  async onServiceInit() {
    // runs first — safe for standalone setup
    this.invoke.connect(8080);
  }

  onServiceStart() {
    // all other services are initialized — safe to interact with them
    const db = appModule.services.db;
    db.on("connected", async ()=>{ /* notify clients */ })
    await db.connect();
  }

  onServiceStop() {
    this.invoke.disconnect();
  }
}
```
