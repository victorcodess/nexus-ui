import { Tool, ToolContent, ToolTrigger } from "@/components/nexus-ui/tool";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

function ToolPending() {
  return (
    <Tool status="pending" defaultOpen>
      <ToolTrigger name="extract_receipt_fields" />
      <ToolContent>
        <div className="text-sm text-muted-foreground">
          <TextShimmer invertLight>
            Model is still streaming tool arguments...
          </TextShimmer>
        </div>
      </ToolContent>
    </Tool>
  );
}

export default ToolPending;
