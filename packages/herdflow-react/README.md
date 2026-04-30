# @baby-yak/herdflow-react

> [!IMPORTANT]
> **Beta** - API is stable but the package is still early. Feedback welcome.

React hooks for [@baby-yak/herdflow-js](../herdflow-js/README.md) — connect your services to components with minimal boilerplate.

## Install

```bash
npm install @baby-yak/herdflow-react
```

Requires `react >= 17` and `@baby-yak/herdflow-js` as peer dependencies.

## Hooks

| Hook               | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `useReactiveState` | Subscribe to service state, re-renders on change                |
| `useEvent`         | Subscribe to a service event for the component lifetime         |
| `useAction`        | Get a typed action function from a service                      |
| `useActionAsync`   | Track async action execution — loading, result, and error state |
| `useStateEffect`   | Run a side effect on state change, without re-rendering         |

---

### `useReactiveState`

Re-renders the component whenever the state changes. Accepts a `StateClient` or a `ServiceClient` with state.

```ts
// whole state
const state = useReactiveState(services.counter);
console.log(state.count);

// with selector — only re-renders when the selected value changes
const count = useReactiveState(services.counter, (s) => s.count);
```

Both forms accept an optional `deps` array (same semantics as `useEffect`) to control when the subscription is re-created:

```ts
const value = useReactiveState(services.counter, (s) => s.count, []);
```

---

### `useEvent`

Subscribes to a service event and calls the listener whenever it fires. The subscription is set up on mount and torn down on unmount.

```ts
useEvent(services.server, 'connected', () => {
  console.log('server connected');
});
```

Pass a `deps` array to re-create the subscription when a dependency changes. Include any values the listener closes over:

```ts
useEvent(services.server, 'connected', () => console.log(`connected as ${userId}`), [userId]);
```

---

### `useAction`

Returns a typed action function. Equivalent to accessing `services.myService.actions.someAction` directly — a convenience wrapper for uniform hook-style access.

```ts
const connect = useAction(services.server, 'connect');
// equivalent to:
const connect = services.server.actions.connect;

connect(8080);
```

---

### `useActionAsync`

Tracks the async execution of an action — loading state, result, and error.

```ts
const {
  execute: addItem,
  data,
  isLoading,
  isError,
  error,
} = useActionAsync(services.db, 'addItem');

// invoke:
addItem('new item');
```

Also accepts a raw function directly:

```ts
const {...} = useActionAsync(services.server, 'connect');
const {...} = useActionAsync(services.server.actions.connect);
const {...} = useActionAsync((id: string) => fetch(`/api/users/${id}`).then((r) => r.json()));
```

**Caveats**

- Previous `data` is preserved while executing a new run (loading) and if error is thrown.`data` is only replaced on success.
- if `execute` is called while previous action is still running - the date/result/loading will reflect the new executed call (the previous action will continue, thats up tp the service to handle, but the results of the previous execution will be ignored here on the client side).

**Return shape:**

| Field       | Type          | Description                          |
| ----------- | ------------- | ------------------------------------ |
| `execute`   | function      | Call to trigger the action           |
| `data`      | `T\undefined` | Last successful result               |
| `isLoading` | `boolean`     | `true` while the action is in flight |
| `isError`   | `boolean`     | `true` if the last call threw        |
| `error`     | `unknown`     | The thrown error, if any             |

---

### `useStateEffect`

Runs a side effect whenever state changes — **without causing a re-render**. Useful for analytics, logging, syncing to external systems.

The callback receives `(state, prev)` — `prev` is `undefined` on the first call (mount).

```ts
useStateEffect(services.counter, (state, prev) => {
  analytics.track('count_changed', { from: prev?.count, to: state.count });
});
```

With a selector — only fires when the selected slice changes:

```ts
useStateEffect(
  services.counter,
  (s) => s.count,
  (count, prev) => console.log(`count: ${prev} → ${count}`),
);
```

Pass a `deps` array to control when the subscription is re-created:

```ts
useStateEffect(services.counter, (state) => doSomething(state), []);
```

---

## Working with `ServiceClient`

All hooks accept either a dedicated client (`StateClient`, `EventClient`, `ActionClient`) or a `ServiceClient` directly — no need to destructure:

```ts
// service client directly
useReactiveState(services.counter);
useEvent(services.server, 'connected', handler);
useAction(services.server, 'connect');

// or individual clients
useReactiveState(services.counter.state);
useEvent(services.server.events, 'connected', handler);
useAction(services.server.actions, 'connect');
```

---

## License

MIT
