# Add nexus-ui to shadcn Public Directory

To add nexus-ui to the [shadcn registry index](https://ui.shadcn.com/r/registries.json), submit a pull request to the [shadcn-ui/ui](https://github.com/shadcn-ui/ui) repository.

## Steps

1. **Fork and clone** the [shadcn-ui/ui](https://github.com/shadcn-ui/ui) repository.

2. **Add** the following entry to `apps/v4/registry/directory.json` (alphabetically by name, e.g. after `@nexus-elements`):

```json
{
  "name": "@nexus-ui",
  "homepage": "https://nexus-ui.dev",
  "url": "https://nexus-ui.dev/r/{name}.json",
  "description": "AI chat UI components: PromptInput, Suggestions, and ModelSelector for building composable chat interfaces.",
  "logo": ""
}
```

3. **Run** `pnpm registry:build` in the shadcn-ui/ui repo root to update `registries.json`.

4. **Create a pull request** to https://github.com/shadcn-ui/ui with your changes.

## Prerequisites (already done)

- [x] Registry is open source and publicly accessible
- [x] Registry conforms to the [registry schema](https://ui.shadcn.com/docs/registry/registry-json)
- [x] Flat registry structure: `/r/registry.json` and `/r/{component-name}.json`
- [x] `files` array does NOT include a `content` property (content is fetched from path URLs)
- [x] Registry files served at `https://nexus-ui.dev/registry/new-york/...`

## Usage after adding

Once merged, users can add nexus-ui components with:

```bash
# Add the registry to components.json
npx shadcn@latest add "https://nexus-ui.dev/r/prompt-input.json"

# Or add components directly
npx shadcn@latest add "https://nexus-ui.dev/r/model-selector.json"
npx shadcn@latest add "https://nexus-ui.dev/r/suggestions.json"
```
