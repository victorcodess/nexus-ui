import { readFileSync } from "fs";
import { join } from "path";
import { highlight } from "fumadocs-core/highlight";
import { ComponentSourceClient } from "./component-source-client";

export interface ComponentSourceProps {
  /** Path to the component file relative to project root (e.g. "registry/new-york/model-selector/model-selector.tsx") */
  src: string;
  /** Optional title for the code block */
  title?: string;
}

/**
 * Renders a code block with the contents of a component file.
 * Use in MDX for Manual installation steps to avoid duplicating source code.
 */
export async function ComponentSource({ src, title }: ComponentSourceProps) {
  const code = readFileSync(join(process.cwd(), src), "utf-8");
  const highlighted = await highlight(code, { lang: "tsx" });
  return <ComponentSourceClient highlightedCode={highlighted} title={title} />;
}
