<img width="2400" height="1260" alt="image" src="https://github.com/user-attachments/assets/d70ca019-c9fb-4f37-94b3-a9f238a4c7e7" />

<p align="center">
  <h1 align="center">Nexus UI</h1>
</p>

<p align="center">
  Beautiful, customizable components for modern AI experiences.
</p>

<p align="center">
  <a href="https://nexus-ui.dev">Documentation</a> ·
  <a href="https://nexus-ui.dev/docs/components/prompt-input">Prompt Input</a> ·
  <a href="https://nexus-ui.dev/docs/components/model-selector">Model Selector</a> ·
  <a href="https://nexus-ui.dev/docs/components/suggestions">Suggestions</a> ·
  <a href="https://nexus-ui.dev/docs/components/attachments">Attachments</a> ·
  <a href="https://nexus-ui.dev/docs/components/message">Message</a> ·
  <a href="https://nexus-ui.dev/docs/components/thread">Thread</a> ·
  <a href="https://nexus-ui.dev/docs/components/citation">Citation</a> ·
  <a href="https://nexus-ui.dev/docs/components/reasoning">Reasoning</a> ·
  <a href="https://nexus-ui.dev/docs/components/text-shimmer">Text Shimmer</a>
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
| `ModelSelector` | Dropdown for selecting AI models with radio groups, sub-menus, and items    |
| `Suggestions`   | Prompt suggestion chips for guiding user input                               |
| `Attachments`   | File-attachment UI for inputs and messages (compact, inline, detailed, pasted) |
| `Message`       | Chat message layout with markdown body, optional avatar, actions, and attachments |
| `Thread`        | Chat thread viewport with stick-to-bottom scrolling and scroll-to-bottom control |
| `Citation`      | Inline citations with hover preview, favicons, and multi-source carousel    |
| `Reasoning`     | Collapsible reasoning trace with streaming labels and markdown content        |
| `TextShimmer`   | Animated shimmer text for loading and in-progress states                    |

## Quick Start

Make sure you have [shadcn/ui](https://ui.shadcn.com) initialized in your project:

```bash
npx shadcn@latest init
```

Add components using any of these methods:

**Option 1: shadcn CLI (recommended)**

Nexus UI is in the [shadcn registry](https://ui.shadcn.com/registry). No config needed:

```bash
npx shadcn@latest add @nexus-ui/prompt-input
npx shadcn@latest add @nexus-ui/model-selector
npx shadcn@latest add @nexus-ui/suggestions
npx shadcn@latest add @nexus-ui/attachments
npx shadcn@latest add @nexus-ui/message
npx shadcn@latest add @nexus-ui/thread
npx shadcn@latest add @nexus-ui/citation
npx shadcn@latest add @nexus-ui/reasoning
npx shadcn@latest add @nexus-ui/text-shimmer
```

**Option 2: Direct URL**

```bash
npx shadcn@latest add https://nexus-ui.dev/r/prompt-input.json
```

**Option 3: Nexus UI CLI**

```bash
npx nexus-ui-cli@latest
# or add specific components
npx nexus-ui-cli@latest add prompt-input model-selector suggestions attachments message thread citation reasoning text-shimmer
```

To use the `@nexus-ui` scope with a custom registry, add to your `components.json`:

```json
{
  "registries": {
    "@nexus-ui": "https://nexus-ui.dev/r/{name}.json"
  }
}
```

## Usage

```tsx
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const ChatInput = () => {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full bg-gray-700 text-[13px] leading-6 font-normal text-white hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
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
