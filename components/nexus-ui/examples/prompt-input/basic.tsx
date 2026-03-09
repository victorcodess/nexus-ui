import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp } from "lucide-react";

export default function PromptInputBasic() {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup />
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
