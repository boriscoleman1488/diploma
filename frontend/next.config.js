/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC and use Babel instead for WebContainer compatibility
  swcMinify: false,
  compiler: {
    // Remove SWC compiler options to force fallback to Babel
  },
  images: {
    domains: ['localhost', 'api.pexels.com', 'images.pexels.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Disable webpack cache to avoid potential issues
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in development
    if (dev) {
      config.cache = false
    }
    return config
  },
  // Experimental features that might help with compatibility
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig