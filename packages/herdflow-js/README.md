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
| Events | Typed event emitter with wildcard, once, and async/await support | [→ docs/events.md](./docs/events.md) |
| State | Reactive state with immer and selector support | [→ docs/state.md](./docs/state.md) |
| Services | Typed service client factory | [→ docs/services.md](./docs/services.md) |
| Actions | Action dispatcher | [→ docs/actions.md](./docs/actions.md) |

## Quick start

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

state.update({ count: 1 });                    // shallow merge
state.update((draft) => { draft.count += 1; }); // immer recipe
```

### Services

```ts
import { createService } from '@baby-yak/herdflow-js';

// see full docs
```

### Actions

```ts
import { createActionDispatcher } from '@baby-yak/herdflow-js';

// see full docs
```

## License

MIT
