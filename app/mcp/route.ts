import { getLLMText, source } from '@/lib/source';
import { SITE_URL } from '@/lib/site';

export const revalidate = false;

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function jsonRpcResult(id: JsonRpcId, result: unknown) {
  return Response.json(
    {
      jsonrpc: '2.0',
      id,
      result,
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

function jsonRpcError(id: JsonRpcId, code: number, message: string) {
  return Response.json(
    {
      jsonrpc: '2.0',
      id,
      error: { code, message },
    },
    {
      status: code === -32601 ? 404 : 400,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

function normalizeDocPath(input: string): string {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    try {
      const url = new URL(input);
      return url.pathname.replace(/\/$/, '');
    } catch {
      return input;
    }
  }

  const value = input.trim();
  if (value === '/docs' || value === 'docs') return '/docs';
  if (value.startsWith('/')) return value.replace(/\/$/, '');
  return `/${value}`.replace(/\/$/, '');
}

export async function GET() {
  return Response.json({
    name: 'nexus-ui-docs-mcp',
    description: 'MCP endpoint for Nexus UI documentation',
    url: `${SITE_URL}/mcp`,
    protocol: 'jsonrpc',
    methods: ['initialize', 'tools/list', 'tools/call', 'ping'],
  });
}

export async function POST(req: Request) {
  let body: JsonRpcRequest;

  try {
    body = (await req.json()) as JsonRpcRequest;
  } catch {
    return jsonRpcError(null, -32700, 'Parse error');
  }

  const id = body.id ?? null;

  if (body.jsonrpc !== '2.0' || !body.method) {
    return jsonRpcError(id, -32600, 'Invalid Request');
  }

  if (body.method === 'initialize') {
    return jsonRpcResult(id, {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'nexus-ui-docs-mcp',
        version: '1.0.0',
      },
      capabilities: {
        tools: {},
      },
    });
  }

  if (body.method === 'ping') {
    return jsonRpcResult(id, {});
  }

  if (body.method === 'tools/list') {
    return jsonRpcResult(id, {
      tools: [
        {
          name: 'search_docs',
          description: 'Search Nexus UI docs pages by title and description',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              limit: { type: 'number', minimum: 1, maximum: 20 },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_doc',
          description: 'Get markdown content for a docs page URL or path',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description:
                  'Examples: /docs/components/message or https://nexus-ui.dev/docs/components/message',
              },
            },
            required: ['path'],
          },
        },
      ],
    });
  }

  if (body.method === 'tools/call') {
    const params: Record<string, unknown> = isRecord(body.params)
      ? body.params
      : {};
    const name =
      'name' in params && typeof params.name === 'string' ? params.name : '';
    const argumentsObj: Record<string, unknown> =
      'arguments' in params && isRecord(params.arguments)
        ? params.arguments
        : {};

    if (name === 'search_docs') {
      const query =
        'query' in argumentsObj && typeof argumentsObj.query === 'string'
          ? argumentsObj.query.trim().toLowerCase()
          : '';
      const limit =
        'limit' in argumentsObj && typeof argumentsObj.limit === 'number'
          ? Math.max(1, Math.min(20, Math.floor(argumentsObj.limit)))
          : 8;

      if (!query) {
        return jsonRpcError(id, -32602, 'query is required');
      }

      const pages = source.getPages();
      const matches = pages
        .filter((page) => {
          const haystack = `${page.data.title ?? ''} ${page.data.description ?? ''} ${page.url}`.toLowerCase();
          return haystack.includes(query);
        })
        .slice(0, limit)
        .map((page) => ({
          title: page.data.title,
          description: page.data.description ?? null,
          url: `${SITE_URL}${page.url}`,
        }));

      return jsonRpcResult(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ results: matches }, null, 2),
          },
        ],
      });
    }

    if (name === 'get_doc') {
      const pathValue =
        'path' in argumentsObj && typeof argumentsObj.path === 'string'
          ? argumentsObj.path
          : '';

      if (!pathValue) {
        return jsonRpcError(id, -32602, 'path is required');
      }

      const normalized = normalizeDocPath(pathValue);
      const page = source.getPages().find((entry) => entry.url === normalized);
      if (!page) {
        return jsonRpcError(id, -32004, 'Document not found');
      }

      const markdown = await getLLMText(page);
      return jsonRpcResult(id, {
        content: [{ type: 'text', text: markdown }],
      });
    }

    return jsonRpcError(id, -32601, `Unknown tool: ${name || 'unknown'}`);
  }

  return jsonRpcError(id, -32601, `Method not found: ${body.method}`);
}
