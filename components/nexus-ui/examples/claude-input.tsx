import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  ClaudeAdd,
  ClaudeAudioLines,
  ClaudeCaret,
} from "@/components/svgs/claude-icons";

const ClaudeInput = () => {
  return (
    <PromptInput className="gap-3 rounded-[20px] p-3.5 shadow-none">
      <PromptInputTextarea
        placeholder="How can I help you today?"
        className="min-h-12 px-1.5 py-1.5 placeholder:text-base"
      />
      <PromptInputActions className="px-1 py-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-md border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <ClaudeAdd className="size-5" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="h-8 cursor-pointer gap-1 rounded-md bg-transparent pr-2! text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <span>Sonnet 4.6</span>
              <ClaudeCaret className="size-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-md bg-transparent text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <ClaudeAudioLines className="size-5" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ClaudeInput;
