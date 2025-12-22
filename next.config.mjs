import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is used by the Dockerfile. On Windows, Next may try to
  // create symlinks during `next build` which can fail without Developer Mode.
  output: process.platform === 'win32' ? undefined : 'standalone',

  // Prevent Turbopack from inferring the wrong workspace root when multiple
  // lockfiles exist elsewhere on disk.
  turbopack: {
    root: __dirname,
  },

  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  },
}

export default nextConfig
