import * as React from "react";
import {
  AiBrain01Icon,
  Analytics01Icon,
  CheckmarkCircle01Icon,
  FileSearchIcon,
  IdeaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ChainOfThought,
  ChainOfThoughtComplete,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepTitle,
  ChainOfThoughtTrigger,
} from "@/components/nexus-ui/chain-of-thought";

function ChainOfThoughtDefault() {
  return (
    <div className="w-full">
      <ChainOfThought autoCloseOnAllComplete={false}>
        <ChainOfThoughtTrigger
          icon={
            <HugeiconsIcon
              icon={AiBrain01Icon}
              strokeWidth={1.75}
              className="size-4"
            />
          }
        >
          Triaged support ticket with account activity context
        </ChainOfThoughtTrigger>

        <ChainOfThoughtContent>
          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={FileSearchIcon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Pulled customer profile and recent events
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
              Reviewed billing history and usage spikes
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed" className="animate-in">
            <ChainOfThoughtStepTitle
              icon={
                <HugeiconsIcon
                  icon={IdeaIcon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              }
            >
              Proposed resolution with confidence score
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtComplete
            label="Task complete"
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

export default ChainOfThoughtDefault;
