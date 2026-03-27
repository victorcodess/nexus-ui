"use client";

import {
  Suggestions,
  SuggestionList,
  Suggestion,
} from "@/components/nexus-ui/suggestions";
import {
  AiMagicIcon,
  CodeSimpleIcon,
  Dumbbell02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function SuggestionWithIcons() {
  return (
    <Suggestions onSelect={(value) => console.log(value)}>
      <SuggestionList>
        <Suggestion className="gap-1.5">
          <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2.0} className="size-3.5" />
          What is AI?
        </Suggestion>
        <Suggestion className="gap-1.5">
          <HugeiconsIcon icon={CodeSimpleIcon} strokeWidth={2.0} className="size-3.5" />
          How to learn React?
        </Suggestion>
        <Suggestion className="gap-1.5">
          <HugeiconsIcon icon={Dumbbell02Icon} strokeWidth={2.0} className="size-3.5" />
          Design a workout plan
        </Suggestion>
      </SuggestionList>
    </Suggestions>
  );
}
