"use client";

import {
  Suggestions,
  SuggestionList,
  Suggestion,
} from "@/components/nexus-ui/suggestions";

export default function SuggestionVariants() {
  return (
    <Suggestions onSelect={(value) => console.log(value)}>
      <SuggestionList>
        <Suggestion>Default</Suggestion>
        <Suggestion variant="outline">Outline</Suggestion>
        <Suggestion variant="ghost">Ghost</Suggestion>
      </SuggestionList>
    </Suggestions>
  );
}
