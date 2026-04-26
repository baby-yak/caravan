# How to Publish

## Release flow

1. Make changes to package(s).
2. Run `npm run changeset` — pick which packages changed and the bump type (patch/minor/major).  
   This creates a `.changeset/some-name.md` file. Commit it with your code.
3. When ready to publish, run locally:
   ```bash
   npm run version-packages   # bumps versions, updates CHANGELOGs, deletes .changeset files
   ```
4. Commit and push to `main`.
5. Publish either way:
   - **Via GitHub:** Create a GitHub Release — the `publish.yml` workflow runs automatically.
   - **Manually in CI:** Go to Actions → Publish → Run workflow.
   - **Locally:** `npm run publish-packages` (needs npm token in env: `NODE_AUTH_TOKEN=...`)

## Before any of this works

1. `NPM_TOKEN` secret added in GitHub repo Settings → Secrets → Actions.
2. The `@baby-yak` npm org exists and your token has publish access.
3. Each package published at least once manually (first publish cannot be automated):
   ```bash
   cd packages/events-events
   npm publish --access public
   ```
   Repeat for all 6 packages.
