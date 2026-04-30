import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/nexus-ui/reasoning";

function ReasoningDefault() {
  return (
    <div className="h-[60%] w-full">
      <Reasoning>
        <ReasoningTrigger />
        <ReasoningContent>
          {`Let me think about this step by step.

First, the user is asking about authentication. I need to consider:
- What framework are they using?
- Do they need session-based or token-based auth?

Actually, wait - I should check if they already have any auth setup. Let me reconsider..`}
        </ReasoningContent>
      </Reasoning>
    </div>
  );
}

export default ReasoningDefault;
