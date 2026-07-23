/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'amzn-heyama-s3-bucket.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'amzn-heyama-s3-bucket.s3.us-east-1.amazonaws.com',
      },
    ],
  },
  compress: true,
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
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
    ]
  },
}

module.exports = nextConfig