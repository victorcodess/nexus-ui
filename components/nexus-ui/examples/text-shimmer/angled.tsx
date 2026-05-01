"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerAngled = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <TextShimmer className="text-sm leading-6" spread={30} angle={18}>
        Re-ranking search results
      </TextShimmer>
    </div>
  );
};

export default TextShimmerAngled;
