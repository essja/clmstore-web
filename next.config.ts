import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.clmstore.sl' },
      { protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
    ],
  },
};

export default nextConfig;
