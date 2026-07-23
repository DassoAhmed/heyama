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
}

module.exports = nextConfig