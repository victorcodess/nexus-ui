import { source } from '@/lib/source';
import { SITE_URL } from '@/lib/site';

export const revalidate = false;

export async function GET() {
  const pages = source.getPages();
  const core = pages.filter((page) => !page.url.startsWith('/docs/components/'));
  const components = pages.filter((page) => page.url.startsWith('/docs/components/'));

  const lines: string[] = [
    '# Nexus UI Documentation',
    '',
    '> Nexus UI is an open-source component library for building AI-powered interfaces. It gives you composable, copy-paste primitives designed for chat, streaming, and multimodal experiences — built on React, Tailwind CSS v4, and Radix UI.',
    '',
    'Prefer markdown responses for agent retrieval with `.md` URLs or `Accept: text/markdown`.',
    '',
    '## Core Docs',
    ...core.map((page) => {
      const description = page.data.description ?? 'Documentation page';
      return `- [${page.data.title}](${SITE_URL}${page.url}.md): ${description}`;
    }),
    '',
    '## Components',
    ...components.map((page) => {
      const description = page.data.description ?? 'Component documentation';
      return `- [${page.data.title}](${SITE_URL}${page.url}.md): ${description}`;
    }),
    '',
    '## Optional',
    `- [Homepage](${SITE_URL}/): Nexus UI website overview`,
    `- [Demo](${SITE_URL}/demo): Interactive component preview`,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Vary: 'Accept',
    },
  });
}
