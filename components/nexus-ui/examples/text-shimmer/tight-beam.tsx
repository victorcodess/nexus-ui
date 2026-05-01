"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerTightBeam = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6" spread={8} duration={1.6}>
        Running tool calls
      </TextShimmer>
    </div>
  );
};

export default TextShimmerTightBeam;
