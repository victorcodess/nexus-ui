import { readFileSync } from "fs";
import { join } from "path";
import { highlight } from "fumadocs-core/highlight";
import { DemoWithCodeClient } from "./demo-with-code-client";

export interface DemoWithCodeProps {
  /** Path to the example file relative to project root (e.g. "components/nexus-ui/examples/model-selector/default.tsx") */
  src: string;
  /** The example component to render in the Preview tab */
  children: React.ReactNode;
  /** Optional className for the tabs container */
  className?: string;
  /** Optional className for the preview container (e.g. "h-[600px]" for taller demos) */
  previewClassName?: string;
}

const DEMO_PREFIX = "components/nexus-ui/examples/";

function resolveDemoPath(src: string) {
  const relative = src.startsWith(DEMO_PREFIX) ? src.slice(DEMO_PREFIX.length) : "";
  return relative && !relative.includes("..")
    ? join(process.cwd(), "components", "nexus-ui", "examples", relative)
    : null;
}

/**
 * Renders a Preview/Code tabs pair. The code is loaded from the file at `src`.
 * Use in MDX with: <DemoWithCode src="path/to/example.tsx"><ExampleComponent /></DemoWithCode>
 */
export async function DemoWithCode({ src, children, className = "my-10", previewClassName }: DemoWithCodeProps) {
  const resolvedPath = resolveDemoPath(src);
  if (!resolvedPath) {
    throw new Error(`Unsupported demo source path: ${src}`);
  }

  const code = readFileSync(resolvedPath, "utf-8");
  const highlighted = await highlight(code, { lang: "tsx" });
  return (
    <DemoWithCodeClient highlightedCode={highlighted} className={className} previewClassName={previewClassName}>
      {children}
    </DemoWithCodeClient>
  );
}
