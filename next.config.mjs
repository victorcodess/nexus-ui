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
      ],
      afterFiles: [
        {
          source: '/docs/:path*.mdx',
          destination: '/llms.mdx/docs/:path*',
        },
        {
          source: '/docs/:path*.md',
          destination: '/raw/docs/:path*',
        },
      ],
    };
  },
};

export default withMDX(config);
