/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true // Temporairement ignorer les erreurs TypeScript pendant le développement
  },
  eslint: {
    ignoreDuringBuilds: true // Temporairement ignorer les erreurs ESLint pendant le développement
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*'
      }
    ]
  }
}

module.exports = nextConfig
