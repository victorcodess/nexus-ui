# Nexus UI CLI

A command-line interface for installing [Nexus UI](https://nexus-ui.dev) components — a component library built on top of [shadcn/ui](https://ui.shadcn.com/) for building AI-powered chat interfaces.

## Overview

Nexus UI provides composable, copy-paste React components designed for AI applications: prompt inputs, model selectors, suggestion chips, and more. The CLI makes it easy to add these components to your Next.js project.

## Installation

You can use the Nexus UI CLI directly with npx, or install components via the shadcn CLI:

```bash
# Use directly (recommended)
npx nexus-ui-cli@latest

# Or using shadcn CLI
npx shadcn@latest add https://nexus-ui.dev/api/registry/prompt-input.json
```

## Prerequisites

Before using Nexus UI, ensure your project meets these requirements:

- **Node.js** 18 or later
- **Next.js** project
- **shadcn/ui** initialized in your project (`npx shadcn@latest init`)
- **Tailwind CSS** configured (Nexus UI supports CSS Variables mode)

## Usage

### Install All Components

Install all available Nexus UI components at once:

```bash
npx nexus-ui-cli@latest
```

This command will:

- Fetch the component registry from nexus-ui.dev
- Install all Nexus UI components to your configured components directory
- Add necessary dependencies (e.g. textarea, scroll-area) via shadcn

### Install Specific Components

Install individual components using the `add` command:

```bash
npx nexus-ui-cli@latest add <component-name>
```

Examples:

```bash
# Install the prompt input component
npx nexus-ui-cli@latest add prompt-input

# Install the model selector component
npx nexus-ui-cli@latest add model-selector

# Install multiple components
npx nexus-ui-cli@latest add prompt-input suggestions model-selector
```

### Alternative: Use with shadcn CLI

You can also install components using the standard shadcn/ui CLI:

```bash
# Install a specific component
npx shadcn@latest add https://nexus-ui.dev/api/registry/prompt-input.json
npx shadcn@latest add https://nexus-ui.dev/api/registry/suggestions.json
npx shadcn@latest add https://nexus-ui.dev/api/registry/model-selector.json
```

Or add the registry to your `components.json` and use the namespace:

```bash
npx shadcn@latest add @nexus-ui/prompt-input
```

## Available Components

| Component       | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `prompt-input`  | Composable chat input with auto-resizing textarea and action slots |
| `model-selector`| Dropdown for selecting AI models with radio groups and sub-menus   |
| `suggestions`   | Prompt suggestion chips for guiding user input                    |

## Quick Start Example

After installing components, you can use them in your React application:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function ChatInput() {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button size="sm">
              <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
```

## How It Works

The Nexus UI CLI:

1. **Detects your package manager** (npm, pnpm, yarn, or bun) automatically
2. **Fetches component registry** from `https://nexus-ui.dev/api/registry/registry.json`
3. **Installs components** using the shadcn/ui CLI under the hood
4. **Adds dependencies** and integrates with your existing shadcn/ui setup

Components are installed to your configured shadcn/ui components directory (typically `@/components/nexus-ui/`) and become part of your codebase, allowing for full customization.

## Configuration

Nexus UI uses your existing shadcn/ui configuration. Components will be installed to the directory specified in your `components.json` file.

## Links

- [Documentation](https://nexus-ui.dev)
- [Prompt Input](https://nexus-ui.dev/docs/components/prompt-input)
- [Model Selector](https://nexus-ui.dev/docs/components/model-selector)
- [Suggestions](https://nexus-ui.dev/docs/components/suggestions)
