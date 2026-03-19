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
  ArrowUp,
  ArrowUpRight,
  Paperclip,
  LayoutGrid,
  Search,
  PenLine,
  Sparkles,
  X,
  Map,
  BookOpenText,
} from "lucide-react";

const categories = [
  {
    label: "Plan",
    icon: Map,
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
    icon: BookOpenText,
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
    icon: PenLine,
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
    icon: Sparkles,
    highlight: "Brainstorm",
    suggestions: [
      "Brainstorm side project ideas for a developer portfolio",
      "Brainstorm creative date night ideas",
      "Brainstorm ways to improve team productivity",
      "Brainstorm names for a new startup",
    ],
  },
];

export default function SuggestionWithPanel() {
  const [input, setInput] = useState("");
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

  return (
    <div className="flex w-full flex-col gap-6">
      <PromptInput className="z-2 shadow-sm">
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <PromptInputActions>
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                <Paperclip className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer rounded-full bg-gray-700 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                <ArrowUp />
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
                variant="default"
                onClick={(e) => handleCategoryClick(e, category.label)}
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
              <SuggestionPanelHeader>
                <SuggestionPanelTitle>
                  <active.icon className="size-3.5 text-gray-400" />
                  <span className="text-[13px] font-normal text-gray-400">
                    {active.label}
                  </span>
                </SuggestionPanelTitle>
                <SuggestionPanelClose>
                  <X className="size-3.5" />
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
                      className="group h-auto w-full whitespace-normal justify-between rounded-[6px] px-3 text-left text-gray-900 hover:bg-gray-200/72"
                    >
                      {text}
                      <ArrowUpRight className="size-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500" />
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
