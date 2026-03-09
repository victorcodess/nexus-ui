import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import type { Node } from 'fumadocs-core/page-tree';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export type NavItem =
  | { type: 'separator'; name: string }
  | { type: 'page'; name: string; url: string };

function extractNode(node: Node): NavItem | null {
  if (node.type === 'separator') {
    return { type: 'separator', name: String(node.name ?? '') };
  }
  if (node.type === 'page') {
    return { type: 'page', name: String(node.name), url: node.url };
  }
  if (node.type === 'folder') {
    return null;
  }
  return null;
}

export function getNavItems(): NavItem[] {
  const tree = source.getPageTree();
  const items: NavItem[] = [];
  for (const node of tree.children) {
    const extracted = extractNode(node);
    if (extracted) items.push(extracted);
    if (node.type === 'folder') {
      if (node.index) {
        items.push({ type: 'page', name: String(node.index.name), url: node.index.url });
      }
      for (const child of node.children) {
        const childItem = extractNode(child);
        if (childItem) items.push(childItem);
      }
    }
  }
  return items;
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
