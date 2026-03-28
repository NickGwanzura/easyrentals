/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone for Docker deployment
  output: 'standalone',
  
  // Disable TypeScript errors during build (for demo deployment)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Enforce ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Build optimization
  productionBrowserSourceMaps: false,
  
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
        source: '/landing',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/login',
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
  
  // Trailing slashes
  trailingSlash: false,
  
  // Powered by header
  poweredByHeader: false,
  
  // Compress
  compress: true,
  
  // React strict mode
  reactStrictMode: true,
  
  // Speed up build - skip static generation for problematic pages
  staticPageGenerationTimeout: 60,
  
  // Experimental features
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ['@carbon/react', '@carbon/icons-react'],
  },
};

module.exports = nextConfig;
