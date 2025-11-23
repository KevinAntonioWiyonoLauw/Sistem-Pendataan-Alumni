/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  },
}

export default nextConfig
