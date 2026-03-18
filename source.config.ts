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
      // Disabled: causes ~12GB heap during Turbopack compilation.
      // Re-enable if you need /llms-full.txt or /llms.mdx/docs/... routes.
      includeProcessedMarkdown: false,
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
          'noCollapse',
        ]);
        const data: Record<string, unknown> = parsed.attributes;
        if ('keepBackground' in data) data.keepBackground = true;
        if ('noCollapse' in data) data.noCollapse = true;
        return data;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  },
});
