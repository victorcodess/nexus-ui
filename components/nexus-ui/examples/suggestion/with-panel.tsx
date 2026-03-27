"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
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
import { cn } from "@/lib/utils";

function PlanIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={MapsIcon} strokeWidth={2.0} className={className} />;
}

function ResearchIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={BookOpenTextIcon} strokeWidth={2.0} className={className} />;
}

function WriteIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2.0} className={className} />;
}

function BrainstormIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2.0} className={className} />;
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

export default function SuggestionWithPanel() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<InputStatus>("idle");
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const active = categories.find((c) => c.label === activeCategory);

  const handleCategoryClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, category: string) => {
      triggerRef.current = e.currentTarget;
      setActiveCategory(activeCategory === category ? null : category);
      setOpen(activeCategory === category ? false : true);
    },
    [activeCategory],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const handleClose = useCallback(() => {
    triggerRef.current?.focus();
    setActiveCategory(null);
  }, []);

  const doSubmit = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setInput("");
    setStatus("loading");

    setTimeout(() => {
      setStatus("submitted");
      setTimeout(() => setStatus("idle"), 800);
    }, 2500);
  }, []);

  const isLoading = status === "loading";

  return (
    <div className="flex w-full flex-col gap-6">
      <PromptInput onSubmit={doSubmit} className="z-2 shadow-sm">
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <PromptInputActions>
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button
                type="button"
                className="size-8 cursor-pointer rounded-full bg-gray-700 text-white transition-transform hover:bg-gray-800 active:scale-97 disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                disabled={isLoading || !input.trim()}
                onClick={() => input.trim() && doSubmit(input)}
              >
                {isLoading ? (
                  <HugeiconsIcon icon={SquareIcon} strokeWidth={2.0} className="size-3.5 fill-current" />
                ) : (
                  <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>

      <div className="relative">
        <Suggestions>
          <SuggestionList className="justify-center">
            {categories.map((category) => (
              <Suggestion
                key={category.label}
                variant="filled"
                onClick={(e) => handleCategoryClick(e, category.label)}
                className={cn(open && "opacity-0")}
              >
                <category.icon className="size-3.5" />
                {category.label}
              </Suggestion>
            ))}
          </SuggestionList>
        </Suggestions>

        <SuggestionPanel
          open={open}
          onOpenChange={handleOpenChange}
          onClose={handleClose}
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
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.0} className="size-4" />
                </SuggestionPanelClose>
              </SuggestionPanelHeader>
              <SuggestionPanelContent>
                <Suggestions
                  onSelect={(value) => {
                    setInput(value);
                    setOpen(false);
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
