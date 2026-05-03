"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerAngled = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6" spread={5} angle={45}>
        Re-ranking search results
      </TextShimmer>
    </div>
  );
};

export default TextShimmerAngled;
