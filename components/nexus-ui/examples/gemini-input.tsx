import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  GeminiAdd,
  GeminiPageInfo,
  GeminiMic,
  GeminiCaret,
} from "@/components/svgs/gemini-icons";

const GeminiInput = () => {
  return (
    <PromptInput className="rounded-[32px] p-3 shadow-none dark:border-none">
      <PromptInputTextarea
        placeholder="Ask Gemini 3"
        className="min-h-12 px-3 py-2.25 text-base! placeholder:text-sm"
      />
      <PromptInputActions className="px-0 pt-2 pb-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="size-10 cursor-pointer rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border"
            >
              <GeminiAdd className="size-5 text-muted-foreground" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="h-10 cursor-pointer gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border">
              <GeminiPageInfo className="size-5 text-muted-foreground" />
              <span className="max-sm:hidden">Tools</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="h-10 cursor-pointer gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border">
              <span>Fast</span>
              <GeminiCaret className="-mb-0.5 size-5 text-muted-foreground" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border"
            >
              <GeminiMic className="size-5 text-muted-foreground" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default GeminiInput;
