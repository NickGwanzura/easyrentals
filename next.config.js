/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript errors during build (for demo deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image configuration
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ],
    unoptimized: true, // Required for static export
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/landing',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Output configuration
  output: 'standalone', // Optimized for Vercel deployment
  
  // Trailing slashes
  trailingSlash: false,
  
  // Powered by header
  poweredByHeader: false,
  
  // Compress
  compress: true,
  
  // React strict mode
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    // Remove appDir as it's now default in Next.js 14
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
