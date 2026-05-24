---
name: nexus-ui
description: Install and compose Nexus UI components for AI chat UIs — prompt input, model selector, suggestions, attachments, message, thread, citation, reasoning, text shimmer, image, feedback bar, toaster, chain of thought, and AI SDK patterns. Activates for @nexus-ui registry usage or Nexus UI source under components/nexus-ui.
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
npx shadcn@latest add @nexus-ui/message
npx shadcn@latest add @nexus-ui/thread
npx shadcn@latest add @nexus-ui/citation
npx shadcn@latest add @nexus-ui/reasoning
npx shadcn@latest add @nexus-ui/text-shimmer
npx shadcn@latest add @nexus-ui/image
npx shadcn@latest add @nexus-ui/feedback-bar
npx shadcn@latest add @nexus-ui/toaster
npx shadcn@latest add @nexus-ui/chain-of-thought
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
| Model Selector | `model-selector` | Dropdown for selecting AI models with radio groups, sub-menus, and custom items |
| Suggestions | `suggestions` | Prompt suggestion chips for guiding user input |
| Attachments | `attachments` | Composable file attachments for chat inputs and messages with preview, variants, and upload wiring |
| Message | `message` | Chat message layout with markdown, optional avatar, actions, and attachments |
| Thread | `thread` | Scrollable chat thread with stick-to-bottom scrolling and jump-to-bottom control |
| Citation | `citation` | Inline source references with hover preview and multi-source carousel |
| Reasoning | `reasoning` | Collapsible model reasoning trace with streaming-aware labels and markdown body |
| Text Shimmer | `text-shimmer` | Animated shimmer text for loading, tool runs, and other in-progress UI |
| Image | `image` | Image renderer for URLs, base64, and byte payloads with preview, loader, lightbox, and action slots |
| Feedback Bar | `feedback-bar` | Feedback prompt bar for per-message or thread ratings with action and close slots |
| Toaster | `toaster` | Headless toast notifications powered by Sonner, with variant-aware styling and custom action/cancel controls |
| Chain of Thought | `chain-of-thought` | Structured multi-step thought timeline with step status, optional expandable output, and auto-close when steps finish |

## Component APIs

Each section uses the same outline: **Import** → **Parts** → **Root props** → **Props & hooks** → **Usage notes** → **Example** (when a short snippet helps).

### Prompt Input

Composable chat shell: auto-growing textarea plus a bottom action row for attach/send and similar controls.

**Import:**

```tsx
import {
  PromptInput,
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
| `PromptInputAction` | Slot for one control; supports `asChild` and optional built-in tooltip via `tooltip` (string or object). |

**Root props:** Optional `onSubmit(value: string)` on `PromptInput` for Enter-to-submit from `PromptInputTextarea` (Shift+Enter adds newline), plus normal DOM attributes / `className`.

**Props & hooks:** Every part accepts `className`. `PromptInputTextarea` accepts standard textarea props. `PromptInputAction` supports `asChild` and `tooltip?: string | { content?: string; side?: "top" | "right" | "bottom" | "left"; shortcut?: string }` (no tooltip renders when `content` is missing). There is no context hook.

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

### Message

User vs assistant rows with optional avatar, markdown body (via [Streamdown](https://github.com/vercel/streamdown)), and trailing actions.

**Import:**

```tsx
import {
  Message,
  MessageStack,
  MessageContent,
  MessageMarkdown,
  MessageActions,
  MessageActionGroup,
  MessageAction,
  MessageAvatar,
} from "@/components/nexus-ui/message";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `Message` | Root; required `from`: `"user"` \| `"assistant"` (layout + `role="article"`). |
| `MessageStack` | Vertical stack for multiple blocks inside one message. |
| `MessageContent` | Bubble / content wrapper (user vs assistant styling). |
| `MessageMarkdown` | Renders markdown with Streamdown plugins (code, math, mermaid, CJK). |
| `MessageActions` | Action row container. |
| `MessageActionGroup` | Groups action buttons. |
| `MessageAction` | Single action; supports `asChild` and optional built-in tooltip via `tooltip` (string or object). |
| `MessageAvatar` | Avatar column; `src`, optional `fallback`, `alt`, `size`, `delayMs`. |

**Root props:** On `Message`, required `from`: `"user"` \| `"assistant"`. Standard `HTMLAttributes<HTMLDivElement>` apply to the article wrapper. Default `aria-label` is `"User message"` or `"Assistant message"` unless you pass `aria-label` or `aria-labelledby`.

**Props & hooks:** No exported context hook. Descendants (`MessageStack`, `MessageContent`, `MessageActions`, etc.) read `from` from internal context (fallback `assistant` if used outside `Message`). `MessageMarkdown` accepts [Streamdown](https://github.com/vercel/streamdown) props (`ComponentProps<typeof Streamdown>`): e.g. markdown via `children`, optional `components` merged over built-in `code` / `table` / `inlineCode` defaults, plus `className`. `MessageAction` supports `asChild` (Radix `Slot`) and `tooltip?: string | { content?: string; side?: "top" | "right" | "bottom" | "left"; shortcut?: string }` (no tooltip renders when `content` is missing). `MessageAvatar`: required `src`; optional `alt`, `fallback`, `delayMs`, `size`, `className`.

**Usage notes:** Registry install adds `codeblock.tsx` next to `message.tsx`. Merge Streamdown-related CSS from the registry item when installing manually. Prefer `MessageAction asChild` around `Button` for actions.

**Example:**

```tsx
<Message from="assistant">
  <MessageAvatar src="https://github.com/shadcn.png" fallback="AI" />
  <MessageStack>
    <MessageContent>
      <MessageMarkdown>Here is **markdown** and `inline code`.</MessageMarkdown>
    </MessageContent>
    <MessageActions>
      <MessageActionGroup>
        <MessageAction asChild>
          <Button type="button" variant="ghost" size="sm">
            Copy
          </Button>
        </MessageAction>
      </MessageActionGroup>
    </MessageActions>
  </MessageStack>
</Message>

<Message from="user">
  <MessageContent>
    <MessageMarkdown>Short user reply</MessageMarkdown>
  </MessageContent>
</Message>
```

### Thread

Wraps [`use-stick-to-bottom`](https://github.com/stackblitz/use-stick-to-bottom) for a scrollable message list that stays pinned to new content, with a floating control when the user scrolls up.

**Import:**

```tsx
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `Thread` | Root; forwards `StickToBottom` props (`resize`, `initial`, spring options, etc.). |
| `ThreadContent` | Scrollable column for messages (`flex flex-col gap-*`). |
| `ThreadScrollToBottom` | Button (or `asChild`) shown when not at bottom; calls `scrollToBottom`. |

**Root props:** `Thread` is `StickToBottom` with defaults `resize="smooth"` and `initial="smooth"`. Optional [`StickToBottomOptions`](https://github.com/stackblitz/use-stick-to-bottom): `resize`, `initial`, `mass`, `damping`, `stiffness`, `targetScrollTop`. Also `instance` (pre-created stick-to-bottom instance), `contextRef`, and normal `HTMLAttributes` on the outer div.

**Props & hooks:** Inside `Thread`, use `useStickToBottomContext()` from `use-stick-to-bottom` for `isAtBottom`, `scrollToBottom`, `state`, etc. `ThreadScrollToBottom` uses that context internally and returns `null` when already at the bottom. It accepts `asChild` plus standard button HTML attributes (when not `asChild`, renders a styled `<button>`).

**Usage notes:** Place `ThreadContent` and `ThreadScrollToBottom` as siblings inside `Thread`. Give `Thread` a bounded height (e.g. `h-full` / `min-h-*`) so the scroll region is defined.

**Example:**

```tsx
<Thread className="min-h-[480px]">
  <ThreadContent>
    {messages.map((m) => (
      <Message key={m.id} from={m.role === "user" ? "user" : "assistant"}>
        <MessageContent>
          <MessageMarkdown>{m.text}</MessageMarkdown>
        </MessageContent>
      </Message>
    ))}
  </ThreadContent>
  <ThreadScrollToBottom />
</Thread>
```

### Citation

Composable inline citation chip(s) with Radix `HoverCard` preview. Multiple URLs use a carousel inside the panel (`CitationCarousel*`).

**Import:**

```tsx
import {
  Citation,
  CitationTrigger,
  CitationContent,
  CitationSource,
  CitationSourcesBadge,
  CitationItem,
  CitationFavicon,
  CitationSiteName,
  CitationCarousel,
  CitationCarouselContent,
  CitationCarouselHeader,
  CitationCarouselItem,
  CitationCarouselPrev,
  CitationCarouselNext,
  CitationCarouselPagination,
  CitationCarouselIndex,
} from "@/components/nexus-ui/citation";
```

**Helpers:** `resolveCitationSources`, `resolveCitationSource`, `parseCitationUrl`, `rootDomainSiteName`, types `CitationSourceInput`, `ResolvedCitation`.

**Parts:**

| Part | Purpose |
|------|---------|
| `Citation` | Root `HoverCard`; owns resolved sources + carousel index state. |
| `CitationTrigger` | Chip trigger; single-source renders as link, multi-source as `span` + “+N”. |
| `CitationContent` | Hover panel surface (default `align="center"`, `sideOffset={4}`). |
| `CitationCarousel` | Shadcn `Carousel`; wires `setApi` into citation context. |
| `CitationCarouselContent` / `Item` | Slides; each `CitationCarouselItem` requires `index`. |
| `CitationCarouselPrev` / `Next` / `Index` / `Pagination` / `Header` | Navigation chrome. |
| `CitationItem` | Default preview body (title, description, `CitationSource`) or custom children; anchor to `href`. |
| `CitationSource` | Footer row: favicon + site name. |
| `CitationFavicon` / `CitationSiteName` | Resolve from active carousel item or `CitationItem` scope. |
| `CitationSourcesBadge` | Stacked favicons + “N sources” (or custom `label`); for toolbars, not the hover chip. |

**Root props:** On `Citation`, required `citations: CitationSourceInput[]` (`url`, optional `title`, `description`). All other props omit `children` from `HoverCard` and pass through; optional `children` compose trigger + content. Renders `null` if `citations` is empty. `openDelay` / `closeDelay` are set to `50` on the root card.

**Props & hooks:** No exported hooks; `CitationItem`, `CitationFavicon`, etc. require an ancestor `Citation` and (for items inside the carousel) a matching `CitationCarouselItem` with `index`. `CitationTrigger`: optional `label`, `showFavicon` (default `true`), `showSiteName` (default `true`). `CitationCarouselItem`: required `index: number`. `CitationItem`: optional `showTitle`, `showDescription`, `showSource` (defaults `true`); `href` defaults to resolved URL. `CitationSourcesBadge`: optional `showFavicons`, `label`.

**Usage notes:** Build `citations` from your RAG / search pipeline; use `resolveCitationSources` if you normalize URLs yourself. For two or more URLs, put `CitationCarousel` + one `CitationCarouselItem` per index inside `CitationContent`. `CitationSourcesBadge` is optional chrome for message headers or actions, still under `Citation`.

**Example (single source):**

```tsx
<Citation
  citations={[
    {
      url: "https://vercel.com/blog",
      title: "Vercel Blog",
      description: "Product and platform updates.",
    },
  ]}
>
  <CitationTrigger />
  <CitationContent>
    <CitationItem />
  </CitationContent>
</Citation>
```

**Example (multiple sources + carousel):**

```tsx
const sources = [
  { url: "https://example.com/a", title: "Source A" },
  { url: "https://example.com/b", title: "Source B" },
];

<Citation citations={sources}>
  <CitationTrigger />
  <CitationContent>
    <CitationCarousel>
      <CitationCarouselHeader>
        <CitationSourcesBadge />
        <CitationCarouselPagination>
          <CitationCarouselPrev />
          <CitationCarouselIndex />
          <CitationCarouselNext />
        </CitationCarouselPagination>
      </CitationCarouselHeader>
      <CitationCarouselContent>
        {sources.map((_, index) => (
          <CitationCarouselItem key={index} index={index}>
            <CitationItem />
          </CitationCarouselItem>
        ))}
      </CitationCarouselContent>
    </CitationCarousel>
  </CitationContent>
</Citation>
```

### Reasoning

Collapsible “thinking” block built on shadcn `Collapsible`: the trigger label shifts from streaming copy to a duration summary, and the body renders markdown via [Streamdown](https://github.com/vercel/streamdown).

**Import:**

```tsx
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/nexus-ui/reasoning";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `Reasoning` | Root provider + collapsible root; manages open state vs `isStreaming` and builds the contextual trigger label (`Thinking…` → `Thought for N seconds`). |
| `ReasoningTrigger` | Row with brain icon, label text (streaming uses `tw-shimmer` utilities on the span), and chevron that rotates when open. |
| `ReasoningContent` | Expands markdown in `Streamdown` with muted styling and a leading border strip. Requires `children: string` (markdown source). |

**Root props:** On `Reasoning`, optional `isStreaming` (default `false`) drives auto-open while streaming and auto-close plus duration bookkeeping when streaming ends; optional controlled `open` / `defaultOpen` / `onOpenChange` (inherits from collapsible semantics but `Reasoning` omits Radix `open`/`defaultOpen`/`onOpenChange` from its type in favor of the listed props). Accepts remaining `Collapsible`-compatible props plus `className`.

**Props & hooks:** No exported hook (internal context only). `ReasoningTrigger`/`ReasoningContent` must be descendants of `Reasoning`. Registry install pulls `collapsible`, `streamdown`, Hugeicons packages, `@import "tw-shimmer"`, and keyframes for collapsible height animation.

**Usage notes:** Toggle `isStreaming` from your chat transport / part stream. Omit `ReasoningTrigger` children to use the computed label; pass children only when you override the visible label while keeping accessibility in mind.

**Example:**

```tsx
<Reasoning isStreaming={status === "streaming"}>
  <ReasoningTrigger />
  <ReasoningContent>{reasoningMarkdownString}</ReasoningContent>
</Reasoning>
```

### Text Shimmer

Single primitive that animates a moving highlight across text (`bg-clip-text` + injected `@keyframes`). No extra UI dependencies beyond `@/lib/utils`.

**Import:**

```tsx
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
```

**Parts:** Single component — `TextShimmer`. Optional polymorphic root via `as` (default `"span"`).

**Root props:** `duration` — active sweep duration in seconds (default `2.5`); `repeatDelay` — pause before the next sweep (default `0`); `spread` — highlight width in percentage points around center, clamped ~5–45 (default `20`); `angle` — degrees added to the gradient axis (default `0`); `color` — override beam stop color; `invert` — flip default light/dark beam contrast; plus standard HTML attributes/`className`/`style`. Children are the label text/node tree.

**Props & hooks:** No context. Injects a unique `@keyframes` name per instance via `useId`.

**Usage notes:** Prefer on short status strings (“Running tools…”). Combine with muted `text-muted-foreground` on the wrapper if the edge color should inherit from typography.

**Example:**

```tsx
<TextShimmer repeatDelay={0.5}>Running tool calls</TextShimmer>
```

### Image

Composable image tile for multimodal models: accepts `src`, `base64`, or `uint8Array` (+ `mediaType`), wraps content in a Radix **Dialog** root for lightbox viewing, and exposes loader + absolute action regions.

**Import:**

```tsx
import {
  Image,
  ImagePreview,
  ImageLightbox,
  ImageLightboxOverlay,
  ImageLightboxPreview,
  ImageLightboxClose,
  ImageLoader,
  ImageActions,
  ImageActionGroup,
  ImageAction,
} from "@/components/nexus-ui/image";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `Image` | Root `div` inside `Dialog`; resolves `src` / data URL from `base64` / object URL from `uint8Array`; provides context; default child is `ImagePreview`. |
| `ImagePreview` | Thumbnail; wraps an `<img>` in `Dialog` **Trigger** when `src` resolves; shows `ImageLoader` while empty. |
| `ImageLightbox` | `Dialog.Portal` wrapper. |
| `ImageLightboxOverlay` | Modal backdrop. |
| `ImageLightboxPreview` | `Dialog.Content` with large `<img>` (`object-contain`) and screen-reader title. |
| `ImageLightboxClose` | Visually hidden close control (sr-only). |
| `ImageLoader` | Pulse skeleton; reflects error state via context. |
| `ImageActions` | Absolutely positioned action strip; `align`: `inline-start` \| `inline-end` \| `block-start` \| `block-end`. |
| `ImageActionGroup` / `ImageAction` | Grouped controls; `ImageAction` supports `asChild` + `Slot` and optional built-in tooltip via `tooltip` (string or object). |

**Root props:** On `Image`, pass one of `src`, `base64`, or `uint8Array`; optional `mediaType`, `alt`; plus Radix dialog root props (`open`, `defaultOpen`, `onOpenChange`, `modal`) and normal `div` HTML attributes / `className`.

**Props & hooks:** Internal context only (no exported hook). Nested parts must sit under `Image`.

**Usage notes:** Omit `children` on `Image` to get the default preview. Compose `ImageLightbox*` as siblings of the root card (typical pattern from docs) so clicking the preview opens the modal. Use `ImageActions` + `ImageAction asChild` around `Button` for download or share; add `tooltip` to `ImageAction` for labels, side placement, and optional shortcuts.

**Example (minimal):**

```tsx
<Image base64={modelImageBase64} alt="Generated scene">
  <ImagePreview />
  <ImageLightbox>
    <ImageLightboxOverlay />
    <ImageLightboxPreview />
    <ImageLightboxClose />
  </ImageLightbox>
</Image>
```

### Feedback Bar

Compact bar for “Was this helpful?”-style flows on a message or thread: compose a **prompt** (label) on the left, **actions** (e.g. thumbs) on the right, and an optional **close** column. `FeedbackBarAction` can wrap real buttons via `asChild` and show a **tooltip** with optional **keyboard shortcut** chips (shadcn `Tooltip` + `Kbd`).

**Import:**

```tsx
import {
  FeedbackBar,
  FeedbackBarContent,
  FeedbackBarPrompt,
  FeedbackBarLabel,
  FeedbackBarActions,
  FeedbackBarAction,
  FeedbackBarClose,
} from "@/components/nexus-ui/feedback-bar";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `FeedbackBar` | Root `role="group"` strip; default `h-12`, full width (max ~`28rem`), bordered `rounded-[12px]` surface. |
| `FeedbackBarContent` | `justify-between` flex row filling the bar. |
| `FeedbackBarPrompt` | Left cluster (default `pl-4`) for copy + leading content. |
| `FeedbackBarLabel` | Primary prompt text (`font-[350]`). |
| `FeedbackBarActions` | Right cluster for control groups (`gap-1.5`). |
| `FeedbackBarAction` | Single control shell; `asChild` + `Slot`; optional `tooltip`: `string` or `{ content?, side?, shortcut? }`. |
| `FeedbackBarClose` | Narrow right column with leading border; uses `FeedbackBarAction` + `asChild` around a host `div`; pass close `Button`/`IconButton` as children. |

**Root props:** Plain `HTMLAttributes` on each part; slot parts accept `className`. `FeedbackBarAction` / `FeedbackBarClose`: see tooltips above.

**Props & hooks:** No context. Tooltips render a local `TooltipProvider` per action that has `tooltip.content`.

**Usage notes:** Put icon buttons inside `FeedbackBarAction asChild` for hit targets. Prefer `shortcut` in `tooltip` when mirroring real keyboard affordances.

**Example:**

```tsx
<FeedbackBar>
  <FeedbackBarContent>
    <FeedbackBarPrompt>
      <FeedbackBarLabel>Was this response helpful?</FeedbackBarLabel>
    </FeedbackBarPrompt>
    <FeedbackBarActions>
      <FeedbackBarAction asChild tooltip={{ content: "Helpful", shortcut: "⌘Y" }}>
        <button type="button" aria-label="Helpful">…</button>
      </FeedbackBarAction>
    </FeedbackBarActions>
    <FeedbackBarClose>
      <button type="button" aria-label="Dismiss">…</button>
    </FeedbackBarClose>
  </FeedbackBarContent>
</FeedbackBar>
```

### Toaster

Headless toast notifications powered by Sonner, with variant-aware styling and custom action/cancel controls. Uses **`next-themes`** for light/dark/system. Export **`Toaster`** (mount once in the root layout) and a **`toast`** object with ergonomic helpers plus **`toast.dismiss`**.

**Import:**

```tsx
import { Toaster, toast } from "@/components/nexus-ui/toaster";
```

**Parts / API:**

| Export | Purpose |
|--------|---------|
| `Toaster` | Renders `<Sonner />` with `toastOptions={{ unstyled: true }}` and theme from `useTheme()`; spread extra `ToasterProps`. |
| `toast.custom` | Build fully custom payloads (`title`, optional `description`, `variant`, `icon`, `action`, `cancel`, Sonner timing/options). |
| `toast.default` / `success` / `info` / `warning` / `error` / `loading` | Shorthand `(title, options?)` delegating to `toast.custom`. |
| `toast.dismiss` | Forward to Sonner dismiss API. |

**Root props:** On `Toaster`, standard Sonner props (`position`, `duration`, `expand`, etc.) plus `className` merge behavior from Sonner.

**Props & hooks:** Requires **`ThemeProvider`** from `next-themes` above the layout that renders `Toaster` so `useTheme()` resolves. Toast bodies use shadcn **`Button`** for action/cancel/close.

**Usage notes:** Place `<Toaster />` beside app chrome (e.g. `layout.tsx`). Prefer `toast.success("Copied")` for quick feedback; use `toast.custom` when you need cancel buttons or custom icons (`icon: null` to suppress defaults).

**Example:**

```tsx
// layout.tsx
<Toaster position="bottom-right" />

// anywhere client-side
toast.success("Saved");
toast.error("Something went wrong", { description: "Try again.", duration: 5000 });
```

### Chain of Thought

Structured timeline for tool / reasoning steps: a **root** collapsible tracks all child step statuses, optional **shimmer** on active labels (via `tw-shimmer`), and **`useOnChange`** drives auto-open/close when steps transition.

**Import:**

```tsx
import {
  ChainOfThought,
  ChainOfThoughtTrigger,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepTitle,
  ChainOfThoughtStepContent,
  ChainOfThoughtComplete,
  type ChainOfThoughtStepStatus,
} from "@/components/nexus-ui/chain-of-thought";
```

**Parts:**

| Part | Purpose |
|------|---------|
| `ChainOfThought` | Root **Collapsible** + context registry for steps; props `autoCloseOnAllComplete` (default `true`) closes when every step is `completed`. |
| `ChainOfThoughtTrigger` | Header row with optional icon/label and chevron; label shimmers while work is in flight. |
| `ChainOfThoughtContent` | Body container for **`ChainOfThoughtStep`** list. |
| `ChainOfThoughtStep` | Per-step **Collapsible**; `status` drives registration + shimmer; `hasContent` + `autoCloseOnComplete` auto-manage expansion. |
| `ChainOfThoughtStepTitle` | Row with icon + label; becomes **CollapsibleTrigger** when expandable content exists (or force `collapsible`). |
| `ChainOfThoughtStepContent` | Expandable output region for a step. |
| `ChainOfThoughtComplete` | Optional footer row (“All steps complete”) after steps. |

**Root props:** See source types: controlled `open` / `defaultOpen` / `onOpenChange` on root and steps; `ChainOfThoughtStepStatus` is `"pending"` \| `"active"` \| `"completed"` \| `"error"`.

**Props & hooks:** Internal contexts only. Install includes `lib/use-on-change.ts` when pulled from the registry.

**Usage notes:** Give each step stable visual content for `hasContent` when you want expand/collapse. Pair with streaming/tool events by updating `status` on each step.

**Example (shape):**

```tsx
<ChainOfThought>
  <ChainOfThoughtTrigger>Chain of thought</ChainOfThoughtTrigger>
  <ChainOfThoughtContent>
    <ChainOfThoughtStep status="completed">
      <ChainOfThoughtStepTitle icon={…} label="Search the web" />
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="active" hasContent>
      <ChainOfThoughtStepTitle icon={…} label="Read results" />
      <ChainOfThoughtStepContent>…</ChainOfThoughtStepContent>
    </ChainOfThoughtStep>
  </ChainOfThoughtContent>
</ChainOfThought>
```

## AI SDK integration

Use the [Vercel AI SDK](https://sdk.vercel.ai) from **`@ai-sdk/react`**. The chat hook uses a **transport** (for example `DefaultChatTransport` pointing at your API route). Wire the textarea with **local state** (or your form library) and call **`sendMessage`** on submit.

```tsx
import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  PromptInput,
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
│   ├── attachments.tsx
│   ├── message.tsx
│   ├── codeblock.tsx
│   ├── thread.tsx
│   ├── citation.tsx
│   ├── reasoning.tsx
│   ├── text-shimmer.tsx
│   ├── image.tsx
│   ├── feedback-bar.tsx
│   ├── toaster.tsx
│   └── chain-of-thought.tsx
├── ui/
│   ├── button.tsx
│   ├── textarea.tsx
│   ├── scroll-area.tsx
│   └── ...
└── ...
```

## Dependencies

Registry items pull these in as needed (shadcn CLI installs registry dependencies):

- **Prompt Input:** `@radix-ui/react-slot`, shadcn `textarea`, `scroll-area`, `tooltip`, `kbd`, `@/lib/utils`
- **Suggestions:** `@radix-ui/react-presence`, `@radix-ui/react-slot`, `class-variance-authority`, shadcn `button`
- **Model Selector:** `radix-ui` (DropdownMenu), `class-variance-authority`, `@hugeicons/react`, `@hugeicons/core-free-icons`
- **Attachments:** `@radix-ui/react-slot`, `class-variance-authority`, `@hugeicons/react`, `@hugeicons/core-free-icons`
- **Message:** `streamdown` + `@streamdown/*` plugins, `radix-ui`, `@radix-ui/react-slot`, `@hugeicons/react`, `@hugeicons/core-free-icons`, shadcn `button`, `avatar`, `tooltip`, `kbd`
- **Thread:** `@radix-ui/react-slot`, `use-stick-to-bottom`, `@hugeicons/react`, `@hugeicons/core-free-icons`
- **Citation:** `radix-ui`, `@hugeicons/react`, `@hugeicons/core-free-icons`, shadcn `carousel`, `hover-card`
- **Reasoning:** `streamdown`, `@hugeicons/react`, `@hugeicons/core-free-icons`, `tw-shimmer`, shadcn `collapsible`, registry CSS for shimmer + collapsible height keyframes
- **Text Shimmer:** `@/lib/utils` only (`cn`)
- **Image:** `@radix-ui/react-dialog`, `@radix-ui/react-slot`, shadcn `tooltip`, `kbd`, `@/lib/utils`
- **Feedback Bar:** `@radix-ui/react-slot`, shadcn `tooltip`, `kbd`, `@/lib/utils`
- **Toaster:** `sonner`, `next-themes`, `@hugeicons/react`, `@hugeicons/core-free-icons`, shadcn `button`, `@/lib/utils`
- **Chain of Thought:** `@hugeicons/react`, `@hugeicons/core-free-icons`, shadcn `collapsible`, `tw-shimmer` (registry CSS), `@/lib/use-on-change`, `@/lib/utils`

## Documentation

- Website: https://nexus-ui.dev
- Docs: https://nexus-ui.dev/docs
- Components: [prompt-input](https://nexus-ui.dev/docs/components/prompt-input) · [model-selector](https://nexus-ui.dev/docs/components/model-selector) · [suggestions](https://nexus-ui.dev/docs/components/suggestions) · [attachments](https://nexus-ui.dev/docs/components/attachments) · [message](https://nexus-ui.dev/docs/components/message) · [thread](https://nexus-ui.dev/docs/components/thread) · [citation](https://nexus-ui.dev/docs/components/citation) · [reasoning](https://nexus-ui.dev/docs/components/reasoning) · [text-shimmer](https://nexus-ui.dev/docs/components/text-shimmer) · [image](https://nexus-ui.dev/docs/components/image) · [feedback-bar](https://nexus-ui.dev/docs/components/feedback-bar) · [toaster](https://nexus-ui.dev/docs/components/toaster) · [chain-of-thought](https://nexus-ui.dev/docs/components/chain-of-thought)
- GitHub: https://github.com/victorcodess/nexus-ui
- LLM context: https://nexus-ui.dev/llms.txt
