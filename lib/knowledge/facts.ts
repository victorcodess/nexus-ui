import { SITE_URL } from "@/lib/site";
import type { KnowledgeChunk } from "@/lib/knowledge/types";
import { normalizeWhitespace } from "@/lib/knowledge/text";

const FACTS_BODY = `
Nexus UI is an open-source component library for building AI-powered interfaces (chat, streaming, multimodal).
Components are installed via the shadcn registry — not as an npm package per component.

Install a component: npx shadcn@latest add @nexus-ui/<registry-name>
Example: npx shadcn@latest add @nexus-ui/prompt-input

After install, import from the user's project path: @/components/nexus-ui/<file>
Example: import { PromptInput, PromptInputTextarea } from "@/components/nexus-ui/prompt-input"
Never use @nexus-ui/<name> as a runtime import path.

Public documentation base: ${SITE_URL}/docs
Introduction: ${SITE_URL}/docs
Installation: ${SITE_URL}/docs/installation
Component docs: ${SITE_URL}/docs/components/<slug>
Skills for coding agents: ${SITE_URL}/docs/skills
`.trim();

export function createFactsChunks(): KnowledgeChunk[] {
  const content = normalizeWhitespace(FACTS_BODY);
  return [
    {
      id: "facts:canonical",
      kind: "facts",
      citeable: true,
      url: `${SITE_URL}/docs`,
      title: "Nexus UI canonical facts",
      description: "Install commands, import paths, and docs URLs",
      section: "Reference",
      snippet: content.slice(0, 280),
      content: FACTS_BODY.trim(),
    },
  ];
}
