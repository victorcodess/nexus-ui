import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Exclude component docs from search index to reduce memory (they have heavy MDX content).
// Remove this filter if memory is no longer an issue.
const filteredSource = {
  ...source,
  getPages: () =>
    source.getPages().filter((p) => !p.url.startsWith('/docs/components/')),
} as typeof source;

export const { GET } = createFromSource(filteredSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
