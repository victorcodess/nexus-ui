"use client";

import * as React from "react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/nexus-ui/reasoning";

const FULL_REASONING_TEXT = `Let me think about this step by step.

First, the user is asking about authentication. I need to consider:
- What framework are they using?
- Do they need session-based or token-based auth?

Actually, wait - I should check if they already have any auth setup. Let me reconsider..`;

function ReasoningDefault() {
  const [isStreaming, setIsStreaming] = React.useState(true);
  const [reasoningText, setReasoningText] = React.useState("");

  React.useEffect(() => {
    let i = 0;
    setIsStreaming(true);

    const timer = window.setInterval(() => {
      i += 2;
      const next = FULL_REASONING_TEXT.slice(0, i);
      setReasoningText(next);

      if (i >= FULL_REASONING_TEXT.length) {
        window.clearInterval(timer);
        setIsStreaming(false);
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="h-[60%] w-full">
      <Reasoning isStreaming={isStreaming}>
        <ReasoningTrigger />
        <ReasoningContent>{reasoningText}</ReasoningContent>
      </Reasoning>
    </div>
  );
}

export default ReasoningDefault;
