---
name: nexus-ui
description: Install and compose Nexus UI components for AI-powered chat interfaces — prompt inputs, messages, streaming text, and multimodal layouts. Activates when working with Nexus UI components, the @nexus-ui registry, or building AI/chat UIs in projects that use Nexus UI.
user-invocable: false
---

# Nexus UI

An open-source component library for building AI-powered interfaces. Composable, copy-paste primitives for chat, streaming, and multimodal experiences — built on React, Tailwind CSS v4, and Radix UI.

Components are distributed via the [shadcn registry](https://ui.shadcn.com/docs/registry) and installed as source code into the user's project.

> **IMPORTANT:** Run CLI commands using the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest` — based on the project's `packageManager`.

## Installation

### 1. Add the registry

Add the Nexus UI registry to the project's `components.json`:

```json
{
  "registries": {
    "@nexus-ui": "https://nexus-ui.dev/r/{name}.json"
  }
}
```

### 2. Add components

```bash
npx shadcn@latest add @nexus-ui/prompt-input
```

Or install directly via URL (no registry config needed):

```bash
npx shadcn@latest add https://nexus-ui.dev/r/prompt-input.json
```

Components are installed to `components/nexus-ui/` by default.

### Prerequisites

- React 19+
- Tailwind CSS v4
- TypeScript
- shadcn/ui initialized (`npx shadcn@latest init`)

## Available Components

| Component | Registry name | Description |
|-----------|---------------|-------------|
| Prompt Input | `prompt-input` | Composable chat input with auto-resizing textarea and action slots |

## Component APIs

### Prompt Input

A compound component for building chat input interfaces.

**Import:**
```tsx
import PromptInput, {
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
} from "@/components/nexus-ui/prompt-input";
```

**Sub-components:**

| Component | Purpose |
|-----------|---------|
| `PromptInput` | Root container. Renders a rounded card with border. |
| `PromptInputTextarea` | Auto-resizing textarea with scroll support (max 160px). Wraps `Textarea` inside `ScrollArea`. |
| `PromptInputActions` | Bottom bar for action buttons. Uses `justify-between` to split left/right groups. |
| `PromptInputActionGroup` | Groups related action buttons together with `gap-2`. |
| `PromptInputAction` | Wrapper for individual action buttons. Supports `asChild` prop to render as a `Slot`. |

**Props:**

- All components accept standard `className` for styling overrides.
- `PromptInputAction` accepts `asChild?: boolean` — when `true`, renders as a Radix `Slot` to merge props onto a child `Button`.
- `PromptInputTextarea` accepts all `Textarea` props (`placeholder`, `value`, `onChange`, etc.).

**Basic usage:**
```tsx
<PromptInput>
  <PromptInputTextarea placeholder="Ask anything..." />
  <PromptInputActions>
    <PromptInputActionGroup>
      <PromptInputAction asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Paperclip />
        </Button>
      </PromptInputAction>
    </PromptInputActionGroup>
    <PromptInputActionGroup>
      <PromptInputAction asChild>
        <Button size="icon" className="rounded-full">
          <ArrowUp />
        </Button>
      </PromptInputAction>
    </PromptInputActionGroup>
  </PromptInputActions>
</PromptInput>
```

**With controlled state:**
```tsx
const [value, setValue] = React.useState("");

<PromptInput>
  <PromptInputTextarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(value);
        setValue("");
      }
    }}
  />
  <PromptInputActions>
    <PromptInputActionGroup>
      <PromptInputAction asChild>
        <Button
          size="icon"
          className="rounded-full"
          disabled={!value.trim()}
          onClick={() => {
            handleSubmit(value);
            setValue("");
          }}
        >
          <ArrowUp />
        </Button>
      </PromptInputAction>
    </PromptInputActionGroup>
  </PromptInputActions>
</PromptInput>
```

**With AI SDK (`useChat`):**
```tsx
import { useChat } from "ai/react";

function ChatInput() {
  const { input, handleInputChange, handleSubmit } = useChat();

  return (
    <form onSubmit={handleSubmit}>
      <PromptInput>
        <PromptInputTextarea
          value={input}
          onChange={handleInputChange}
        />
        <PromptInputActions>
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button type="submit" size="icon" className="rounded-full">
                <ArrowUp />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>
    </form>
  );
}
```

## Composition Principles

1. **Compose, don't configure.** Build interfaces by combining small primitives, not by passing config objects to monolithic components.
2. **Use `asChild` for action buttons.** Always wrap `Button` inside `PromptInputAction asChild` — don't use `PromptInputAction` as a button directly.
3. **Group actions with `PromptInputActionGroup`.** Left-side actions (attach, tools) in one group, right-side actions (send) in another. `PromptInputActions` uses `justify-between` to space them.
4. **Components own their code.** After installation, the user owns the source. Modify directly — don't wrap with extra abstraction layers.

## Styling

- Components use Tailwind CSS v4 classes.
- Override styles via `className` prop on any sub-component.
- Components follow shadcn/ui design token conventions (`border`, `bg-transparent`, etc.).
- Dark mode works via the standard `dark:` variant.

## Project Structure

```
components/
├── nexus-ui/
│   └── prompt-input.tsx    ← Nexus UI components
├── ui/
│   ├── button.tsx          ← shadcn/ui primitives
│   ├── textarea.tsx
│   └── scroll-area.tsx
└── ...
```

## Dependencies

Nexus UI components depend on:
- `@radix-ui/react-slot` (or `radix-ui`) — for `asChild` pattern
- `@/components/ui/textarea` — shadcn textarea
- `@/components/ui/scroll-area` — shadcn scroll area
- `@/lib/utils` — `cn()` utility

These are installed automatically when using the shadcn CLI.

## Documentation

- Website: https://nexus-ui.dev
- Docs: https://nexus-ui.dev/docs
- Components: https://nexus-ui.dev/docs/components/prompt-input
- GitHub: https://github.com/victorcodess/nexus-ui
- LLM context: https://nexus-ui.dev/llms.txt
