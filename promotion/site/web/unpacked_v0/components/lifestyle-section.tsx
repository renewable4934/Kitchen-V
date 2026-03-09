import Image from "next/image"

const lifestyleItems = [
  {
    image: "/images/lifestyle-coffee.jpg",
    title: "Утренний кофе",
    description: "Начните день с идеальной чашки в пространстве, созданном для вдохновения",
  },
  {
    image: "/images/lifestyle-cooking.jpg",
    title: "Совместная готовка",
    description: "Кухня как место встреч — где рождаются вкусы и укрепляются отношения",
  },
  {
    image: "/images/lifestyle-family.jpg",
    title: "Семейный очаг",
    description: "Пространство, где каждый член семьи чувствует тепло и уют",
  },
  {
    image: "/images/lifestyle-creative.jpg",
    title: "Творчество",
    description: "Ваша кухня — лаборатория для кулинарных экспериментов и новых идей",
  },
]

export function LifestyleSection() {
  return (
    <section className="py-24" id="lifestyle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Кухня и человек
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            Больше, чем мебель
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Кухня — это место, где начинается и заканчивается каждый день. 
            Пространство для жизни, творчества и любви.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {lifestyleItems.map((item) => (
            <div key={item.title} className="group">
              <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/20" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
