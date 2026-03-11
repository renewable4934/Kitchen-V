import type { Metadata } from "next"
import { Inter, Marck_Script, Playfair_Display } from "next/font/google"

import { loadSiteContent } from "@/lib/cms"

import "./globals.css"

const _inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })
const _playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" })
const _marck = Marck_Script({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-marck",
})

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
      <body className={`${_inter.variable} ${_playfair.variable} ${_marck.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
