export const NEXUS_COMPONENT_SLUGS = [
  "reasoning",
  "prompt-input",
  "message",
  "thread",
  "suggestions",
  "chain-of-thought",
  "citation",
  "questions",
  "attachments",
  "model-selector",
  "toaster",
  "feedback-bar",
  "image",
  "text-shimmer",
  "tool",
] as const;

export function matchComponentSlug(query: string): string | null {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  for (const slug of NEXUS_COMPONENT_SLUGS) {
    const label = slug.replace(/-/g, " ");
    if (normalized.includes(slug) || normalized.includes(label)) {
      return slug;
    }
  }
  return null;
}

export function componentSlugFromUrl(url: string): string | undefined {
  const match = url.match(/\/components\/([^/?#]+)/);
  return match?.[1];
}

export function formatComponentTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
