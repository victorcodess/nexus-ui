import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Paperclip } from "lucide-react";

export default function PromptInputDefault() {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <Paperclip />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full bg-gray-700 text-[13px] leading-6 font-normal text-white hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
