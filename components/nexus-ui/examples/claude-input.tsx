import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Paperclip } from "lucide-react";

const ClaudeInput = () => {
  return (
    <PromptInput className="rounded-[24px] shadow-none">
      <PromptInputTextarea
        placeholder="Reply to Claude..."
        className="min-h-12 px-5 py-3"
      />
      <PromptInputActions className="px-3 py-2">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-xl border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:hover:bg-[#404040] dark:text-white">
              <Paperclip className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-xl bg-[#da7756] text-[13px] leading-6 font-normal text-white hover:bg-[#c46a4d]">
              <ArrowUp className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ClaudeInput;
