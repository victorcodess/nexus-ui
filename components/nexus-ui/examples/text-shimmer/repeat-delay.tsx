"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerRepeatDelay = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6" repeatDelay={2}>
        Generating response...
      </TextShimmer>
    </div>
  );
};

export default TextShimmerRepeatDelay;
