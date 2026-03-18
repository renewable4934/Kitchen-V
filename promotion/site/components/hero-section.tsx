import Image from "next/image"

import type { CmsAsset, HeroContent } from "@/lib/site-content"

type HeroSectionProps = {
  content: HeroContent
  assets: Record<string, CmsAsset>
  offerVariant: string | null
  experimentKey: string | null
}

export function HeroSection({ content, assets, offerVariant, experimentKey }: HeroSectionProps) {
  const heroImage = assets[content.imageKey]
  const titleSeparatorIndex = content.title.indexOf("\n")
  const primaryTitle =
    titleSeparatorIndex === -1 ? content.title : content.title.slice(0, titleSeparatorIndex)
  const secondaryTitle =
    titleSeparatorIndex === -1 ? "" : content.title.slice(titleSeparatorIndex + 1)
  const hasSplitTitle = titleSeparatorIndex !== -1 && secondaryTitle.length > 0

  return (
    <section className="hero-section-shell" id="hero">
      <div className="hero-section-inner">
        <div className="hero-stack">
          <div className="hero-layout">
            {hasSplitTitle ? (
              <div className="hero-heading-group">
                <div className="hero-title-stack">
                  <h1 className="hero-headline-card">
                    <span className="hero-headline hero-headline-primary">{primaryTitle}</span>
                  </h1>
                  <p className="hero-headline-card hero-headline-card-secondary">
                    <span className="hero-headline hero-headline-secondary">{secondaryTitle}</span>
                  </p>
                </div>
                <div className="hero-cta-row">
                  <a
                    href={content.primaryCta.href}
                    data-analytics-event="cta_click"
                    data-analytics-button-name={content.primaryCta.label}
                    data-analytics-section-name="hero"
                    data-analytics-destination={content.primaryCta.href}
                    data-analytics-funnel-type="kitchen"
                    data-analytics-offer-variant={offerVariant || ""}
                    data-analytics-experiment-key={experimentKey || ""}
                    className="hero-cta hero-cta-primary"
                  >
                    {content.primaryCta.label}
                  </a>
                  <a
                    href={content.secondaryCta.href}
                    data-analytics-event="cta_click"
                    data-analytics-button-name={content.secondaryCta.label}
                    data-analytics-section-name="hero"
                    data-analytics-destination={content.secondaryCta.href}
                    data-analytics-funnel-type="kitchen"
                    data-analytics-offer-variant={offerVariant || ""}
                    data-analytics-experiment-key={experimentKey || ""}
                    className="hero-cta hero-cta-secondary"
                  >
                    {content.secondaryCta.label}
                  </a>
                </div>
              </div>
            ) : (
              <div className="hero-heading-group">
                <div className="hero-title-stack">
                  <h1 className="hero-headline-card">
                    <span className="hero-headline hero-headline-primary">{content.title}</span>
                  </h1>
                </div>
                <div className="hero-cta-row">
                  <a
                    href={content.primaryCta.href}
                    data-analytics-event="cta_click"
                    data-analytics-button-name={content.primaryCta.label}
                    data-analytics-section-name="hero"
                    data-analytics-destination={content.primaryCta.href}
                    data-analytics-funnel-type="kitchen"
                    data-analytics-offer-variant={offerVariant || ""}
                    data-analytics-experiment-key={experimentKey || ""}
                    className="hero-cta hero-cta-primary"
                  >
                    {content.primaryCta.label}
                  </a>
                  <a
                    href={content.secondaryCta.href}
                    data-analytics-event="cta_click"
                    data-analytics-button-name={content.secondaryCta.label}
                    data-analytics-section-name="hero"
                    data-analytics-destination={content.secondaryCta.href}
                    data-analytics-funnel-type="kitchen"
                    data-analytics-offer-variant={offerVariant || ""}
                    data-analytics-experiment-key={experimentKey || ""}
                    className="hero-cta hero-cta-secondary"
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
        </div>

        {content.tagline ? (
          <p className="hero-tagline-quote">{content.tagline}</p>
        ) : null}
      </div>
    </section>
  )
}
