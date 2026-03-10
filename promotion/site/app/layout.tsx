import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { loadSiteContent } from "@/lib/cms"

import "./globals.css"

const _inter = Inter({ subsets: ["latin", "cyrillic"] })
const _playfair = Playfair_Display({ subsets: ["latin", "cyrillic"] })

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadSiteContent()

  return {
    title: content.page.title,
    description: content.page.description,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
