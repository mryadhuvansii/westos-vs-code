/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'cdn.westos.com', 'assets.westos.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Add path aliases for @/ imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@westos/shared': require('path').resolve(__dirname, '../../packages/shared/src'),
      '@westos/ui': require('path').resolve(__dirname, '../../packages/ui/src'),
      '@westos/config': require('path').resolve(__dirname, '../../packages/config/src'),
    };
    return config;
  },
};

module.exports = nextConfig;