import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://zakazpegas.ru/",
      lastModified: "2026-03-14",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://zakazpegas.ru/privacy",
      lastModified: "2026-03-14",
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]
}
