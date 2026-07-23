/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'amzn-heyama-s3-bucket.s3.amazonaws.com',
      'amzn-heyama-s3-bucket.s3.us-east-1.amazonaws.com'
    ],
  },
  // Add mobile optimization
  swcMinify: true,
  compress: true,
  // Ensure responsive viewport
  reactStrictMode: true,
  // Optimize for mobile
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Add proper viewport meta tag
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Viewport',
            value: 'width=device-width, initial-scale=1.0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;