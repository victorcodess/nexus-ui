export const revalidate = false;

const payload = {
  skills: [
    {
      name: 'nexus-ui',
      description:
        'Install and compose Nexus UI components for AI chat interfaces',
      files: ['SKILL.md'],
    },
  ],
};

export async function GET() {
  return Response.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
}
