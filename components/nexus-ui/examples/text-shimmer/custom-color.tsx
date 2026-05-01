"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerCustomColor = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer
        className="text-sm leading-6"
        color="oklch(0.78 0.12 255)"
      >
        Syncing vector index
      </TextShimmer>
    </div>
  );
};

export default TextShimmerCustomColor;
