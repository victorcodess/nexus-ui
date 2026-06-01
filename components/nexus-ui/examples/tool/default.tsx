import {
  Tool,
  ToolContent,
  ToolInput,
  ToolOutput,
  ToolTrigger,
} from "@/components/nexus-ui/tool";

function ToolDefault() {
  const input = {
    origin: "LHR",
    destination: "SFO",
    date: "2026-06-14",
    cabin: "economy",
  };

  const output = {
    route: "LHR -> SFO",
    bestOption: {
      airline: "BA",
      priceUsd: 742,
      duration: "10h 45m",
      stops: 0,
    },
  };

  return (
    <Tool state="completed" defaultOpen>
      <ToolTrigger name="search_flights" />
      <ToolContent>
        <ToolInput payload={input} />
        <ToolOutput payload={output} />
      </ToolContent>
    </Tool>
  );
}

export default ToolDefault;
