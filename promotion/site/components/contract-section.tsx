import { Banknote, Clock, Shield, Wrench } from "lucide-react"

import type { ContractContent } from "@/lib/site-content"

const icons = {
  clock: Clock,
  shield: Shield,
  wrench: Wrench,
  banknote: Banknote,
}

type ContractSectionProps = {
  content: ContractContent
}

export function ContractSection({ content }: ContractSectionProps) {
  const cards = Array.isArray(content.cards) ? content.cards : []

  return (
    <section className="relative overflow-hidden bg-background py-16 lg:min-h-screen lg:py-12" id="contract">
      <div className="mx-auto flex max-w-7xl flex-col justify-center gap-8 px-6 lg:min-h-screen lg:gap-10">
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:gap-6">
          {cards.map((card) => {
            const Icon = icons[card.icon] || Wrench
            return (
              <article
                key={card.title}
                className="group flex h-full gap-4 rounded-[1.75rem] border border-border/80 bg-card px-5 py-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg sm:px-6 sm:py-6 lg:min-h-[15.5rem] lg:gap-5 lg:px-7 lg:py-6"
              >
                <div className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-[1.3rem] border border-border/70 bg-background shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]">
                  <Icon className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-pretty text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2rem] lg:text-[2.05rem] lg:leading-[1.05]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-pretty font-serif text-[2rem] font-bold leading-[0.95] text-primary sm:text-[2.3rem] lg:mt-4 lg:text-[2.7rem]">
                    {card.highlight}
                  </p>
                  <p className="mt-3 max-w-[28ch] text-[0.98rem] leading-relaxed text-muted-foreground sm:text-base lg:mt-4 lg:max-w-[30ch]">
                    {card.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
