import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Mic, Paperclip } from "lucide-react";

export default function PromptInputMultipleActions() {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <Paperclip className="size-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <Mic className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer rounded-full bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600">
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
