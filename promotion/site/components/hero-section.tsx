import Image from "next/image"

import type { CmsAsset, HeroContent } from "@/lib/site-content"

type HeroSectionProps = {
  content: HeroContent
  assets: Record<string, CmsAsset>
}

export function HeroSection({ content, assets }: HeroSectionProps) {
  const heroImage = assets[content.imageKey]
  const titleSeparatorIndex = content.title.indexOf("\n")
  const primaryTitle =
    titleSeparatorIndex === -1 ? content.title : content.title.slice(0, titleSeparatorIndex)
  const secondaryTitle =
    titleSeparatorIndex === -1 ? "" : content.title.slice(titleSeparatorIndex + 1)
  const hasSplitTitle = titleSeparatorIndex !== -1 && secondaryTitle.length > 0

  return (
    <section className="relative flex min-h-screen items-start pt-20 lg:pt-24" id="hero">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-8 sm:py-10 lg:py-4 xl:py-6">
        <div className="hero-stack">
          {hasSplitTitle ? (
            <div className="hero-heading-group">
              <h1 className="hero-headline hero-headline-primary">{primaryTitle}</h1>
              <p className="hero-headline hero-headline-secondary">{secondaryTitle}</p>
              <div className="hero-cta-row">
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
          ) : (
            <div className="hero-heading-group">
              <h1 className="hero-headline hero-headline-primary">{content.title}</h1>
              <div className="hero-cta-row">
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
          )}

          <div className="hero-media-shell">
            <div className="hero-media">
              <Image
                src={heroImage?.publicUrl || "/images/hero-kitchen.jpg"}
                alt={heroImage?.alt || "Современная кухня от Пегас"}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {content.tagline ? (
          <p className="hero-tagline-quote">{content.tagline}</p>
        ) : null}
      </div>
    </section>
  )
}
