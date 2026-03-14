import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { loadSiteContent } from "@/lib/cms"

import "./globals.css"

const siteUrl = "https://zakazpegas.ru"

const _inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })
const _playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" })

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadSiteContent()

  return {
    metadataBase: new URL(siteUrl),
    title: content.page.title,
    description: content.page.description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      title: content.page.title,
      description: content.page.description,
      siteName: content.site.brandName,
      locale: "ru_RU",
      images: [
        {
          url: "/images/hero-kitchen.jpg",
          width: 1600,
          height: 1067,
          alt: "Современная кухня от Пегас",
        },
      ],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload"
          href="/fonts/cormorant-garamond-italic-400-cyrillic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cormorant-garamond-italic-400-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${_inter.variable} ${_playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
