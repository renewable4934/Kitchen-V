"use client"

import Image from "next/image"
import { useState } from "react"
import { Quote } from "lucide-react"

import type { CmsAsset, PortfolioContent } from "@/lib/site-content"

type PortfolioSectionProps = {
  content: PortfolioContent
  assets: Record<string, CmsAsset>
}

export function PortfolioSection({ content, assets }: PortfolioSectionProps) {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-card py-24" id="portfolio">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">{content.eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {content.items.map((item, index) => {
            const image = assets[item.imageKey]
            return (
              <button
                key={item.name}
                onClick={() => setActive(index)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  active === index ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`relative ${active === index ? "aspect-[4/3]" : "aspect-square"}`}>
                  <Image
                    src={image?.publicUrl || "/images/placeholder.jpg"}
                    alt={image?.alt || `Кухня для ${item.name}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/20 transition-opacity group-hover:bg-foreground/30" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-medium text-card">{`Для ${item.name}`}</p>
                    <p className="text-xs text-card/80">{item.style}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-background p-8">
          <div className="flex items-start gap-4">
            <Quote className="mt-1 h-8 w-8 shrink-0 text-primary/30" />
            <div>
              <p className="text-lg leading-relaxed text-foreground italic">{content.items[active].review}</p>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{`— ${content.items[active].name}, ${content.items[active].style}`}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
