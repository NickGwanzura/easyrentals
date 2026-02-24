/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
