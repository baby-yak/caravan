# Modules

A lifecycle orchestrator for a set of services. `createModule` wires up service clients, runs startup and shutdown in the correct order, and exposes a fully typed `services` map for the rest of the application.

## Quick start

```ts
import { createModule } from '@baby-yak/herdflow-js';

const app = createModule({
  server: new ServerService(),
  db: new DbService(),
});

await app.start();

// Typed clients — no access to service internals
app.services.server.actions.connect(8080);
app.services.server.events.on('connected', () => console.log('online'));
app.services.db.state.subscribe((s) => console.log(s));

await app.stop();

// export the services field to be used across the application
export const services = app.services;
```

## Defining the module type

The app type (meaning the module's exposed services) can be set explicitly or inferred - without a type param, TypeScript infers the shape from the services you pass.

**Inferred Module Descriptor** - simple and fast

```ts
const app = createModule({
  server: new ServerService(),
  db: new DbService(),
});
```

**Explicit Module Descriptor type** - better for type safety and for mocking/changing services later.
(the implementing service does not change the ServiceDescriptor facade)

the module descriptor can accept either `Services<Descriptor>` or raw `ServiceDescriptor` - the resulting module is the same (concrete services).
see example bellow

```ts
type App = {
  counter: Service<ICounter>; // <- full type - Service<D> with descriptor
  server: IServer; // <- shorthand - just the descriptor
  db: IDb;
};

const app = createModule<App>({
  counter: new CounterService(),
  server: new ServerService(), // <- can be interchanged with MockServer with the same ServiceDescriptor
  db: new DbService(),
});
```

## `module.services`

After construction, `module.services` holds a typed `ServiceClient` for each service, keyed by the same names as the constructor input. These are the read-only facades used to interact with services from outside the module.

```ts
app.services.server.state.get();
app.services.server.events.on('connected', handler);
app.services.server.actions.connect(8080);
```

## Lifecycle

### Startup — `module.start()`

Runs three phases in order. Each phase completes across **all** services before the next begins.

```
onServiceInit       — all services run this first
onServiceStart      — all services run this second
onServiceAfterStart — all services run this third
```

### Shutdown — `module.stop()`

```
onServiceBeforeStop — all services run this first
onServiceStop       — all services run this second
```

This sequencing is what makes cross-service coordination safe. By `onServiceStart`, every service has already completed its own initialization, so it's safe to register listeners or call actions on other services.

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

With `verbose: true`, the console will print each transition as it happens:

```
service [ server ] : init
service [ db     ] : init
service [ server ] : start
service [ db     ] : start
...
```
