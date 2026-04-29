import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/r/:path*',
          destination: '/api/registry/:path*',
        },
        {
          source: '/docs',
          has: [
            { type: 'header', key: 'accept', value: '(.*)text/markdown(.*)' },
          ],
          destination: '/llms.mdx/docs',
        },
        {
          source: '/docs/:path*',
          has: [
            { type: 'header', key: 'accept', value: '(.*)text/markdown(.*)' },
          ],
          destination: '/llms.mdx/docs/:path*',
        },
      ],
      afterFiles: [
        {
          source: '/docs.md',
          destination: '/llms.mdx/docs',
        },
        {
          source: '/docs/:path*.mdx',
          destination: '/llms.mdx/docs/:path*',
        },
        {
          source: '/docs/:path*.md',
          destination: '/llms.mdx/docs/:path*',
        },
      ],
    };
  },
};

export default withMDX(config);
