import * as React from "react";
import {
  Analytics01Icon,
  CheckmarkCircle01Icon,
  FolderOpenIcon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ChainOfThought,
  ChainOfThoughtComplete,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepTitle,
} from "@/components/nexus-ui/chain-of-thought";

function ChainOfThoughtWithoutHeader() {
  return (
    <div className="w-full">
      <ChainOfThought defaultOpen autoCloseOnAllComplete={false}>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={Globe02Icon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Fetched customer chat history from CRM
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={FolderOpenIcon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Retrieved orders, refunds, and delivery events
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={Analytics01Icon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Generated escalation summary and next actions
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtComplete
            label="Escalation draft ready"
            icon={
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                strokeWidth={1.75}
                className="size-4"
              />
            }
          />
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
}

export default ChainOfThoughtWithoutHeader;
