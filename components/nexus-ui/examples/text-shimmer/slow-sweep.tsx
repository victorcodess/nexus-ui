"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerSlowSweep = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6" duration={5.5}>
        Analyzing conversation context
      </TextShimmer>
    </div>
  );
};

export default TextShimmerSlowSweep;
