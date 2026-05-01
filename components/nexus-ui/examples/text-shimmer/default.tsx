"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerDefault = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6">
        Thinking through your request...
      </TextShimmer>
    </div>
  );
};

export default TextShimmerDefault;
