# Herdflow-js

A collection of typed, reactive libraries for building event-driven applications — usable independently or composed together.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@baby-yak/herdflow-js`](./packages/herdflow-js) | Typed Services ecosystem | [![npm](https://img.shields.io/npm/v/@baby-yak/herdflow-js)](https://www.npmjs.com/package/@baby-yak/herdflow-js) |
| [`@baby-yak/herdflow-react`](./packages/herdflow-react) | React hooks for `herdflow-js` | [![npm](https://img.shields.io/npm/v/@baby-yak/herdflow-react)](https://www.npmjs.com/package/@baby-yak/herdflow-react) |

## Development

**Requirements:** Node >= 18. Use npm, yarn, or pnpm.

```bash
npm install # or yarn / pnpm
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


**Prerequisites:** `NPM_TOKEN` secret added in GitHub repo Settings → Secrets → Actions.
