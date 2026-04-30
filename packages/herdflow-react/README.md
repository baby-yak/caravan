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

| Hook                | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `useReactiveState`  | Subscribe to service state, re-renders on change         |
| `useEvent`          | Subscribe to a service event for the component lifetime  |
| `useAction`         | Get a typed action function from a service               |

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
useEvent(
  services.server,
  'connected',
  () => console.log(`connected as ${userId}`),
  [userId],
);
```

---

### `useAction`

Returns a typed action function. Equivalent to accessing `services.myService.actions.someAction` directly — a convenience wrapper for uniform hook-style access.

```ts
const connect = useAction(services.server, 'connect');
connect(8080);
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
