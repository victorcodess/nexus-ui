import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const revalidate = false;

const SKILL_PATH = join(process.cwd(), 'skills/nexus-ui/SKILL.md');

export async function GET() {
  const content = await readFile(SKILL_PATH, 'utf-8');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
