# nexus-ui

CLI for installing [Nexus UI](https://nexus-ui.dev) components via the shadcn registry.

## Installation

Use directly with npx (no install required):

```bash
npx nexus-ui-cli@latest
```

## Usage

### Install all components

```bash
npx nexus-ui-cli@latest
# or
npx nexus-ui-cli@latest add all
```

### Install specific components

```bash
npx nexus-ui-cli@latest add prompt-input
npx nexus-ui-cli@latest add prompt-input suggestions model-selector
```

### Alternative: Use shadcn CLI directly

```bash
# Install all components
npx shadcn@latest add https://nexus-ui.dev/api/registry/prompt-input.json https://nexus-ui.dev/api/registry/suggestions.json https://nexus-ui.dev/api/registry/model-selector.json

# Install a specific component
npx shadcn@latest add https://nexus-ui.dev/api/registry/prompt-input.json
```

## Prerequisites

- Node.js 18+
- Next.js project with [shadcn/ui](https://ui.shadcn.com) initialized (`npx shadcn@latest init`)
- Tailwind CSS configured
