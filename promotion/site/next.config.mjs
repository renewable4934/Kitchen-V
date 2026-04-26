const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://mc.yandex.ru https://mc.yandex.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://mc.yandex.ru https://mc.yandex.com",
      "font-src 'self' data:",
      "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com wss://mc.yandex.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://*.supabase.co",
    ].join("; "),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
]

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
