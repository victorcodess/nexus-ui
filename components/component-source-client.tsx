"use client";

import { CodeBlock } from "@/components/codeblock";

export function ComponentSourceClient({
  highlightedCode,
  title,
}: {
  highlightedCode: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="not-prose my-4">
      <CodeBlock title={title}>
        {highlightedCode}
      </CodeBlock>
    </div>
  );
}
