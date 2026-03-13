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
    <section className="relative flex min-h-screen items-center pt-20 lg:pt-24" id="hero">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-10 sm:py-12 lg:py-6 xl:py-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-14">
          <div className="flex max-w-xl flex-1 flex-col items-start">
            {hasSplitTitle ? (
              <div className="flex flex-col items-start gap-6 lg:gap-8">
                <h1 className="font-serif text-[clamp(3.25rem,4.4vw,5.2rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                  {primaryTitle}
                </h1>
                <p className="font-serif text-[clamp(3.25rem,4.4vw,5.2rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                  {secondaryTitle}
                </p>
                <div className="flex flex-col gap-4 pt-0.5 sm:flex-row">
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
              <h1 className="whitespace-pre-line font-serif text-[clamp(3.25rem,4.4vw,5.2rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                {content.title}
              </h1>
            )}
            {!hasSplitTitle ? (
              <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row lg:mt-8">
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
            ) : null}
          </div>

          <div className="relative flex-1 self-stretch">
            <div className="relative h-full overflow-hidden rounded-2xl">
              <Image
                src={heroImage?.publicUrl || "/images/hero-kitchen.jpg"}
                alt={heroImage?.alt || "Современная кухня от Пегас"}
                width={800}
                height={600}
                className="h-full min-h-[18rem] w-full object-cover lg:min-h-[28rem] xl:min-h-[31rem]"
                priority
              />
            </div>
          </div>
        </div>

        {content.tagline ? (
          <p className="hero-tagline-quote mx-auto mt-8 w-full max-w-[24ch] px-2 text-center text-foreground sm:mt-10 md:px-4 lg:mt-8 xl:mt-10">
            {content.tagline}
          </p>
        ) : null}
      </div>
    </section>
  )
}
