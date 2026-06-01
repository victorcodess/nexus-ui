import {
  Tool,
  ToolContent,
  ToolInput,
  ToolOutput,
  ToolTrigger,
} from "@/components/nexus-ui/tool";

function ToolDefault() {
  const input = {
    city: "Paris",
    unit: "celsius",
  };

  const output = {
    city: "Paris",
    unit: "celsius",
    temperature: 22,
    condition: "sunny",
  };

  return (
    <Tool state="completed" defaultOpen>
      <ToolTrigger name="get_weather" />
      <ToolContent>
        <ToolInput payload={input} />
        <ToolOutput payload={output} />
      </ToolContent>
    </Tool>
  );
}

export default ToolDefault;
