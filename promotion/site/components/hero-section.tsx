import Image from "next/image"
import { Cormorant_Garamond } from "next/font/google"

import type { CmsAsset, HeroContent } from "@/lib/site-content"

const accentFont = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
})

type HeroSectionProps = {
  content: HeroContent
  assets: Record<string, CmsAsset>
}

export function HeroSection({ content, assets }: HeroSectionProps) {
  const heroImage = assets[content.imageKey]
  const titleLines = content.title.split(". ").filter(Boolean)

  return (
    <section className="relative flex min-h-screen items-center pt-20" id="hero">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-20 lg:gap-16">
        <div className="flex w-full flex-col items-center gap-12 lg:flex-row">
          <div className="flex max-w-xl flex-1 flex-col items-start gap-6">
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl xl:text-7xl text-balance">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line.endsWith(".") ? line : `${line}.`}
              </span>
            ))}
          </h1>
          {content.description ? (
            <p className="text-lg leading-relaxed text-muted-foreground lg:text-xl">{content.description}</p>
          ) : null}
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={content.primaryCta.href}
              className="rounded-lg bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {content.primaryCta.label}
            </a>
            <a
              href={content.secondaryCta.href}
              className="rounded-lg border border-border bg-card px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {content.secondaryCta.label}
            </a>
          </div>
          </div>

          <div className="relative flex-1">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={heroImage?.publicUrl || "/images/hero-kitchen.jpg"}
                alt={heroImage?.alt || "Современная кухня от Пегас"}
                width={800}
                height={600}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <p
          className={`${accentFont.className} mx-auto max-w-4xl text-center text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl`}
        >
          {content.signature}
        </p>
      </div>
    </section>
  )
}
