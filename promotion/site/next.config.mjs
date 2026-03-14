/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/kuhni-rostov", destination: "/", permanent: false },
      { source: "/shkafy-rostov", destination: "/", permanent: false },
      { source: "/portfolio", destination: "/", permanent: false },
      { source: "/reviews", destination: "/", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/contacts", destination: "/", permanent: false },
    ]
  },
}

export default nextConfig
