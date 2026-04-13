import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  V0Plus,
  V0Model,
  V0ArrowUp,
  V0Caret,
} from "@/components/svgs/v0-icons";

const V0Input = () => {
  return (
    <PromptInput className="gap-2 rounded-xl p-3 shadow-none">
      <PromptInputTextarea
        placeholder="Ask v0 to build..."
        className="min-h-13.5 px-0 pt-0 pb-2"
      />
      <PromptInputActions className="px-0 py-0">
        <PromptInputActionGroup className="gap-1">
          <PromptInputAction asChild>
            <Button
              type="button"
              className="-none size-7 cursor-pointer gap-1 rounded-sm bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border"
            >
              <V0Plus className="size-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="h-7 cursor-pointer gap-1 rounded-sm bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border">
              <V0Model className="mr-0.5 size-4" />
              <span>v0 Max</span>
              <V0Caret className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup className="">
          <PromptInputAction asChild>
            <Button className="size-7 cursor-pointer gap-1 rounded-sm border border-border bg-muted/50 text-[13px] leading-6 font-normal text-muted-foreground">
              <V0ArrowUp className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default V0Input;
