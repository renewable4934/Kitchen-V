import Image from "next/image"

import type { CmsAsset, HeroContent } from "@/lib/site-content"

type HeroSectionProps = {
  content: HeroContent
  assets: Record<string, CmsAsset>
}

export function HeroSection({ content, assets }: HeroSectionProps) {
  const heroImage = assets[content.imageKey]

  return (
    <section className="relative min-h-screen flex items-center pt-20" id="hero">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:gap-16">
        <div className="flex max-w-xl flex-1 flex-col items-start gap-6">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">{content.eyebrow}</p>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl xl:text-7xl text-balance">
            {content.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground lg:text-xl">{content.description}</p>
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
          <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-lg border border-border">
            <p className="text-sm font-medium text-muted-foreground">{content.statLabel}</p>
            <p className="font-serif text-2xl font-bold text-foreground">{content.statValue}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
