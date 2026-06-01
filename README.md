<img width="2400" height="1260" alt="image" src="https://github.com/user-attachments/assets/cfd3da91-d6d6-4f12-bdc5-53a19c7ce0ee" />

<h1 align="center">Nexus UI</h1>
<p align="center">
  Beautiful, customizable components for modern AI experiences.
</p>

## Overview

Nexus UI is an open-source component library for building AI-powered interfaces. It provides a set of composable primitives that integrate seamlessly with the [Vercel AI SDK](https://sdk.vercel.ai), [ElevenLabs](https://elevenlabs.io), and other AI services.

Think of it as **shadcn/ui, but purpose-built for AI apps**.

Instead of adapting general-purpose components for AI use cases, Nexus UI is designed from the ground up for streaming, voice, multimodal, and agentic interfaces.

Copy-paste components into your project. You own the code.

## Components

| Component       | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| `PromptInput` | Composable chat input with auto-resizing textarea and action slots |
| `ModelSelector` | Dropdown for selecting AI models with radio groups, sub-menus, and custom items |
| `Suggestions` | Prompt suggestion chips for guiding user input |
| `Attachments` | Composable file attachments for chat inputs and messages with preview, variants, and upload wiring |
| `Message` | Chat message layout with markdown, optional avatar, actions, and attachments |
| `Thread` | Scrollable chat thread with stick-to-bottom scrolling and jump-to-bottom control |
| `Citation` | Inline source references with hover preview and multi-source carousel |
| `Reasoning` | Collapsible model reasoning trace with streaming-aware labels and markdown body |
| `TextShimmer` | Animated shimmer text for loading, tool runs, and other in-progress UI |
| `Image` | Image renderer for URLs, base64, and byte payloads with preview, loader, lightbox, and action slots |
| `FeedbackBar` | Feedback prompt bar for per-message or thread ratings with action and close slots |
| `Toaster` | Headless toast notifications powered by Sonner, with variant-aware styling and custom action/cancel controls |
| `ChainOfThought` | Structured multi-step thought timeline with step status, optional expandable output, and auto-close when steps finish |
| `Tool` | Status-aware tool call UI with JSON input/output codeblocks |

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
```

**Option 2: Direct URL**

```bash
npx shadcn@latest add https://nexus-ui.dev/r/prompt-input.json
```

**Option 3: Nexus UI CLI**

```bash
npx nexus-ui-cli@latest
# or add specific components
npx nexus-ui-cli@latest add prompt-input
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
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from '@/components/nexus-ui/prompt-input'

export function ChatInput() {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button>
              <Paperclip />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button>
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  )
}
```

## Development

```bash
npm install
npm run dev
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the contribution guidelines.

## License

MIT
