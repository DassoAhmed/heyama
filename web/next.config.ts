/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Skip static generation for specific routes
  experimental: {
    appDir: true,
  },
  // This tells Next.js not to require generateStaticParams
  skipMiddlewareUrlNormalize: true,
}

module.exports = nextConfig