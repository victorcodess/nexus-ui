import { Tool, ToolContent, ToolTrigger } from "@/components/nexus-ui/tool";

function ToolPending() {
  return (
    <Tool state="pending" defaultOpen>
      <ToolTrigger name="extract_receipt_fields" />
      <ToolContent>
        <div className="text-sm text-muted-foreground">
          Model is still streaming tool arguments...
        </div>
      </ToolContent>
    </Tool>
  );
}

export default ToolPending;
