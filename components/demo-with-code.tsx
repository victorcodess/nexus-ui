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

/**
 * Renders a Preview/Code tabs pair. The code is loaded from the file at `src`.
 * Use in MDX with: <DemoWithCode src="path/to/example.tsx"><ExampleComponent /></DemoWithCode>
 */
export async function DemoWithCode({ src, children, className = "my-10", previewClassName }: DemoWithCodeProps) {
  const code = readFileSync(join(process.cwd(), src), "utf-8");
  const highlighted = await highlight(code, { lang: "tsx" });
  return (
    <DemoWithCodeClient highlightedCode={highlighted} className={className} previewClassName={previewClassName}>
      {children}
    </DemoWithCodeClient>
  );
}
