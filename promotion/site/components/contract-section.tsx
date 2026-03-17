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
    <section className="relative overflow-hidden bg-background py-14 lg:min-h-screen lg:py-10" id="contract">
      <div className="mx-auto flex max-w-7xl flex-col justify-center gap-7 px-6 lg:min-h-screen lg:gap-8">
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:gap-7">
          {cards.map((card) => {
            const Icon = icons[card.icon] || Wrench
            return (
              <article
                key={card.title}
                className="group flex h-full gap-4 rounded-[1.6rem] border border-border/80 bg-card px-4 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg sm:px-5 sm:py-5 lg:min-h-[14.25rem] lg:gap-4 lg:px-6 lg:py-5"
              >
                <div className="flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-[1.15rem] border border-border/70 bg-background shadow-sm sm:h-[4rem] sm:w-[4rem]">
                  <Icon className="h-6 w-6 text-primary sm:h-[1.65rem] sm:w-[1.65rem]" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-pretty text-[1.65rem] font-semibold tracking-tight text-foreground sm:text-[1.8rem] lg:text-[1.85rem] lg:leading-[1.08]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-pretty font-serif text-[1.85rem] font-bold leading-[0.98] text-primary sm:text-[2.05rem] lg:mt-3.5 lg:text-[2.35rem]">
                    {card.highlight}
                  </p>
                  <p className="mt-3 max-w-[30ch] text-[0.94rem] leading-[1.58] text-muted-foreground sm:text-[0.98rem] lg:mt-3.5 lg:max-w-[32ch]">
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
