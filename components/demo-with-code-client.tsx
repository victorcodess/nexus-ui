"use client";

import { CodeBlock } from "@/components/codeblock";
import { Tabs, Tab } from "@/components/tabs";
import ReviewContainer from "@/components/preview-container";

export function DemoWithCodeClient({
  highlightedCode,
  children,
  className = "my-10",
  previewClassName,
}: {
  highlightedCode: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  previewClassName?: string;
}) {
  return (
    <Tabs items={["Preview", "Code"]} className={className}>
      <Tab value="Preview">
        <ReviewContainer className={previewClassName}>{children}</ReviewContainer>
      </Tab>
      <Tab value="Code">
        <CodeBlock noCollapse>{highlightedCode}</CodeBlock>
      </Tab>
    </Tabs>
  );
}
