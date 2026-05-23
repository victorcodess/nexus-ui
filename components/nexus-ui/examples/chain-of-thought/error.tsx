import * as React from "react";
import {
  AiBrain01Icon,
  AiWebBrowsingIcon,
  FolderOpenIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepContent,
  ChainOfThoughtStepTitle,
  ChainOfThoughtTrigger,
} from "@/components/nexus-ui/chain-of-thought";

function ChainOfThoughtError() {
  return (
    <div className="w-full">
      <ChainOfThought autoCloseOnAllComplete={false}>
        <ChainOfThoughtTrigger
          icon={<HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} className="size-4" />}
        >
          Executing plan...
        </ChainOfThoughtTrigger>

        <ChainOfThoughtContent>
          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle
              icon={<HugeiconsIcon icon={FolderOpenIcon} strokeWidth={1.75} className="size-4" />}
            >
              Connected to workspace
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="error" hasContent autoCloseOnComplete={false}>
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={AiWebBrowsingIcon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Failed to fetch external API schema
            </ChainOfThoughtStepTitle>

            <ChainOfThoughtStepContent>
              <div className="mt-1 rounded-[12px] border border-destructive/20 bg-destructive/5 p-3 text-sm leading-4.5 text-destructive">
                Request to api.example.com timed out after 10s. Retry with fallback
                endpoint or cached schema.
              </div>
            </ChainOfThoughtStepContent>
          </ChainOfThoughtStep>
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
}

export default ChainOfThoughtError;
