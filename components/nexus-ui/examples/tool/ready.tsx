import {
  Tool,
  ToolContent,
  ToolInput,
  ToolTrigger,
} from "@/components/nexus-ui/tool";

function ToolReady() {
  const input = {
    channel: "#support",
    text: "Escalate ticket #4821 to on-call engineer",
    mention: "@ops-oncall",
  };

  return (
    <Tool state="ready" defaultOpen>
      <ToolTrigger name="send_slack_message" />
      <ToolContent>
        <ToolInput payload={input} />
      </ToolContent>
    </Tool>
  );
}

export default ToolReady;
