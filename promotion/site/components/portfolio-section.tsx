"use client"

import Image from "next/image"
import { useState } from "react"
import { Quote } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CmsAsset, PortfolioContent } from "@/lib/site-content"

type PortfolioSectionProps = {
  content: PortfolioContent
  assets: Record<string, CmsAsset>
}

function resolveImageSrc(imageKey: string, assets: Record<string, CmsAsset>) {
  if (imageKey.startsWith("/")) {
    return imageKey
  }

  return assets[imageKey]?.publicUrl || "/images/placeholder.jpg"
}

export function PortfolioSection({ content, assets }: PortfolioSectionProps) {
  const [active, setActive] = useState(0)
  const activeItem = content.items[active] || content.items[0]

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
              <Dialog key={item.slug || item.imageKey || item.name}>
                <DialogTrigger asChild>
                  <button
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
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0" showCloseButton={false}>
                  <div className="p-6">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="font-serif text-3xl">{item.name}</DialogTitle>
                      <DialogDescription className="text-base">{item.style}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 md:grid-cols-3">
                      {(item.galleryImageKeys?.length ? item.galleryImageKeys : [item.imageKey]).map(
                        (galleryImage, galleryIndex) => (
                        <div key={`${item.slug}-${galleryIndex}`} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                          <Image src={resolveImageSrc(galleryImage, assets)} alt="" fill className="object-cover" />
                        </div>
                        ),
                      )}
                    </div>

                    <div className="mt-8 rounded-xl border border-border bg-card p-6">
                      <div className="flex items-start gap-4">
                        <Quote className="mt-1 h-8 w-8 shrink-0 text-primary/30" />
                        <div>
                          <p className="text-lg leading-relaxed text-foreground italic">{item.review}</p>
                          <p className="mt-4 text-sm font-medium text-muted-foreground">{`— ${item.name}, ${item.style}`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-background p-8">
          <div className="flex items-start gap-4">
            <Quote className="mt-1 h-8 w-8 shrink-0 text-primary/30" />
            <div>
              <p className="text-lg leading-relaxed text-foreground italic">{activeItem?.review}</p>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{`— ${activeItem?.name}, ${activeItem?.style}`}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
