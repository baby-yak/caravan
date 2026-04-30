# Modules

A lifecycle orchestrator for a set of services. `createModule` wires up service clients, runs startup and shutdown in the correct order, and exposes a fully typed `services` map for the rest of the application.

## Quick start

```ts
import { createModule, Service, ServiceClient } from '@baby-yak/herdflow-js';

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

// start all services:
await app.start();

// later, stop all services (on app exit):
// await app.stop();

// export the service clients container, to be used across the application
// the service clients are types as ServiceClient<Descriptor>
// (client facade for each service - no access to service internals)
export const services = app.services;
```

use the services in other app components:

```ts
services.server.actions.connect(8080);
services.server.events.on('connected', () => console.log('online'));
services.db.state.subscribe((s) => console.log(s));
```

## Defining the module type

The app type (meaning the module's exposed services) can be set explicitly or inferred - without a type param, TypeScript infers the shape from the services you pass.

**Inferred Module Descriptor** - simple and fast

```ts
const app = createModule({
  server: new ServerService(),
  db: new DbService(),
  counter: new CounterService(),
});
```

**Explicit Module Descriptor type** - better for type safety and for mocking/changing services later.
(the implementing service does not change the ServiceDescriptor facade)

the module descriptor can accept:

- `ServiceDescriptor`
- `Services<Descriptor>`
- `ServicesClient<Descriptor>`

the resulting module is the same (concrete services).

```ts
type App = {
  server: IServer; // service descriptor (easiest)
  db: Service<IDb>; // Service<descriptor> wrapper - also works
  counter: ServiceClient<ICounter>; // ServiceClient<descriptor> wrapper - also work
};

// concrete service instances.
// can be interchanged with mock/different implementations with the same ServiceDescriptor
const app = createModule<App>({
  server: new ServerService(),
  db: new DbService(),
  counter: new CounterService(),
});
```

## `module.services`

After construction, `module.services` holds a typed `ServiceClient` for each service, keyed by the same names as the constructor input. These are the read-only facades used to interact with services from outside the module.

```ts
app.services.server.state.get();
app.services.server.events.on('connected', handler);
app.services.server.actions.connect(8080);
```

**`module.services` typing**
If you want the type of the `services` field of the module - there is a helper type

```ts
//from module description (App):
const services: ModuleServiceClients<App> = app.services;

//from module instance itself (typeof app):
const services: ModuleServiceClients<typeof app> = app.services;
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
