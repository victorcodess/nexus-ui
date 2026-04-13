"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUp02Icon,
  Image01Icon,
  Mic02Icon,
  PlusSignIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type InputStatus = "idle" | "loading" | "error" | "submitted";

export default function PromptInputWithTooltips() {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<InputStatus>("idle");

  const doSubmit = React.useCallback((value: string) => {
    if (!value.trim()) return;
    setInput("");
    setStatus("loading");

    setTimeout(() => {
      setStatus("submitted");
      setTimeout(() => setStatus("idle"), 800);
    }, 2500);
  }, []);

  const isLoading = status === "loading";

  return (
    <TooltipProvider delayDuration={200}>
      <PromptInput onSubmit={doSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How can I help you today?"
          disabled={isLoading}
        />
        <PromptInputActions>
          <PromptInputActionGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent
                className="rounded-full bg-primary text-primary-foreground"
                arrowClassName="fill-primary bg-primary"
              >
                Attach file
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
                  >
                    <HugeiconsIcon icon={Image01Icon} strokeWidth={2.0} className="size-4" />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent
                className="rounded-full bg-primary text-primary-foreground"
                arrowClassName="fill-primary bg-primary"
              >
                Upload image
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
                  >
                    <HugeiconsIcon icon={Mic02Icon} strokeWidth={2.0} className="size-4" />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent
                className="rounded-full bg-primary text-primary-foreground"
                arrowClassName="fill-primary bg-primary"
              >
                Voice input
              </TooltipContent>
            </Tooltip>
          </PromptInputActionGroup>
          <PromptInputActionGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    size="icon-sm"
                    className="cursor-pointer rounded-full active:scale-97 disabled:opacity-70"
                    disabled={!isLoading && !input.trim()}
                    onClick={() => input.trim() && doSubmit(input)}
                  >
                    {isLoading ? (
                      <HugeiconsIcon icon={SquareIcon} strokeWidth={2.0} className="size-3.5 fill-current" />
                    ) : (
                      <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
                    )}
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent
                className="rounded-full bg-primary text-primary-foreground"
                arrowClassName="fill-primary bg-primary"
              >
                Send message
              </TooltipContent>
            </Tooltip>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>
    </TooltipProvider>
  );
}
