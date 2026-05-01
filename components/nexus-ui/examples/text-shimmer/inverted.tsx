"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerInverted = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6" invert>
        Processing tool output...
      </TextShimmer>
    </div>
  );
};

export default TextShimmerInverted;
