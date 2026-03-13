import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, Image, Mic, Paperclip } from "lucide-react";

export default function PromptInputWithTooltips() {
  return (
    <TooltipProvider delayDuration={200}>
      <PromptInput>
        <PromptInputTextarea />
        <PromptInputActions>
          <PromptInputActionGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                    <Paperclip className="size-4" />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent className="rounded-full text-white bg-gray-900 dark:text-white dark:bg-gray-700" arrowClassName="fill-gray-900 dark:fill-gray-700 bg-gray-900 dark:bg-gray-700">Attach file</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                    <Image className="size-4" />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent className="rounded-full text-white bg-gray-900 dark:text-white dark:bg-gray-700" arrowClassName="fill-gray-900 dark:fill-gray-700 bg-gray-900 dark:bg-gray-700">Upload image</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
                    <Mic className="size-4" />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent className="rounded-full text-white bg-gray-900 dark:text-white dark:bg-gray-700" arrowClassName="fill-gray-900 dark:fill-gray-700 bg-gray-900 dark:bg-gray-700">Voice input</TooltipContent>
            </Tooltip>
          </PromptInputActionGroup>
          <PromptInputActionGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputAction asChild>
                  <Button className="size-8 cursor-pointer rounded-full bg-gray-700 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                    <ArrowUp />
                  </Button>
                </PromptInputAction>
              </TooltipTrigger>
              <TooltipContent className="rounded-full text-white bg-gray-900 dark:text-white dark:bg-gray-700" arrowClassName="fill-gray-900 dark:fill-gray-700 bg-gray-900 dark:bg-gray-700">Send message</TooltipContent>
            </Tooltip>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>
    </TooltipProvider>
  );
}
