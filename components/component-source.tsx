import { readFileSync } from "fs";
import { extname, join } from "path";
import { highlight } from "fumadocs-core/highlight";
import { ComponentSourceClient } from "./component-source-client";

export interface ComponentSourceProps {
  /** Path to the component file relative to project root (e.g. "components/nexus-ui/model-selector.tsx") */
  src: string;
  /** Optional title for the code block */
  title?: string;
}

function resolveSourcePath(src: string) {
  const componentRelative = src.startsWith("components/nexus-ui/")
    ? src.slice("components/nexus-ui/".length)
    : null;
  if (componentRelative && !componentRelative.includes("..")) {
    return join(process.cwd(), "components", "nexus-ui", componentRelative);
  }

  const libRelative = src.startsWith("lib/") ? src.slice("lib/".length) : null;
  if (libRelative && !libRelative.includes("..")) {
    return join(process.cwd(), "lib", libRelative);
  }

  const appRelative = src.startsWith("app/") ? src.slice("app/".length) : null;
  if (appRelative && !appRelative.includes("..")) {
    return join(process.cwd(), "app", appRelative);
  }

  return null;
}

function resolveLanguage(src: string) {
  const extension = extname(src).toLowerCase();
  if (extension === ".css") return "css";
  if (extension === ".json") return "json";
  if (extension === ".mdx") return "mdx";
  if (extension === ".js" || extension === ".mjs" || extension === ".cjs") {
    return "js";
  }
  if (extension === ".ts" || extension === ".tsx") return "tsx";
  return "tsx";
}

/**
 * Renders a code block with the contents of a component file.
 * Use in MDX for Manual installation steps to avoid duplicating source code.
 */
export async function ComponentSource({ src, title }: ComponentSourceProps) {
  const resolvedPath = resolveSourcePath(src);
  if (!resolvedPath) {
    throw new Error(`Unsupported component source path: ${src}`);
  }

  const code = readFileSync(resolvedPath, "utf-8");
  const highlighted = await highlight(code, { lang: resolveLanguage(src) });
  return <ComponentSourceClient highlightedCode={highlighted} title={title} />;
}
