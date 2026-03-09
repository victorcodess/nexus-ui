import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { AudioLines, Globe, Paperclip } from "lucide-react";

export default function PromptInputChatGPT() {
  return (
    <PromptInput className="rounded-[28px] shadow-none">
      <PromptInputTextarea
        placeholder="Ask anything"
        className="min-h-16 px-6"
      />
      <PromptInputActions className="px-3 py-2.5">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <Paperclip className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Attach</span>
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <Globe className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full bg-gray-200 text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <AudioLines className="size-4" />
              <span className="hidden sm:inline">Voice</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
