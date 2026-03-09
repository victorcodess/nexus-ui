import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { parseCodeBlockAttributes } from 'fumadocs-core/mdx-plugins/codeblock-utils';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      parseMetaString(meta: string) {
        const parsed = parseCodeBlockAttributes(meta, [
          'title',
          'tab',
          'keepBackground',
        ]);
        const data: Record<string, unknown> = parsed.attributes;
        if ('keepBackground' in data) data.keepBackground = true;
        return data;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  },
});
