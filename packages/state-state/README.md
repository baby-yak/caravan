# state-state

> [!IMPORTANT]
> **Beta** - API is stable but the package is still early. Feedback welcome.

A small, typed reactive state library for TypeScript.

Uses [immer](https://immerjs.github.io/immer/) under the hood for simple, boilerplate-free state updates.\
[(for immer-free option - see bellow)](#immer-free-usage-reactivestatepure)

## Install

```bash
npm install @baby-yak/state-state
```

## Quick start

```ts
import { ReactiveState } from '@baby-yak/state-state';

const state = new ReactiveState({ count: 0, name: 'Alice' });

// Read current state (deeply readonly)
console.log(state.get().count); // 0

// Subscribe — fires immediately, then on every change
const unsub = state.subscribe((next, prev) => {
  console.log(prev?.count, '→', next.count);
});

// Replace a field (shallow merge)
state.update({ count: 1 });

// Deep mutation via immer recipe
state.update((draft) => {
  draft.count += 1;
});

// Full replacement
state.set({ count: 0, name: 'Bob' });

// Stop listening
unsub();
```

## Selectors

Derive a child `StateSource` that only emits when its selected value changes:

```ts
const count = state.select((s) => s.count);

count.subscribe((next, prev) => {
  console.log('count changed:', prev, '→', next);
});

// Chained selectors are flattened — no extra overhead
const upper = state.select((s) => s.name).select((name) => name.toUpperCase());
```

> **Caveat:** Selectors are compared with `Object.is`. If your selector returns a new object on every call (e.g. `s => ({ ...s.nested })`), it will emit on every state update even if the data hasn't changed. Keep selectors stable — select a reference, not a reconstructed value.

## Read-only facade

Hand consumers a view that cannot mutate state:

```ts
const source = state.createStateSource(); // StateSource<S> — no set/update
```

## Error handling

Control what happens when a listener throws:

```ts
const state = new ReactiveState(0, {
  listenersErrorHandling: 'warn', // default — console.warn
  // 'ignore' | 'log' | 'warn' | 'error' | 'throw' | (err) => void
});
```

## `set` vs `update`

**`set`** always does a full replacement — use it for primitives or when replacing the entire state:

```ts
const counter = new ReactiveState(0);
counter.set(1);

const user = new ReactiveState({ name: 'Alice', score: 0 });
user.set({ name: 'Alice', score: 1 }); // replaces everything
```

**`update`** is smarter about what gets replaced:

```ts
const state = new ReactiveState({ name: 'Alice', address: { city: 'NY', zip: '10001' } });

// Partial — shallow merge, unmentioned fields are preserved
state.update({ name: 'Bob' });
// → { name: 'Bob', address: { city: 'NY', zip: '10001' } }

// Immer recipe — deep mutation, use for nested changes
state.update((draft) => {
  draft.address.city = 'LA'; // zip is preserved
});
// → { name: 'Bob', address: { city: 'LA', zip: '10001' } }

// ⚠️  Partial on a nested object replaces it wholesale — use a recipe for deep changes
state.update({ address: { city: 'SF' } });
// → { name: 'Bob', address: { city: 'SF' } }  zip is gone!
```

**Summary:**

| State type        | `set(value)` | `update(partial)` | `update(recipe)`     |
| ----------------- | ------------ | ----------------- | -------------------- |
| Plain object      | Full replace | Shallow merge     | Deep mutation        |
| Array / Map / Set | Full replace | Full replace      | Deep mutation        |
| Primitive         | Full replace | Full replace      | Throws — use `set()` |

## Immer-free usage (`ReactiveStatePure`)

By default this library uses [immer](https://immerjs.github.io/immer/) to power the `update(draft => { ... })` recipe API. Immer lets you write mutations on a draft and produces a new immutable state behind the scenes — no spread boilerplate needed.

If you'd rather not take the immer dependency, or prefer explicit reducer-style updates, use `ReactiveStatePure` instead. The API is identical except `update` takes a pure function that receives the current state and must return the next state:

```ts
import { ReactiveStatePure } from '@baby-yak/state-state';

const state = new ReactiveStatePure({ count: 0, name: 'Alice' });

// Pure reducer — receive current state, return next state
state.update((s) => ({ ...s, count: s.count + 1 }));

// Partial shorthand still works (shallow merge, same as ReactiveState)
state.update({ name: 'Bob' });
```

Everything else — `set`, `subscribe`, `select`, `createStateSource`, `getInitialState` — works identically to `ReactiveState`.

> **Note:** `ReactiveStatePure` does not call `enableMapSet()` and has no immer import, so it adds zero immer overhead to your bundle if you tree-shake.

## Notes

- This library calls `enableMapSet()` from [immer](https://immerjs.github.io/immer/) on import, enabling Map/Set support globally. You do not need to call it yourself.
- Listeners are always called immediately on subscribe with `prev = undefined`.
- Equality is checked with `Object.is` — same reference means no notification.

## License

MIT
