import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.20.23', '192.168.20.246'],
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
