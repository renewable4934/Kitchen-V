import { Clock, Shield, Wrench, Banknote } from "lucide-react"

const benefits = [
  {
    icon: Clock,
    title: "Начать готовить — быстрее",
    description: "Уже через 14 дней кухня может быть вашей. Быстрое производство без потери качества.",
    highlight: "14 дней",
  },
  {
    icon: Shield,
    title: "Оставаться спокойным — дольше",
    description: "Полная гарантия 5 лет на все материалы и работу. Мы уверены в каждом изделии.",
    highlight: "5 лет гарантии",
  },
  {
    icon: Wrench,
    title: "Укомплектовка техникой",
    description: "Подберём и установим всю встраиваемую бытовую технику. Всё в одном месте.",
    highlight: "Под ключ",
  },
  {
    icon: Banknote,
    title: "Покупать — выгодно",
    description: "Прозрачное ценообразование без скрытых платежей. Погонный метр от 70 000 руб.",
    highlight: "от 70 000 ₽/м",
  },
]

export function ContractSection() {
  return (
    <section className="py-24" id="contract">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Контракт
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            Прозрачные условия
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Мы делаем процесс покупки кухни простым и предсказуемым — от первого звонка до установки.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-2 font-serif text-2xl font-bold text-primary">
                {benefit.highlight}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
