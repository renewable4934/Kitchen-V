"use client"

import Image from "next/image"
import { useState } from "react"
import { PlayCircle, Quote, X } from "lucide-react"

import type { CmsAsset, PortfolioContent } from "@/lib/site-content"

type PortfolioSectionProps = {
  content: PortfolioContent
  assets: Record<string, CmsAsset>
}

export function PortfolioSection({ content, assets }: PortfolioSectionProps) {
  const [active, setActive] = useState(0)
  const [openedIndex, setOpenedIndex] = useState<number | null>(null)
  const openedItem = openedIndex === null ? null : content.items[openedIndex]

  return (
    <section className="bg-card py-24" id="portfolio">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
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
                onClick={() => {
                  setActive(index)
                  setOpenedIndex(index)
                }}
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
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">{`— ${content.items[active].name}, ${content.items[active].style}`}</p>
                <button
                  onClick={() => setOpenedIndex(active)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Открыть проект
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openedItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4 py-8">
          <div className="relative max-h-full w-full max-w-6xl overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setOpenedIndex(null)}
              className="absolute right-4 top-4 rounded-full border border-border bg-card p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Закрыть проект"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-12">
              <h3 className="font-serif text-3xl font-bold text-foreground">{openedItem.style}</h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{`Проект для ${openedItem.name}`}</p>
            </div>

            <div className="mt-8">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">Фотографии кухни</p>
              <div className="grid gap-4 md:grid-cols-3">
                {openedItem.galleryImageKeys.map((imageKey, index) => {
                  const image = assets[imageKey]
                  return (
                    <div key={`${openedItem.slug}-${imageKey}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <Image
                        src={image?.publicUrl || "/placeholder.jpg"}
                        alt={image?.alt || openedItem.style}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Видеоотзыв клиента
                </p>
                {openedItem.videoReviewUrl ? (
                  <div className="overflow-hidden rounded-xl">
                    <iframe
                      src={openedItem.videoReviewUrl}
                      title={`Видеоотзыв ${openedItem.name}`}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={assets[openedItem.videoReviewPosterKey]?.publicUrl || "/placeholder.jpg"}
                      alt={assets[openedItem.videoReviewPosterKey]?.alt || openedItem.style}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="h-14 w-14 text-card" />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Текстовый отзыв клиента
                </p>
                <p className="text-lg leading-relaxed text-foreground italic">{openedItem.review}</p>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{`— ${openedItem.name}, ${openedItem.style}`}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
