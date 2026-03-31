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
import { motion } from "motion/react";

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

/** Ease-out curve shared by entrance transitions (CSS cubic-bezier via Motion). */
const enterEase = [0.22, 1, 0.36, 1] as const;

/** Same easing/duration as attachment strip height (open/close + variant). */
const attachmentStripShellTransitionClass =
  "w-full overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Seconds after mount before suggestions run their enter animation (Motion ignores variant `delay` on parents with no animated props). */
const suggestionsStartDelaySec = 0.6;

const suggestionsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const suggestionPillVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: enterEase,
    },
  },
};

type InputStatus = "idle" | "loading" | "error" | "submitted";

const ATTACHMENT_VARIANTS = ["compact", "detailed", "inline"] as const;
type AttachmentDemoVariant = (typeof ATTACHMENT_VARIANTS)[number];

function AttachmentsDemo() {
  const [model, setModel] = React.useState("gpt-4");
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachmentMeta[]>([]);
  const [attachmentVariant, setAttachmentVariant] =
    React.useState<AttachmentDemoVariant>("detailed");
  const [attachmentLayoutTabsVisible, setAttachmentLayoutTabsVisible] =
    React.useState(false);
  /** Drives strip shell height (0 vs measured); `height` CSS animates open/close and variant resizes. */
  const [attachmentStripOpen, setAttachmentStripOpen] = React.useState(false);
  const [attachmentStripContentHeight, setAttachmentStripContentHeight] =
    React.useState(0);
  const attachmentStripMeasureRef = React.useRef<HTMLDivElement>(null);
  /** While collapsing, still render this list until grid transition ends (then clear + revoke blobs). */
  const [stripCollapseSnapshot, setStripCollapseSnapshot] = React.useState<
    AttachmentMeta[] | null
  >(null);
  const lastNonEmptyAttachmentsRef = React.useRef<AttachmentMeta[]>([]);
  const pendingBlobRevokeRef = React.useRef<AttachmentMeta[] | null>(null);

  const [status, setStatus] = React.useState<InputStatus>("idle");
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [suggestionsEnter, setSuggestionsEnter] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const ms = Math.round(suggestionsStartDelaySec * 1000);
    const id = window.setTimeout(() => setSuggestionsEnter(true), ms);
    return () => window.clearTimeout(id);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey) return;
      if (e.key !== "h" && e.key !== "H") return;
      e.preventDefault();
      setAttachmentLayoutTabsVisible((v) => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const active = categories.find((c) => c.label === activeCategory);

  /** Per-attachment demo progress; only keys for newly added files are set. */
  const [progressByKey, setProgressByKey] = React.useState<
    Record<string, number>
  >({});

  const syncAttachments = React.useCallback((next: AttachmentMeta[]) => {
    setAttachments((prev) => {
      const isFullClear = next.length === 0 && prev.length > 0;

      if (isFullClear) {
        pendingBlobRevokeRef.current = prev;
      } else {
        pendingBlobRevokeRef.current = null;
        for (const a of prev) {
          const u = a.url;
          if (u?.startsWith("blob:") && !next.some((n) => n.url === u)) {
            URL.revokeObjectURL(u);
          }
        }
      }

      return next;
    });
  }, []);

  React.useLayoutEffect(() => {
    if (attachments.length > 0) {
      lastNonEmptyAttachmentsRef.current = attachments;
      setStripCollapseSnapshot(null);
      setAttachmentStripOpen(true);
      return;
    }

    if (lastNonEmptyAttachmentsRef.current.length > 0) {
      setStripCollapseSnapshot([...lastNonEmptyAttachmentsRef.current]);
    }
    setAttachmentStripOpen(false);
  }, [attachments]);

  const handleAttachmentStripTransitionEnd = React.useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "height") return;
      if (attachmentStripOpen) return;

      const pending = pendingBlobRevokeRef.current;
      if (pending) {
        for (const a of pending) {
          if (a.url?.startsWith("blob:")) URL.revokeObjectURL(a.url);
        }
        pendingBlobRevokeRef.current = null;
      }
      lastNonEmptyAttachmentsRef.current = [];
      setStripCollapseSnapshot(null);
    },
    [attachmentStripOpen],
  );

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

  const attachmentStripItems =
    attachments.length > 0 ? attachments : (stripCollapseSnapshot ?? []);

  React.useLayoutEffect(() => {
    if (attachmentStripItems.length === 0) {
      setAttachmentStripContentHeight(0);
      return;
    }
    const el = attachmentStripMeasureRef.current;
    if (!el) return;

    const measure = () => {
      const node = attachmentStripMeasureRef.current;
      if (!node) return;
      const h = Math.ceil(
        Math.max(node.scrollHeight, node.getBoundingClientRect().height),
      );
      setAttachmentStripContentHeight((prev) => (prev === h ? prev : h));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [attachmentStripItems.length]);

  return (
    <>
      <motion.div
        role="tablist"
        aria-label="Attachment layout"
        aria-hidden={!attachmentLayoutTabsVisible}
        className={cn(
          "not-prose absolute top-1/4 right-0 left-0 z-50 flex h-9 items-center justify-center gap-2 bg-white px-4 dark:bg-gray-950",
          !attachmentLayoutTabsVisible && "pointer-events-none",
        )}
        initial={false}
        animate={{ opacity: attachmentLayoutTabsVisible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: enterEase }}
        style={{ willChange: "opacity" }}
      >
        {ATTACHMENT_VARIANTS.map((v) => {
          const label =
            v === "compact"
              ? "Compact"
              : v === "detailed"
                ? "Detailed"
                : "Inline";
          const selected = attachmentVariant === v;
          return (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={selected}
              data-state={selected ? "active" : "inactive"}
              tabIndex={attachmentLayoutTabsVisible ? undefined : -1}
              onClick={() => setAttachmentVariant(v)}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-2 rounded-full px-3 text-[13px] font-[450] whitespace-nowrap text-gray-400 transition-colors outline-none select-none dark:text-gray-500",
                "focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-950",
                "hover:text-gray-900 dark:hover:text-gray-50",
                selected &&
                  "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
              )}
            >
              {label}
            </button>
          );
        })}
      </motion.div>

      <div className="mx-auto w-full max-w-xl px-6 pt-11 pb-8">
        <div className="flex min-h-[calc(100vh-2.75rem)] flex-col justify-center gap-6">
          {/* Prompt block: fades in first on load */}
          <motion.div
            className="relative z-2 w-full"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: enterEase, delay: 0.5 }}
            style={{ willChange: "opacity, transform" }}
          >
            {/* Attachments outer: easy to wrap a full chat column for page-level drag-and-drop */}
            <Attachments
              attachments={attachments}
              onAttachmentsChange={syncAttachments}
              accept="*/*"
              multiple
            >
              <PromptInput onSubmit={handleSubmit} className="shadow-sm">
                <div
                  className={attachmentStripShellTransitionClass}
                  style={{
                    height: attachmentStripOpen
                      ? attachmentStripContentHeight
                      : 0,
                  }}
                  onTransitionEnd={handleAttachmentStripTransitionEnd}
                >
                  <div ref={attachmentStripMeasureRef}>
                    {attachmentStripItems.length > 0 ? (
                      <AttachmentList className="min-h-0 flex-nowrap justify-start overflow-x-auto overflow-y-hidden px-4 pt-4 [scrollbar-color:var(--scrollbar-thumb)_transparent] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent">
                        {attachmentStripItems.map((item) => {
                          const key = attachmentKey(item);
                          const progress = progressByKey[key];
                          return (
                            <Attachment
                              key={key}
                              variant={attachmentVariant}
                              attachment={item}
                              progress={progress}
                              onRemove={() => removeAttachment(item)}
                            />
                          );
                        })}
                      </AttachmentList>
                    ) : null}
                  </div>
                </div>
                <PromptInputTextarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can I help you today?"
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
                        <ModelSelectorContent
                          className="w-[264px]"
                          align="start"
                        >
                          <ModelSelectorGroup>
                            <ModelSelectorLabel>
                              Select model
                            </ModelSelectorLabel>
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
          </motion.div>

          {/* Suggestions stay `hidden` until `suggestionsStartDelaySec`, then stagger in */}
          <motion.div
            className="relative"
            variants={suggestionsContainerVariants}
            initial="hidden"
            animate={suggestionsEnter ? "visible" : "hidden"}
            style={{ willChange: "opacity" }}
          >
            <Suggestions>
              <SuggestionList className="animate-none justify-center">
                {categories.map((category) => (
                  <motion.div
                    key={category.label}
                    variants={suggestionPillVariants}
                    className="flex"
                    style={{ willChange: "opacity, transform" }}
                  >
                    <Suggestion
                      variant="filled"
                      onClick={(e) => handleCategoryClick(e, category.label)}
                      className={cn(suggestionsOpen && "opacity-0")}
                    >
                      <category.icon className="size-3.5" />
                      {category.label}
                    </Suggestion>
                  </motion.div>
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
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default AttachmentsDemo;
