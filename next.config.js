/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  transpilePackages: ['@uiw/react-codemirror', '@codemirror/state', '@marijn/find-cluster-break'],
  async redirects() {
    return [
      {
        source: '/Citywalk',
        destination: '/cai_photos',
        permanent: true,
      },
      {
        source: '/photos',
        destination: '/cai_damn',
        permanent: true,
      },
      {
        source: '/Belike',
        destination: '/cai_about',
        permanent: true,
      },
      {
        source: '/run_archive',
        destination: '/cai_run_archive',
        permanent: true,
      },
      {
        source: '/coach',
        destination: '/cai_coach',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
