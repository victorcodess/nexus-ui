const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "do",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "new",
  "of",
  "on",
  "the",
  "to",
  "using",
  "with",
]);

const TERM_SYNONYMS: Record<string, string[]> = {
  install: ["installation", "setup", "getting", "started"],
  installation: ["install", "setup", "getting", "started"],
  setup: ["install", "installation", "configure"],
  add: ["install", "installation"],
  docs: ["documentation", "guide"],
  component: ["components", "primitive", "primitives"],
  nexus: ["nexus-ui", "nexusui"],
  ui: ["nexus-ui", "interface"],
  overview: ["introduction", "about"],
  introduction: ["overview", "getting", "started"],
  reasoning: ["thinking", "trace", "istreaming"],
  streaming: ["istreaming", "stream"],
};

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeForMatching(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  return value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => !STOP_WORDS.has(term));
}

export function expandQueryTerms(terms: string[]): string[] {
  const expanded = new Set<string>();
  for (const term of terms) {
    expanded.add(term);
    for (const synonym of TERM_SYNONYMS[term] ?? []) expanded.add(synonym);
  }
  return [...expanded];
}

export function splitMarkdownSections(
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
    const trimmed = line.trim();
    if (/^#{1,6}\s+/.test(trimmed)) {
      flush();
      heading = trimmed.replace(/^#{1,6}\s+/, "");
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections.length > 0 ? sections : [{ heading: "Overview", content }];
}

export function splitSourceSections(
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

export function chunkByLength(text: string, maxChars: number): string[] {
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

export function buildQueryVariants(query: string): string[] {
  const normalized = normalizeForMatching(query);
  const core = tokenize(normalized).slice(0, 8).join(" ");
  const terms = tokenize(normalized);
  const expanded = [...new Set([...terms, ...expandQueryTerms(terms)])];
  const variants = new Set<string>([
    query,
    core,
    `${core} Nexus UI`,
    `${expanded.join(" ")} Nexus UI`,
  ]);

  for (const term of expanded) {
    if (term.length >= 3) variants.add(term);
  }

  return [...variants].map((v) => v.trim()).filter(Boolean);
}
