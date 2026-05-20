# Contributing to Nexus UI

Thanks for your interest in contributing. You're encouraged to contribute through bug fixes, docs updates, and other improvements. We're not currently accepting contributions for new components—if you'd like to suggest one, please [raise an issue](https://github.com/victorcodess/nexus-ui/issues/new).

This document covers development setup and how to submit changes.

## Development Setup

```bash
npm install
npm run dev
```

The docs site runs at [http://localhost:3000](http://localhost:3000).

## Registry Workflow (Source of Truth)

`components/nexus-ui/*` and `registry.json` are the canonical source. `public/r/*` is generated from them.

When you change a Nexus UI component:

1. Edit component source under `components/nexus-ui`.
2. Build generated registry outputs:

   `npm run registry:build`

3. Validate generated outputs:

   `npm run registry:check`

4. Commit source changes and regenerated `public/r/*` files (`components/nexus-ui/*`, `registry.json`, `public/r/*`, docs/scripts as needed).

## Project Structure

```text
components/
  nexus-ui/           # Source components (canonical)
    model-selector.tsx
    prompt-input.tsx
    suggestions.tsx
    examples/         # Live examples used in docs
  ui/                 # shadcn/ui primitives
content/docs/         # Fumadocs MDX pages
  components/         # Component docs
public/r/             # Built registry JSON for shadcn CLI
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <description>
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `perf`, `docs`, `style`, `test`, `ci`, `build`, `revert`

**Guidelines:**

- Keep the message under 72 characters
- Use present tense ("add feature" not "added feature")
- Start the description with a lowercase letter
- Do not end with a period

**Examples:**

```text
feat: add model selector component
fix: resolve dropdown positioning on scroll
docs: update model selector API reference
chore: add model-selector to registry
```

## CLI Release Workflow

`packages/nexus-ui-cli` uses Changesets for automated versioning/changelog and npm publishing.

When your PR changes `packages/nexus-ui-cli/*`, add a changeset:

```bash
npm run changeset
```

The release workflow on `main` will open/update a "Version Packages" PR. Merging that PR publishes `nexus-ui-cli` to npm and creates release notes.

## Submitting Changes

1. Fork the repository
2. Create a branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `npm run build` and `npm run lint` to verify
5. Run `npm run registry:check` if component files changed
6. Commit with a conventional commit message
7. Push and open a pull request

**PR guidelines:** Keep pull requests focused—each PR should address one specific thing. Write a descriptive title and description that clearly explains what changed and why.

## Reporting Issues

[Open an issue](https://github.com/victorcodess/nexus-ui/issues/new) for bugs or feature requests. For component ideas, check the [roadmap](content/docs/roadmap.mdx) first.
