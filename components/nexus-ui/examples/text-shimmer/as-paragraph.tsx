"use client";

import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

const TextShimmerAsParagraph = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center px-6">
      <TextShimmer
        as="p"
        className="max-w-md text-center text-sm leading-6"
      >
        Compiling component registry
      </TextShimmer>
    </div>
  );
};

export default TextShimmerAsParagraph;
