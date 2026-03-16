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
      <div className="mx-auto flex max-w-7xl flex-col justify-center gap-10 px-6 lg:min-h-screen lg:gap-12">
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = icons[card.icon] || Wrench
            return (
              <div key={card.title} className="flex flex-col gap-4">
                <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-[1.7rem] text-balance">
                  {card.title}
                </h3>
                <div className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-serif text-2xl font-bold text-primary">{card.highlight}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
