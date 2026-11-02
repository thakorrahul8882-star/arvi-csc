
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  output: 'export',
  trailingSlash: true,

  basePath: '/arvi-csc',

  images: {
    unoptimized: true,
  },

  transpilePackages: ['motion'],
};

export default nextConfig;
