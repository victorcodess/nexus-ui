<p align="center">
  <h1 align="center">Nexus UI</h1>
</p>

<p align="center">
  Flexible, customizable components for modern AI experiences.
</p>

<p align="center">
  <a href="https://nexus-ui.dev">Documentation</a> ·
  <a href="https://nexus-ui.dev/docs/components/prompt-input">Prompt Input</a> ·
  <a href="https://nexus-ui.dev/docs/components/model-selector">Model Selector</a> ·
  <a href="https://nexus-ui.dev/docs/components/suggestions">Suggestions</a>
</p>

---

## About

Nexus UI is a design-first component library for building AI-powered applications. It provides a set of composable primitives that integrate seamlessly with the [Vercel AI SDK](https://sdk.vercel.ai), [ElevenLabs](https://elevenlabs.io), and other AI services.

Think of it as **shadcn/ui, but purpose-built for AI apps**.

Instead of adapting general-purpose components for AI use cases, Nexus UI is designed from the ground up for streaming, voice, multimodal, and agentic interfaces.

Copy-paste components into your project. You own the code.

## Components

| Component       | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| `PromptInput`   | Composable chat input with auto-resizing textarea and action slots          |
| `ModelSelector` | Dropdown for selecting AI models with radio groups, sub-menus, and items     |
| `Suggestions`   | Prompt suggestion chips for guiding user input                              |

## Quick Start

Make sure you have [shadcn/ui](https://ui.shadcn.com) initialized in your project:

```bash
npx shadcn@latest init
```

Add the Nexus UI registry to your `components.json`:

```json
{
  "registries": {
    "@nexus-ui": "https://nexus-ui.dev/api/registry/{name}.json"
  }
}
```

Then add components using either method:

**Option 1: Nexus UI CLI (recommended)**

```bash
npx nexus-ui@latest
# or add specific components
npx nexus-ui@latest add prompt-input model-selector suggestions
```

**Option 2: shadcn CLI**

```bash
npx shadcn@latest add @nexus-ui/prompt-input
npx shadcn@latest add @nexus-ui/model-selector
npx shadcn@latest add @nexus-ui/suggestions
```

Or install directly via URL without any config:

```bash
npx shadcn@latest add https://nexus-ui.dev/api/registry/prompt-input.json
```

## Usage

```tsx
import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Paperclip } from "lucide-react";

const ChatInput = () => {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <Paperclip />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full bg-gray-700 text-[13px] leading-6 font-normal text-white hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};
```

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI Primitives
- Next.js
- Fumadocs

## Development

```bash
npm install
npm run dev
```

## License

MIT
