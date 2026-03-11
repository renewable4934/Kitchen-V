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
  return (
    <section className="py-24" id="contract">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.cards.map((card) => {
            const Icon = icons[card.icon]
            return (
              <div
                key={card.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mb-2 font-serif text-2xl font-bold text-primary">{card.highlight}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.title}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
