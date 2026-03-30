"use client";

import * as React from "react";
import {
  AiMagicIcon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  BookOpenTextIcon,
  Cancel01Icon,
  MapsIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Attachment,
  AttachmentList,
  Attachments,
  AttachmentTrigger,
  type AttachmentMeta,
} from "@/components/nexus-ui/attachments";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import PromptInput, {
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  Suggestions,
  SuggestionList,
  Suggestion,
  SuggestionPanel,
  SuggestionPanelHeader,
  SuggestionPanelTitle,
  SuggestionPanelClose,
  SuggestionPanelContent,
} from "@/components/nexus-ui/suggestions";
import { Button } from "@/components/ui/button";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";
import { cn } from "@/lib/utils";

function attachmentKey(a: AttachmentMeta) {
  return `${a.name ?? ""}-${a.size ?? ""}-${a.mimeType ?? ""}-${a.url ?? ""}`;
}

const models = [
  {
    value: "gpt-4",
    icon: ChatgptIcon,
    title: "GPT-4",
    description: "Most capable, best for complex tasks",
  },
  {
    value: "gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast and affordable",
  },
  {
    value: "claude-3.5",
    icon: ClaudeIcon2,
    title: "Claude 3.5",
    description: "Strong reasoning and analysis",
  },
  {
    value: "gemini-1.5-flash",
    icon: GeminiIcon,
    title: "Gemini 1.5 Flash",
    description: "Fast and versatile",
  },
];

function PlanIcon({ className }: { className?: string }) {
  return (
    <HugeiconsIcon icon={MapsIcon} strokeWidth={2.0} className={className} />
  );
}

function ResearchIcon({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={BookOpenTextIcon}
      strokeWidth={2.0}
      className={className}
    />
  );
}

function WriteIcon({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={PencilEdit01Icon}
      strokeWidth={2.0}
      className={className}
    />
  );
}

function BrainstormIcon({ className }: { className?: string }) {
  return (
    <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2.0} className={className} />
  );
}

const categories = [
  {
    label: "Plan",
    icon: PlanIcon,
    highlight: "Make a",
    suggestions: [
      "Make a plan to save on the downpayment of a house",
      "Make a dinner cooking plan for this week on a family of 4",
      "Make a HIIT workout plan",
      "Make a plan to eat healthier",
    ],
  },
  {
    label: "Research",
    icon: ResearchIcon,
    highlight: "Research",
    suggestions: [
      "Research the best programming languages to learn in 2025",
      "Research how to start a small business",
      "Research the pros and cons of remote work",
      "Research sustainable energy solutions",
    ],
  },
  {
    label: "Write",
    icon: WriteIcon,
    highlight: "Write a",
    suggestions: [
      "Write a cover letter for a software engineer role",
      "Write a short story about time travel",
      "Write a professional email to follow up after an interview",
      "Write a blog post about productivity tips",
    ],
  },
  {
    label: "Brainstorm",
    icon: BrainstormIcon,
    highlight: "Brainstorm",
    suggestions: [
      "Brainstorm side project ideas for a developer portfolio",
      "Brainstorm creative date night ideas",
      "Brainstorm ways to improve team productivity",
      "Brainstorm names for a new startup",
    ],
  },
];

type InputStatus = "idle" | "loading" | "error" | "submitted";

function AttachmentsDemo() {
  const [model, setModel] = React.useState("gpt-4");
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachmentMeta[]>([]);
  const [status, setStatus] = React.useState<InputStatus>("idle");
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const active = categories.find((c) => c.label === activeCategory);

  /** Per-attachment demo progress; only keys for newly added files are set. */
  const [progressByKey, setProgressByKey] = React.useState<
    Record<string, number>
  >({});

  const syncAttachments = React.useCallback((next: AttachmentMeta[]) => {
    setAttachments((prev) => {
      for (const a of prev) {
        const u = a.url;
        if (u?.startsWith("blob:") && !next.some((n) => n.url === u)) {
          URL.revokeObjectURL(u);
        }
      }
      return next;
    });
  }, []);

  const attachmentsRef = React.useRef(attachments);
  attachmentsRef.current = attachments;

  const intervalsRef = React.useRef<Map<string, number>>(new Map());
  const timeoutsRef = React.useRef<Map<string, number>>(new Map());
  const prevAttachmentKeysRef = React.useRef<Set<string>>(new Set());

  const handleCategoryClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, category: string) => {
      triggerRef.current = e.currentTarget;
      setActiveCategory(activeCategory === category ? null : category);
      setSuggestionsOpen(activeCategory === category ? false : true);
    },
    [activeCategory],
  );

  const handleSuggestionsOpenChange = React.useCallback((next: boolean) => {
    setSuggestionsOpen(next);
  }, []);

  const handleSuggestionPanelClose = React.useCallback(() => {
    triggerRef.current?.focus();
    setActiveCategory(null);
  }, []);

  React.useEffect(() => {
    const current = new Set(attachments.map(attachmentKey));

    const clearKeyTimers = (key: string) => {
      const intId = intervalsRef.current.get(key);
      if (intId != null) {
        clearInterval(intId);
        intervalsRef.current.delete(key);
      }
      const toId = timeoutsRef.current.get(key);
      if (toId != null) {
        clearTimeout(toId);
        timeoutsRef.current.delete(key);
      }
    };

    for (const key of [
      ...intervalsRef.current.keys(),
      ...timeoutsRef.current.keys(),
    ]) {
      if (!current.has(key)) clearKeyTimers(key);
    }

    setProgressByKey((p) => {
      const next = { ...p };
      let changed = false;
      for (const k of Object.keys(next)) {
        if (!current.has(k)) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : p;
    });

    const newKeys = [...current].filter(
      (k) => !prevAttachmentKeysRef.current.has(k),
    );

    for (const key of newKeys) {
      clearKeyTimers(key);

      setProgressByKey((p) => ({ ...p, [key]: 0 }));

      const t0 = Date.now();
      const duration = 2000;
      const intId = window.setInterval(() => {
        if (!attachmentsRef.current.some((a) => attachmentKey(a) === key)) {
          clearKeyTimers(key);
          return;
        }
        const pct = Math.min(
          100,
          Math.round(((Date.now() - t0) / duration) * 100),
        );
        setProgressByKey((prev) => ({ ...prev, [key]: pct }));

        if (pct >= 100) {
          clearInterval(intId);
          intervalsRef.current.delete(key);
          setProgressByKey((prev) => ({ ...prev, [key]: 100 }));

          const toId = window.setTimeout(() => {
            timeoutsRef.current.delete(key);
            setProgressByKey((prev) => {
              if (!(key in prev)) return prev;
              const { [key]: _, ...rest } = prev;
              return rest;
            });
          }, 300);
          timeoutsRef.current.set(key, toId);
        }
      }, 50);
      intervalsRef.current.set(key, intId);
    }

    prevAttachmentKeysRef.current = current;
  }, [attachments]);

  React.useEffect(
    () => () => {
      for (const id of intervalsRef.current.values()) {
        clearInterval(id);
      }
      for (const id of timeoutsRef.current.values()) {
        clearTimeout(id);
      }
      intervalsRef.current.clear();
      timeoutsRef.current.clear();
    },
    [],
  );

  React.useEffect(
    () => () => {
      for (const a of attachmentsRef.current) {
        if (a.url?.startsWith("blob:")) URL.revokeObjectURL(a.url);
      }
    },
    [],
  );

  const removeAttachment = React.useCallback(
    (item: AttachmentMeta) => {
      syncAttachments(
        attachmentsRef.current.filter(
          (a) => attachmentKey(a) !== attachmentKey(item),
        ),
      );
    },
    [syncAttachments],
  );

  const handleSubmit = React.useCallback(
    (value: string) => {
      if (status === "loading") return;
      const trimmed = value.trim();
      if (!trimmed && attachmentsRef.current.length === 0) return;
      setMessage("");
      syncAttachments([]);
      setStatus("loading");
      window.setTimeout(() => {
        setStatus("submitted");
        window.setTimeout(() => setStatus("idle"), 800);
      }, 2500);
    },
    [syncAttachments, status],
  );

  const isLoading = status === "loading";
  const canSend = message.trim().length > 0 || attachments.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Attachments outer: easy to wrap a full chat column for page-level drag-and-drop */}
      <Attachments
        attachments={attachments}
        onAttachmentsChange={syncAttachments}
        accept="*/*"
        multiple
      >
        <PromptInput onSubmit={handleSubmit} className="z-2 shadow-sm">
          {attachments.length > 0 ? (
            <AttachmentList className="min-h-0 flex-nowrap justify-start overflow-x-auto overflow-y-hidden px-4 pt-4 [scrollbar-color:var(--scrollbar-thumb)_transparent] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent">
              {attachments.map((item) => {
                const key = attachmentKey(item);
                const progress = progressByKey[key];
                return (
                  <Attachment
                    key={key}
                    variant="detailed"
                    attachment={item}
                    progress={progress}
                    onRemove={() => removeAttachment(item)}
                  />
                );
              })}
            </AttachmentList>
          ) : null}
          <PromptInputTextarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message with attachments…"
            disabled={isLoading}
          />
          <PromptInputActions>
            <PromptInputActionGroup>
              <PromptInputAction>
                <AttachmentTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2.0}
                      className="size-4"
                    />
                  </Button>
                </AttachmentTrigger>
              </PromptInputAction>
              <PromptInputAction asChild>
                <ModelSelector
                  value={model}
                  onValueChange={setModel}
                  items={models}
                >
                  <ModelSelectorTrigger variant="ghost" />
                  <ModelSelectorContent className="w-[264px]" align="start">
                    <ModelSelectorGroup>
                      <ModelSelectorLabel>Select model</ModelSelectorLabel>
                      <ModelSelectorRadioGroup
                        value={model}
                        onValueChange={setModel}
                      >
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
              </PromptInputAction>
            </PromptInputActionGroup>
            <PromptInputActionGroup>
              <PromptInputAction asChild>
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-gray-700 text-white transition-transform hover:bg-gray-800 active:scale-97 disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  disabled={isLoading || !canSend}
                  onClick={() => handleSubmit(message)}
                >
                  {isLoading ? (
                    <HugeiconsIcon
                      icon={SquareIcon}
                      strokeWidth={2.0}
                      className="size-3.5 fill-current"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={ArrowUp02Icon}
                      strokeWidth={2.0}
                      className="size-4"
                    />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActionGroup>
          </PromptInputActions>
        </PromptInput>
      </Attachments>

      <div className="relative">
        <Suggestions>
          <SuggestionList className="justify-center">
            {categories.map((category) => (
              <Suggestion
                key={category.label}
                variant="filled"
                onClick={(e) => handleCategoryClick(e, category.label)}
                className={cn(suggestionsOpen && "opacity-0")}
              >
                <category.icon className="size-3.5" />
                {category.label}
              </Suggestion>
            ))}
          </SuggestionList>
        </Suggestions>

        <SuggestionPanel
          open={suggestionsOpen}
          onOpenChange={handleSuggestionsOpenChange}
          onClose={handleSuggestionPanelClose}
        >
          {active && (
            <>
              <SuggestionPanelHeader className="h-6">
                <SuggestionPanelTitle>
                  <active.icon className="size-3.5 text-gray-400" />
                  <span className="text-[13px] font-normal text-gray-400">
                    {active.label}
                  </span>
                </SuggestionPanelTitle>
                <SuggestionPanelClose className="-mr-0.75 size-5">
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </SuggestionPanelClose>
              </SuggestionPanelHeader>
              <SuggestionPanelContent>
                <Suggestions
                  onSelect={(value) => {
                    setMessage(value);
                    setSuggestionsOpen(false);
                  }}
                >
                  <SuggestionList orientation="vertical" className="gap-2">
                    {active.suggestions.map((text) => (
                      <Suggestion
                        key={text}
                        variant="ghost"
                        highlight={active.highlight}
                        value={text}
                        className="group h-auto w-full justify-between rounded-[6px] px-3 text-left whitespace-normal text-gray-900 hover:bg-gray-200/72"
                      >
                        {text}
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2.0}
                          className="size-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500"
                        />
                      </Suggestion>
                    ))}
                  </SuggestionList>
                </Suggestions>
              </SuggestionPanelContent>
            </>
          )}
        </SuggestionPanel>
      </div>
    </div>
  );
}

export default AttachmentsDemo;
