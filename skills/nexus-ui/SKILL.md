---
name: nexus-ui
description: Install and compose Nexus UI components for AI chat UIs — prompt input, model selector, suggestions, attachments, and AI SDK patterns. Activates for @nexus-ui registry usage or Nexus UI source under components/nexus-ui.
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
npx shadcn@latest add @nexus-ui/model-selector
npx shadcn@latest add @nexus-ui/suggestions
npx shadcn@latest add @nexus-ui/attachments
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
| Model Selector | `model-selector` | Dropdown for selecting a model with radio groups, sub-menus, and custom items |
| Suggestions | `suggestions` | Prompt suggestion chips and optional panel layout |
| Attachments | `attachments` | File-attachment UI for inputs and messages (variants + drag/drop helpers) |

## Component APIs

Each section uses the same outline: **Import** → **Parts** → **Root props** → **Props & hooks** → **Usage notes** → **Example** (when a short snippet helps).

### Prompt Input

Composable chat shell: auto-growing textarea plus a bottom action row for attach/send and similar controls.

**Import:**

```tsx
import PromptInput, {
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
} from "@/components/nexus-ui/prompt-input";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `PromptInput` | Root layout: bordered card wrapping textarea and actions. |
| `PromptInputTextarea` | Auto-resizing textarea (max height ~160px) inside shadcn `ScrollArea`. |
| `PromptInputActions` | Bottom bar; `justify-between` for left vs right action groups. |
| `PromptInputActionGroup` | Horizontal group of actions (`gap-2`). |
| `PromptInputAction` | Slot for one control; use `asChild` with `Button`. |

**Root props:** None beyond normal DOM attributes / `className` on `PromptInput` (it is only a layout wrapper).

**Props & hooks:** Every part accepts `className`. `PromptInputTextarea` accepts standard textarea props. `PromptInputAction` supports `asChild`. There is no context hook.

**Usage notes:** Put attach/tools in the first `PromptInputActionGroup` and send in the second so `justify-between` separates them. Prefer `PromptInputAction asChild` around `Button` rather than using `PromptInputAction` as the clickable element itself.

**Example:**

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

### Model Selector

Dropdown for picking a model (or similar value), built on Radix `DropdownMenu` with optional `items` metadata for labels, descriptions, and icons.

**Import:**

```tsx
import {
  ModelSelector,
  ModelSelectorPortal,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorItemTitle,
  ModelSelectorItemDescription,
  ModelSelectorItemIcon,
  ModelSelectorItemIndicator,
  ModelSelectorItem,
  ModelSelectorCheckboxItem,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSeparator,
  ModelSelectorSub,
  ModelSelectorSubTrigger,
  ModelSelectorSubContent,
} from "@/components/nexus-ui/model-selector";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `ModelSelector` | Root provider + dropdown root; drives selection context (see **Root props**). |
| `ModelSelectorPortal` | Optional portal wrapper for menu content (use when portaling content). |
| `ModelSelectorTrigger` | Opens the menu; shows the selected label when `items` is set. |
| `ModelSelectorContent` | Menu surface / panel. |
| `ModelSelectorGroup` | Groups rows; often paired with `ModelSelectorLabel`. |
| `ModelSelectorLabel` | Section heading inside a group. |
| `ModelSelectorItem` | Generic menu row. |
| `ModelSelectorItemTitle` | Primary text line for an item. |
| `ModelSelectorItemDescription` | Secondary text line for an item. |
| `ModelSelectorItemIcon` | Leading icon slot for an item. |
| `ModelSelectorItemIndicator` | Selection indicator (e.g. check). |
| `ModelSelectorCheckboxItem` | Checkbox-style menu item. |
| `ModelSelectorRadioGroup` | Single-select group; pass Radix `value` / `onValueChange`. |
| `ModelSelectorRadioItem` | Radio row; supports `title`, `description`, `icon`, `indicator`. |
| `ModelSelectorSeparator` | Visual divider between sections. |
| `ModelSelectorSub` | Nested submenu container. |
| `ModelSelectorSubTrigger` | Row that expands a submenu. |
| `ModelSelectorSubContent` | Popover body for nested items. |

**Root props:** On `ModelSelector`, `value` and `onValueChange` are required. Optional `items`: `{ value, title, description?, icon? }[]` to populate trigger copy and internal metadata. Other Radix menu-root props apply, but `value` / `onValueChange` on the root are reserved for this API.

**Props & hooks:** `ModelSelectorTrigger` adds `variant`: `filled` \| `outline` \| `ghost` (default `filled`). Selection state lives in your React state (`value` / `onValueChange`); there is no extra hook beyond Radix behavior.

**Usage notes:** Prefer `ModelSelectorRadioGroup` + `ModelSelectorRadioItem` for exclusive choices; use `ModelSelectorCheckboxItem` when multiple toggles are needed. Nest advanced trees with `ModelSelectorSub` / `SubTrigger` / `SubContent`. Long menus benefit from `ModelSelectorGroup`, `ModelSelectorLabel`, and `ModelSelectorSeparator`.

**Example:**

```tsx
// models: { value: string; title: string; description?: string; icon?: ComponentType<{ className?: string }> }[]
const [model, setModel] = React.useState(models[0].value);

<ModelSelector value={model} onValueChange={setModel} items={models}>
  <ModelSelectorTrigger />
  <ModelSelectorContent align="start">
    <ModelSelectorGroup>
      <ModelSelectorLabel>Select model</ModelSelectorLabel>
      <ModelSelectorRadioGroup value={model} onValueChange={setModel}>
        {models.map((m) => (
          <ModelSelectorRadioItem
            key={m.value}
            value={m.value}
            icon={m.icon}
            title={m.title}
            description={m.description}
          />
        ))}
      </ModelSelectorRadioGroup>
    </ModelSelectorGroup>
  </ModelSelectorContent>
</ModelSelector>
```

### Suggestions

Chips for quick prompts, with an optional animated panel for grouped suggestions.

**Import:**

```tsx
import Suggestions, {
  SuggestionList,
  Suggestion,
  SuggestionPanel,
  SuggestionPanelHeader,
  SuggestionPanelTitle,
  SuggestionPanelClose,
  SuggestionPanelContent,
} from "@/components/nexus-ui/suggestions";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `Suggestions` | Root; optional `onSelect(value: string)` for chip clicks (via context). |
| `SuggestionList` | Flex list of chips; `orientation` `"horizontal"` \| `"vertical"`. |
| `Suggestion` | Chip `Button`; `variant` `filled` \| `outline` \| `ghost`; optional `value`, `highlight`. |
| `SuggestionPanel` | Animated shell around grouped suggestions. |
| `SuggestionPanelHeader` | Top bar inside the panel. |
| `SuggestionPanelTitle` | Title row in the header. |
| `SuggestionPanelClose` | Close control; supports `asChild`. |
| `SuggestionPanelContent` | Body region; supports `asChild`. |

**Root props:** `Suggestions` — optional `onSelect(value: string)`. `SuggestionPanel` — optional `open` (default `true`), `onOpenChange`, `onClose` (runs after the exit animation).

**Props & hooks:** No selector hook; wire behavior through `onSelect` and `Suggestion`’s `Button` props. `Suggestion` omits outer `variant` in favor of the Nexus `variant` union above.

**Usage notes:** Combine multiple `SuggestionList` blocks or place lists inside `SuggestionPanel` for progressive disclosure. `highlight` dims matching substrings inside chip labels. Use `SuggestionPanelClose` in the header for dismiss affordances.

**Example:**

```tsx
// Often paired with prompt state: onSelect((q) => setInput(q))
<Suggestions onSelect={(q) => setInput(q)}>
  <SuggestionList>
    <Suggestion value="Summarize this thread">Summarize this thread</Suggestion>
    <Suggestion value="Draft a reply">Draft a reply</Suggestion>
  </SuggestionList>
</Suggestions>
```

### Attachments

Controlled file previews for a prompt or message row: hidden file input, optional window-level drag/drop, and per-item remove/progress UI.

**Import:**

```tsx
import Attachments, {
  AttachmentTrigger,
  AttachmentList,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  AttachmentInfo,
  AttachmentProperty,
  AttachmentProgress,
  AttachmentsDropOverlay,
  useAttachments,
  toAttachmentMeta,
  filesFromDataTransfer,
} from "@/components/nexus-ui/attachments";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `Attachments` | Root provider: hidden `<input type="file">`, validation, blob URL lifecycle, optional `window` drop listeners. |
| `AttachmentTrigger` | Opens the picker (pair with `useAttachments().inputId` / labels when building custom triggers). |
| `AttachmentList` | Horizontal scroller / flex row hosting each `Attachment`. |
| `Attachment` | One tile; pass `attachment: AttachmentMeta`; `variant` `compact` \| `inline` \| `detailed` \| `pasted`. |
| `AttachmentPreview` | Thumbnail or type icon region (context: current attachment). |
| `AttachmentInfo` | Text column wrapper for `AttachmentProperty` rows. |
| `AttachmentProperty` | Renders `name`, `size`, or file `kind` via `as="name" \| "size" \| "kind"`. |
| `AttachmentRemove` | Removes the current item (calls `Attachment`’s `onRemove` when provided). |
| `AttachmentProgress` | Thin progress bar; `value` 0–100. |
| `AttachmentsDropOverlay` | Dropshadow overlay during drag; `variant` `fullscreen` \| `contained`. |

**Root props:** On `Attachments`, required `attachments` and `onAttachmentsChange`. Optional: `accept`, `multiple` (default `true`), `maxFiles`, `maxSize` (per file, bytes), `disabled`, `onFileInputChange`, `onFilesRejected`, `windowDrop`.

**Props & hooks:** `useAttachments()` — only under `<Attachments>` — exposes `inputRef`, `inputId`, `openPicker`, `appendFiles`, `isDraggingFile`, current `attachments`, `onAttachmentsChange`, limits, and `disabled`. Exported types: `AttachmentMeta`, `AttachmentsRejectedFiles`, `AppendFilesOptions`. Helpers: `toAttachmentMeta(file, options?)`, `filesFromDataTransfer` for paste/drop.

**Usage notes:** Call `appendFiles` from custom drop/paste handlers to reuse the same limits as the native picker. Enable `windowDrop` plus `AttachmentsDropOverlay` for app-wide file drag hints. Object URLs are revoked when items disappear from the controlled `attachments` array.

**Example:**

```tsx
const [items, setItems] = React.useState<AttachmentMeta[]>([]);

<Attachments attachments={items} onAttachmentsChange={setItems} accept="image/*" maxFiles={5}>
  <AttachmentTrigger />
  <AttachmentList>
    {items.map((meta, index) => (
      <Attachment
        key={meta.url ?? `${meta.name}-${index}`}
        attachment={meta}
        variant="compact"
        onRemove={() => setItems(items.filter((_, i) => i !== index))}
      />
    ))}
  </AttachmentList>
</Attachments>
```

## AI SDK integration

Use the [Vercel AI SDK](https://sdk.vercel.ai) from **`@ai-sdk/react`**. The chat hook uses a **transport** (for example `DefaultChatTransport` pointing at your API route). Wire the textarea with **local state** (or your form library) and call **`sendMessage`** on submit.

```tsx
import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import PromptInput, {
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
} from "@/components/nexus-ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

function ChatInput() {
  const [input, setInput] = React.useState("");
  const { sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "streaming" || status === "submitted";

  async function onSend() {
    const text = input.trim();
    if (!text || busy) return;
    await sendMessage({ text });
    setInput("");
  }

  return (
    <PromptInput>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void onSend();
          }
        }}
        disabled={busy}
      />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              size="icon"
              className="rounded-full"
              disabled={!input.trim() || busy}
              onClick={() => void onSend()}
            >
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
```

Attachments can be passed in the same turn via `sendMessage({ text, files })` when using file inputs compatible with the SDK (see current AI SDK docs for `FileList` / file parts).

## Composition Principles

1. **Compose, don't configure.** Prefer small primitives over monolithic config objects.
2. **`asChild` for prompt actions.** Wrap `Button` in `PromptInputAction asChild` (or `SuggestionPanelClose asChild` where applicable).
3. **Group prompt actions.** Left groups (attach, tools) vs right (send) using `PromptInputActionGroup` inside `PromptInputActions`.
4. **Own the source.** Components are copied into the project; customize them directly.

## Styling

- Tailwind CSS v4 utility classes throughout.
- Override via `className` on any part.
- Dark mode: `dark:` variants align with typical shadcn-style tokens.

## Project Structure

```
components/
├── nexus-ui/
│   ├── prompt-input.tsx
│   ├── model-selector.tsx
│   ├── suggestions.tsx
│   └── attachments.tsx
├── ui/
│   ├── button.tsx
│   ├── textarea.tsx
│   ├── scroll-area.tsx
│   └── ...
└── ...
```

## Dependencies

Registry items pull these in as needed (shadcn CLI installs registry dependencies):

- **Prompt Input:** `@radix-ui/react-slot`, shadcn `textarea`, `scroll-area`, `@/lib/utils`
- **Suggestions:** `@radix-ui/react-presence`, `@radix-ui/react-slot`, `class-variance-authority`, shadcn `button`
- **Model Selector:** `radix-ui` (DropdownMenu), `class-variance-authority`, `@hugeicons/react`, `@hugeicons/core-free-icons`
- **Attachments:** `@radix-ui/react-slot`, `class-variance-authority`, `@hugeicons/react`, `@hugeicons/core-free-icons`

## Documentation

- Website: https://nexus-ui.dev
- Docs: https://nexus-ui.dev/docs
- Components: https://nexus-ui.dev/docs/components/prompt-input · [model-selector](https://nexus-ui.dev/docs/components/model-selector) · [suggestions](https://nexus-ui.dev/docs/components/suggestions) · [attachments](https://nexus-ui.dev/docs/components/attachments)
- GitHub: https://github.com/victorcodess/nexus-ui
- LLM context: https://nexus-ui.dev/llms.txt
