# Caravan

A collection of typed, reactive libraries for building event-driven applications — usable independently or composed together.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@baby-yak/events-events`](./packages/events-events) | Fully typed event emitter with wildcard, once, and async/await support | [![npm](https://img.shields.io/npm/v/@baby-yak/events-events)](https://www.npmjs.com/package/@baby-yak/events-events) |
| [`@baby-yak/events-events-react`](./packages/events-events-react) | React hooks for `events-events` | [![npm](https://img.shields.io/npm/v/@baby-yak/events-events-react)](https://www.npmjs.com/package/@baby-yak/events-events-react) |
| [`@baby-yak/state-state`](./packages/state-state) | Typed reactive state with immer and selector support | [![npm](https://img.shields.io/npm/v/@baby-yak/state-state)](https://www.npmjs.com/package/@baby-yak/state-state) |
| [`@baby-yak/state-state-react`](./packages/state-state-react) | React hooks for `state-state` | [![npm](https://img.shields.io/npm/v/@baby-yak/state-state-react)](https://www.npmjs.com/package/@baby-yak/state-state-react) |
| [`@baby-yak/services-services`](./packages/services-services) | Typed service client factory for local and distributed architectures | [![npm](https://img.shields.io/npm/v/@baby-yak/services-services)](https://www.npmjs.com/package/@baby-yak/services-services) |
| [`@baby-yak/services-services-react`](./packages/services-services-react) | React hooks for `services-services` | [![npm](https://img.shields.io/npm/v/@baby-yak/services-services-react)](https://www.npmjs.com/package/@baby-yak/services-services-react) |

## Development

**Requirements:** Node >= 18. Use npm, yarn, or pnpm.

```bash
npm install   # or yarn / pnpm
```

> If switching package managers, delete `node_modules` first — each manager uses a different layout.

### Common commands

```bash
npm run build          # build all packages
npm test               # build then run all tests
npm run test:watch     # watch mode across all packages
npm run typecheck      # type-check all packages
npm run lint           # lint all packages
npm run dev            # watch mode for all packages in parallel
```

### Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

1. After making changes, run:
   ```bash
   npm run changeset
   ```
   Pick which packages changed and the bump type (patch/minor/major). Commit the generated `.changeset/*.md` file with your code.

2. When ready to publish:
   ```bash
   npm run version-packages   # bumps versions, updates CHANGELOGs, deletes .changeset files
   ```
   Commit and push to `main`.

3. Publish either way:
   - **Via GitHub:** Create a GitHub Release — the publish workflow runs automatically.
   - **Manually in CI:** Actions → Publish → Run workflow.
   - **Locally:** `npm run publish-packages` (requires `NODE_AUTH_TOKEN=<npm-token>` in env).

**First publish of each package** must be done manually (npm requires it):
```bash
cd packages/events-events
npm publish --access public
```
Repeat for all 6 packages. After that, CI handles it.

**Prerequisites:** `NPM_TOKEN` secret added in GitHub repo Settings → Secrets → Actions.
