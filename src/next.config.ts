import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Custom Next.js configuration options:
  reactStrictMode: true,
  swcMinify: true,
  // Customize webpack configuration:
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tldraw/utils': require.resolve('@tldraw/utils'),
      '@tldraw/state': require.resolve('@tldraw/state'),
      '@tldraw/state-react': require.resolve('@tldraw/state-react'),
      '@tldraw/store': require.resolve('@tldraw/store'),
      '@tldraw/validate': require.resolve('@tldraw/validate'),
      '@tldraw/tlschema': require.resolve('@tldraw/tlschema'),
      '@tldraw/editor': require.resolve('@tldraw/editor'),
      'tldraw': require.resolve('tldraw'),
    };
    return config;
  },
};

export default nextConfig;
