import fs from "node:fs/promises";
import path from "node:path";
import { gitConfig } from "@/lib/layout.shared";
import {
  componentSlugFromUrl,
  formatComponentTitle,
} from "@/lib/knowledge/components";
import { createFactsChunks } from "@/lib/knowledge/facts";
import {
  chunkByLength,
  normalizeWhitespace,
  splitMarkdownSections,
  splitSourceSections,
} from "@/lib/knowledge/text";
import type { KnowledgeChunk } from "@/lib/knowledge/types";
import { source } from "@/lib/source";

const NEXUS_COMPONENT_SOURCE_DIR = "components/nexus-ui";
const NEXUS_SKILL_PATH = "skills/nexus-ui/SKILL.md";
const DOC_CHUNK_SIZE = 1_000;
const SOURCE_CHUNK_SIZE = 900;
const SKILL_CHUNK_SIZE = 900;

export async function buildKnowledgeCorpus(): Promise<KnowledgeChunk[]> {
  const chunks: KnowledgeChunk[] = [...createFactsChunks()];

  const pages = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!("getText" in page.data)) return [];
      const content = await page.data.getText("processed");
      return docPageToChunks({
        title: page.data.title,
        description: page.data.description ?? "",
        url: page.url,
        content,
      });
    }),
  );

  for (const pageChunks of pages) {
    chunks.push(...pageChunks);
  }

  chunks.push(...(await loadSkillChunks()));
  chunks.push(...(await loadSourceChunks()));

  return chunks;
}

async function docPageToChunks(input: {
  title: string;
  description: string;
  url: string;
  content: string;
}): Promise<KnowledgeChunk[]> {
  const slug = componentSlugFromUrl(input.url);
  const sections = splitMarkdownSections(input.content);
  const out: KnowledgeChunk[] = [];
  let index = 0;

  for (const section of sections) {
    for (const piece of chunkByLength(section.content, DOC_CHUNK_SIZE)) {
      if (!piece.trim()) continue;
      index += 1;
      out.push({
        id: `doc:${input.url}#${index}`,
        kind: "doc",
        citeable: true,
        url: input.url,
        title: input.title,
        description: input.description,
        section: section.heading,
        snippet: normalizeWhitespace(piece).slice(0, 280),
        content: piece,
        componentSlug: slug,
      });
    }
  }

  return out;
}

async function loadSkillChunks(): Promise<KnowledgeChunk[]> {
  const filePath = path.join(process.cwd(), NEXUS_SKILL_PATH);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return [];
  }

  const body = raw.replace(/^---[\s\S]*?---\n?/, "").trim();
  const out: KnowledgeChunk[] = [];
  let index = 0;

  for (const section of splitMarkdownSections(body)) {
    for (const piece of chunkByLength(section.content, SKILL_CHUNK_SIZE)) {
      if (!piece.trim()) continue;
      index += 1;
      out.push({
        id: `skill:nexus-ui#${index}`,
        kind: "skill",
        citeable: false,
        url: skillSectionUrl(section.heading),
        title: "Nexus UI skill reference",
        description: "Agent skill for installing and composing Nexus UI",
        section: section.heading,
        snippet: normalizeWhitespace(piece).slice(0, 280),
        content: piece,
      });
    }
  }

  return out;
}

function skillSectionUrl(heading: string): string {
  const normalized = heading.toLowerCase();
  if (normalized.includes("installation")) return "/docs/installation";
  if (normalized.includes("available components")) return "/docs";
  return "/docs/skills";
}

async function loadSourceChunks(): Promise<KnowledgeChunk[]> {
  const dir = path.join(process.cwd(), NEXUS_COMPONENT_SOURCE_DIR);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const out: KnowledgeChunk[] = [];

  for (const file of entries.filter((name) => name.endsWith(".tsx")).sort()) {
    const slug = file.replace(/\.tsx$/, "");
    const filePath = path.join(dir, file);
    const content = await fs.readFile(filePath, "utf8");
    const url = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${NEXUS_COMPONENT_SOURCE_DIR}/${file}`;
    let index = 0;

    for (const section of splitSourceSections(content)) {
      for (const piece of chunkByLength(section.content, SOURCE_CHUNK_SIZE)) {
        if (!piece.trim()) continue;
        index += 1;
        out.push({
          id: `source:${file}#${index}`,
          kind: "source",
          citeable: false,
          url,
          title: `${formatComponentTitle(slug)} (implementation)`,
          description: `${NEXUS_COMPONENT_SOURCE_DIR}/${file}`,
          section: section.heading,
          snippet: normalizeWhitespace(piece).slice(0, 280),
          content: piece,
          componentSlug: slug,
        });
      }
    }
  }

  return out;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}
