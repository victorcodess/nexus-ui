import * as React from "react";

import {
  ChainOfThought,
  ChainOfThoughtComplete,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepTitle,
  ChainOfThoughtTrigger,
} from "@/components/nexus-ui/chain-of-thought";

function ChainOfThoughtBasic() {
  return (
    <div className="w-full">
      <ChainOfThought autoCloseOnAllComplete={false}>
        <ChainOfThoughtTrigger>
          Explored 3 files, 2 searches, lints
        </ChainOfThoughtTrigger>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle>
              Grepped `chain-of-thought` in `nexus-ui`
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle>
              Searched files `**/components/*` in `nexus-ui`
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle>
              Read `registry.json` L1-206
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle>
              Read `chain-of-thought.tsx` L1-80
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep status="completed">
            <ChainOfThoughtStepTitle>
              Read `default.tsx` L1-96
            </ChainOfThoughtStepTitle>
          </ChainOfThoughtStep>

          <ChainOfThoughtComplete label="No linter errors" />
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
}

export default ChainOfThoughtBasic;
