import Image from "next/image"

import type { CmsAsset, LifestyleContent } from "@/lib/site-content"

type LifestyleSectionProps = {
  content: LifestyleContent
  assets: Record<string, CmsAsset>
}

export function LifestyleSection({ content, assets }: LifestyleSectionProps) {
  return (
    <section className="py-24" id="lifestyle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item) => {
            const image = assets[item.imageKey]
            return (
              <div key={item.title} className="group">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={image?.publicUrl || "/images/placeholder.jpg"}
                    alt={image?.alt || item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/20" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
