# @baby-yak/herdflow-js

> [!IMPORTANT]
> **Beta** - API is stable but the package is still early. Feedback welcome.

A typed TypeScript toolkit for building event-driven, reactive applications — events, state, and services in one package.

## Install

```bash
npm install @baby-yak/herdflow-js
```

## What's inside

| Module   | Description                                                      | Docs                                     |
| -------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Services | Typed base class for building self-contained services            | [→ docs/services.md](./docs/services.md) |
| Modules  | Lifecycle orchestrator for a set of services                     | [→ docs/modules.md](./docs/modules.md)   |
| Events   | Typed event emitter with wildcard, once, and async/await support | [→ docs/events.md](./docs/events.md)     |
| State    | Reactive state with immer and selector support                   | [→ docs/state.md](./docs/state.md)       |
| Actions  | Action dispatcher                                                | [→ docs/actions.md](./docs/actions.md)   |

## Quick start

### Services

Services are complete behaviour components.
They hold state, fire events and have invoked actions.
First we define the service "shape":

```ts
import { Service } from '@baby-yak/herdflow-js';

type IServer = {
  state: { address: string };
  events: { connected: () => void };
  actions: { connect(port: number): void };
};
```

Now we can create the service - there are two supported styles for that.
Choose you weapon:

**options 1: OOP — extend `Service` and override methods:**

```ts
import { Service } from '@baby-yak/herdflow-js';

class ServerService extends Service<IServer> {
  constructor() {
    super('server', { address: '' });
    this.actions.setHandler(this);
  }

  protected onServiceInit() {
    /* standalone setup */
  }
  protected onServiceStart() {
    /* cross-service wiring */
  }

  connect(port: number) {
    this.state.update((s) => {
      s.address = `host:${port}`;
    });
    this.events.emit('connected');
  }
}

// then later instantiate:
const server = new ServerService();
```

**Options 2: Compositional — `createService()` factory method.**
(Can assign lifecycle callbacks)

```ts
import { createService } from '@baby-yak/herdflow-js';

const server = createService<IServer>('server', { address: '' });

// life cycle
server.onInit = async () => {
  /* standalone setup */
};
server.onStart = () => {
  /* cross-service wiring */
};

// implement service's actions and use state and events:
server.actions.setHandler('connect', (port) => {
  server.state.update((s) => {
    s.address = `host:${port}`;
  });
  server.events.emit('connected');
});
```

[→ Full services docs](./docs/services.md)

---

### Modules

Collect services into a module. Call `start()` to run the lifecycle and access typed clients via `module.services`.

```ts
import { createModule } from '@baby-yak/herdflow-js';

// define Module's services
type App = {
  server: IServer; // service descriptor (easiest)
  db: Service<IDb>; // Service<descriptor> wrapper - also works
  counter: ServiceClient<ICounter>; // ServiceClient<descriptor> wrapper - also work
};

// create the module (with concrete services)
const app = createModule<App>({
  server: new ServerService(),
  db: new DbService(),
  counter: new CounterService(),
});

await app.start();
await app.stop();

// export the services client facade to the world:
// the type is { [name] : ServiceClient<descriptor> }
export const services = app.services;
```

**Optionally** - infer `<ModuleDescriptor>` from provided services

```ts
import { createModule } from '@baby-yak/herdflow-js';

const app = createModule({
  server: new ServerService(),
  db: new DbService(),
});
```

**Using the services:**

```ts
const server = app.services.server;
server.actions.connect(8080);
server.events.on('connected', () => console.log('connected!'));
server.state.subscribe((s) => console.log(s.address));

const db = app.services.db;
const newItem = await db.actions.addItem('hat');
```

[→ Full modules docs](./docs/modules.md)

---

### Events

```ts
import { TypedEventEmitter } from '@baby-yak/herdflow-js';

type AppEvents = {
  userJoined: (userId: string) => void;
  scoreChanged: (userId: string, score: number) => void;
};

const emitter = new TypedEventEmitter<AppEvents>();
emitter.on('userJoined', (id) => console.log(id));
emitter.emit('userJoined', 'alice');
```

---

### State

```ts
import { ReactiveState } from '@baby-yak/herdflow-js';

const state = new ReactiveState({ count: 0, name: 'Alice' });

state.subscribe((next) => console.log(next.count));

state.update({ count: 1 }); // shallow merge
state.update((draft) => {
  draft.count += 1;
}); // immer recipe
```

---

### Actions

```ts
import { ActionExecuter } from '@baby-yak/herdflow-js';

type AppActions = {
  greet(name: string): void;
  add(a: number, b: number): number;
};

const actions = new ActionExecuter<AppActions>();

// Wire up a whole class at once
class MyService {
  greet(name: string) {
    console.log(`Hello, ${name}`);
  }
  add(a: number, b: number) {
    return a + b;
  }
}
actions.setHandler(new MyService());

// Or register individual handlers (takes priority over the class)
actions.setHandler('add', (a, b) => a + b + 1);

// Invoke via a typed client — no write access
const client = actions.createClient();
client.greet('Alice');
console.log(client.add(1, 2)); // 4
```

---

## License

MIT
