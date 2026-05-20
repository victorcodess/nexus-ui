# Changesets

This repo uses Changesets to automate versioning and changelog generation for
`packages/nexus-ui-cli`.

## Workflow

1. Add a changeset in PRs that change `nexus-ui-cli`:
   - `npm run changeset`
2. Merge to `main`.
3. The release workflow opens/updates a "Version Packages" PR with changelog and
   version bumps.
4. Merging that PR triggers npm publish for `nexus-ui-cli` and creates release
   notes.
