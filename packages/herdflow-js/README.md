# @baby-yak/herdflow-js

> [!IMPORTANT]
> **Beta** - API is stable but the package is still early. Feedback welcome.

A typed TypeScript toolkit for building event-driven, reactive applications — events, state, and services in one package.

## Install

```bash
npm install @baby-yak/herdflow-js
```

## What's inside

| Module | Description | Docs |
|--------|-------------|------|
| Services | Typed base class for building self-contained services | [→ docs/services.md](./docs/services.md) |
| Modules | Lifecycle orchestrator for a set of services | [→ docs/modules.md](./docs/modules.md) |
| Events | Typed event emitter with wildcard, once, and async/await support | [→ docs/events.md](./docs/events.md) |
| State | Reactive state with immer and selector support | [→ docs/state.md](./docs/state.md) |
| Actions | Action dispatcher | [→ docs/actions.md](./docs/actions.md) |

## Quick start

### Services

Define a descriptor type, extend `Service`, and implement your actions as class methods.

```ts
import { Service } from '@baby-yak/herdflow-js';

type IServer = {
  state: { address: string };
  events: { connected: () => void };
  actions: { connect(port: number): void };
};

class ServerService extends Service<IServer> {
  constructor() {
    super('server', { address: '' });
    this.actions.setHandler(this); // wire up all action methods at once
  }

  connect(port: number) {
    this.state.update(s => { s.address = `host:${port}`; });
    this.events.emit('connected');
  }
}
```

[→ Full services docs](./docs/services.md)

### Modules

Collect services into a module. Call `start()` to run the lifecycle and access typed clients via `module.services`.

```ts
import { Module } from '@baby-yak/herdflow-js';

type App = {
  server: Service<IServer>;
  db: Service<IDb>;
};

const app = new Module<App>({
  server: new ServerService(),
  db: new DbService(),
});

await app.start();

app.services.server.actions.connect(8080);
app.services.server.events.on('connected', () => console.log('connected!'));
app.services.server.state.subscribe(s => console.log(s.address));
```

[→ Full modules docs](./docs/modules.md)

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

### State

```ts
import { ReactiveState } from '@baby-yak/herdflow-js';

const state = new ReactiveState({ count: 0, name: 'Alice' });

state.subscribe((next) => console.log(next.count));

state.update({ count: 1 });                     // shallow merge
state.update((draft) => { draft.count += 1; }); // immer recipe
```

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
  greet(name: string) { console.log(`Hello, ${name}`); }
  add(a: number, b: number) { return a + b; }
}
actions.setHandler(new MyService());

// Or register individual handlers (takes priority over the class)
actions.setHandler('add', (a, b) => a + b + 1);

// Invoke via a typed client — no write access
const client = actions.getClient();
client.greet('Alice');
console.log(client.add(1, 2)); // 4
```

## License

MIT
