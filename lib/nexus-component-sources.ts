import fs from "node:fs/promises";
import path from "node:path";
import type { DocumentData } from "flexsearch";
import { gitConfig } from "@/lib/layout.shared";

export const NEXUS_COMPONENT_SOURCE_DIR = "components/nexus-ui";

export interface NexusSourceChunk extends DocumentData {
  id: string;
  url: string;
  title: string;
  description: string;
  section: string;
  snippet: string;
  content: string;
}

export function nexusComponentSourceBlobUrl(filename: string): string {
  return `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${NEXUS_COMPONENT_SOURCE_DIR}/${filename}`;
}

export function formatNexusComponentTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugFromNexusSourceUrl(url: string): string | null {
  const match = url.match(/components\/nexus-ui\/([^/?#]+)\.tsx/);
  return match?.[1] ?? null;
}

export async function readNexusComponentSource(
  slug: string,
): Promise<string | null> {
  const filePath = path.join(
    process.cwd(),
    NEXUS_COMPONENT_SOURCE_DIR,
    `${slug}.tsx`,
  );
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function listNexusComponentSourceFiles(): Promise<string[]> {
  const dir = path.join(process.cwd(), NEXUS_COMPONENT_SOURCE_DIR);
  const entries = await fs.readdir(dir);
  return entries.filter((name) => name.endsWith(".tsx")).sort();
}

export async function loadNexusComponentSourceChunks(): Promise<
  NexusSourceChunk[]
> {
  const files = await listNexusComponentSourceFiles();
  const chunks: NexusSourceChunk[] = [];

  for (const file of files) {
    const slug = file.replace(/\.tsx$/, "");
    const content = await readNexusComponentSource(slug);
    if (!content) continue;

    chunks.push(
      ...createSourceChunks({
        slug,
        file,
        content,
      }),
    );
  }

  return chunks;
}

function createSourceChunks(input: {
  slug: string;
  file: string;
  content: string;
}): NexusSourceChunk[] {
  const url = nexusComponentSourceBlobUrl(input.file);
  const title = `${formatNexusComponentTitle(input.slug)} (source)`;
  const description = `Nexus UI implementation: ${NEXUS_COMPONENT_SOURCE_DIR}/${input.file}`;
  const sections = splitSourceIntoSections(input.content);
  const chunks: NexusSourceChunk[] = [];
  let index = 0;

  for (const section of sections) {
    const pieces = chunkByLength(section.content, 900);
    for (const piece of pieces) {
      if (!piece.trim()) continue;
      index += 1;
      chunks.push({
        id: `source:${input.file}#${index}`,
        title,
        description,
        url,
        section: section.heading,
        snippet: normalizeWhitespace(piece).slice(0, 220),
        content: piece,
      });
    }
  }

  return chunks;
}

function splitSourceIntoSections(
  content: string,
): Array<{ heading: string; content: string }> {
  const lines = content.split("\n");
  const sections: Array<{ heading: string; content: string }> = [];
  let heading = "Overview";
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) sections.push({ heading, content: text });
    buffer = [];
  };

  for (const line of lines) {
    const fnMatch = line.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
    const typeMatch = line.match(/^type\s+(\w+)/);
    const constMatch = line.match(/^const\s+(\w+)\s*=/);
    if (fnMatch || typeMatch || constMatch) {
      flush();
      heading = fnMatch?.[1] ?? typeMatch?.[1] ?? constMatch?.[1] ?? heading;
      buffer.push(line);
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections.length > 0
    ? sections
    : [{ heading: "Overview", content: content.trim() }];
}

function chunkByLength(text: string, maxChars: number): string[] {
  const blocks = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const block of blocks) {
    const value = block.trim();
    if (!value) continue;

    if ((current ? `${current}\n\n${value}` : value).length <= maxChars) {
      current = current ? `${current}\n\n${value}` : value;
      continue;
    }

    if (current) chunks.push(current);
    if (value.length <= maxChars) {
      current = value;
    } else {
      chunks.push(...splitLongBlock(value, maxChars));
      current = "";
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitLongBlock(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) out.push(current);
    current = word;
  }
  if (current) out.push(current);
  return out;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function pickRelevantSourceSnippet(
  content: string,
  query: string,
): string {
  const normalizedQuery = normalizeForMatching(query);
  const terms = normalizedQuery.split(/\s+/).filter((term) => term.length > 2);
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => normalizeWhitespace(block))
    .filter(Boolean);

  const hit = blocks.find((block) => {
    const normalizedBlock = normalizeForMatching(block);
    return (
      normalizedBlock.includes(normalizedQuery) ||
      terms.some((term) => normalizedBlock.includes(term))
    );
  });

  return (hit ?? blocks[0] ?? content).slice(0, 220);
}

function normalizeForMatching(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}
