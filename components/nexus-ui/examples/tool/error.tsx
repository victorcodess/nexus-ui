import {
  Tool,
  ToolContent,
  ToolInput,
  ToolOutput,
  ToolTrigger,
} from "@/components/nexus-ui/tool";

function ToolErrorState() {
  const input = {
    to: "ceo@acme.com",
    subject: "Weekly KPI Summary",
    templateId: "kpi-weekly-v2",
  };

  const error = {
    code: "smtp_auth_failed",
    message: "SMTP authentication failed for configured sender",
  };

  return (
    <Tool status="error" defaultOpen>
      <ToolTrigger name="send_email" />
      <ToolContent>
        <ToolInput payload={input} />
        <ToolOutput payload={null} errorText={error.message} showWhen={["error"]} />
      </ToolContent>
    </Tool>
  );
}

export default ToolErrorState;
