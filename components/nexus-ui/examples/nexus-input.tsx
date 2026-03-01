import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Paperclip } from "lucide-react";

const NexusInput = () => {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
              <Paperclip />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full bg-[#404040] text-[13px] leading-6 font-normal text-white hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default NexusInput;
