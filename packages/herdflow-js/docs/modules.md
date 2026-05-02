# Modules

A lifecycle orchestrator for a set of services. `createModule` wires up service clients, runs startup and shutdown in the correct order, and exposes a fully typed `services` map for the rest of the application.

## Quick start

```ts
import { createModule } from '@baby-yak/herdflow-js';

type App = {
  counter: ICounter; // <- service descriptor
  server: IServer;
  db: IDb;
};

const app = createModule({
  counter: new CounterService(),
  server: new ServerService(),
  db: new DbService(),
});

// start all services — fire and forget, errors go to module.events
app.start();

// later, stop all services (on app exit):
// app.stop();

// export the service clients container, to be used across the application
export const services = app.services;
```

Use the services in other app components:

```ts
services.server.actions.connect(8080);
services.server.events.on('connected', () => console.log('online'));
services.db.state.subscribe((s) => console.log(s));
```

## Defining the module type

The module type can be set explicitly or inferred — without a type param, TypeScript infers the shape from the services you pass.

**Inferred** — simple and fast:

```ts
const app = createModule({
  server: new ServerService(),
  db: new DbService(),
  counter: new CounterService(),
});
```

**Explicit** — better for type safety and for swapping implementations later.
The descriptor can accept `ServiceDescriptor`, `Service<D>`, or `ServiceClient<D>` as values:

```ts
type App = {
  server: IServer;              // service descriptor (easiest)
  db: Service<IDb>;             // Service<D> wrapper — also works
  counter: ServiceClient<ICounter>; // ServiceClient<D> wrapper — also works
};

const app = createModule<App>({
  server: new ServerService(),
  db: new DbService(),
  counter: new CounterService(),
});
```

## `module.services`

After construction, `module.services` holds a typed `ServiceClient` for each service, keyed by the same names as the constructor input.

```ts
app.services.server.state.get();
app.services.server.events.on('connected', handler);
app.services.server.actions.connect(8080);
```

**Typing `module.services`** — use `ModuleServiceClients` to get the type:

```ts
// from the descriptor type:
const services: ModuleServiceClients<App> = app.services;

// from the module instance:
const services: ModuleServiceClients<typeof app> = app.services;
```

## `module.state`

Reactive lifecycle state. Subscribe to react to `isStarted` changes without polling.

```ts
app.state.subscribe((state) => {
  console.log('module started:', state.isStarted);
});

// or get current value:
const { isStarted } = app.state.get();
```

`isStarted` is `true` after `start()` completes and `false` after `stop()`.

## `module.events`

Lifecycle events fired after each operation completes.

```ts
app.events.on('started', () => console.log('all services ready'));
app.events.on('stopped', () => console.log('all services stopped'));
app.events.on('errorStarting', (err) => console.error('start failed:', err));
app.events.on('errorStopping', (err) => console.error('stop failed:', err));
```

If no listener is registered for `errorStarting` or `errorStopping`, the error is logged to `console.error` by default.

## `module.client`

A `ModuleClient` — a read-only facade with `state`, `events`, and `services`, but without `start` or `stop`. Safe to pass to consumers who should observe the module but not control its lifecycle.

```ts
const client = app.client;
client.state.subscribe(...)   // ✓
client.events.on(...)         // ✓
client.services.server...     // ✓
client.start()                // ✗ — not available
```

## Lifecycle

### Startup — `module.start()`

Returns `void` — fire and forget. React to completion via events or `waitForStart()`.

```ts
app.start();
app.events.on('started', () => { /* all services ready */ });

// or await completion explicitly:
app.start();
await app.waitForStart(); // resolves on 'started', rejects on 'errorStarting'
```

Runs three phases in order. Within each phase all services run **in parallel**; the next phase begins only after all services complete the current one.

```
init        — all services run in parallel
start       — all services run in parallel
afterStart  — all services run in parallel
```

### Shutdown — `module.stop()`

Same pattern — void, event-driven.

```ts
app.stop();
await app.waitForStop(); // resolves on 'stopped', rejects on 'errorStopping'
```

```
beforeStop  — all services run in parallel
stop        — all services run in parallel
```

This sequencing is what makes cross-service coordination safe. By `onServiceStart`, every service has already completed its own initialization, so it's safe to register listeners or call actions on other services.

Concurrent calls are safe — a `stop()` queued while `start()` is in progress will wait for start to finish first.

See [→ docs/services.md](./services.md) for what each lifecycle method is intended for.

## Options

```ts
const app = createModule(
  { server: new ServerService() },
  {
    verbose: true, // log each lifecycle phase per service
  },
);
```

With `verbose: true`, the console prints each phase transition as it completes:

```
module initialization...
 > service [ server ] : init complete
 > service [ db     ] : init complete
 > service [ server ] : start complete
 > service [ db     ] : start complete
module initialization complete
```
