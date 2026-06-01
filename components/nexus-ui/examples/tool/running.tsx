import {
  Tool,
  ToolContent,
  ToolInput,
  ToolTrigger,
} from "@/components/nexus-ui/tool";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

function ToolRunning() {
  const input = {
    userId: "usr_9f23",
    includeInvoices: true,
    includeUsage: true,
    lookbackDays: 90,
  };

  return (
    <Tool status="running" defaultOpen>
      <ToolTrigger name="fetch_billing_summary" />
      <ToolContent>
        <ToolInput payload={input} />
        <div className="text-sm text-muted-foreground">
          <TextShimmer invertLight>Fetching billing summary...</TextShimmer>
        </div>
      </ToolContent>
    </Tool>
  );
}

export default ToolRunning;
