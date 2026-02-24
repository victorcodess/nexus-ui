import * as React from "react";

import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { AudioLines, Globe, Paperclip } from "lucide-react";

const ChatgptInput = () => {
  return (
    <PromptInput>
      <PromptInputTextarea placeholder="Ask anything" />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 sm:w-fit cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <Paperclip className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Attach</span>
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="w-9 sm:w-fit cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <Globe className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 sm:w-fit cursor-pointer gap-1 rounded-full bg-[#E5E5E5] text-[13px] leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <AudioLines className="size-4" />
              <span className="hidden sm:inline">Voice</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ChatgptInput;