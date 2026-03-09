"use client"

import Image from "next/image"
import { useState } from "react"
import { Quote } from "lucide-react"

const kitchens = [
  {
    name: "Анна",
    image: "/images/kitchen-1.jpg",
    style: "Скандинавский минимализм",
    review:
      "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам.",
  },
  {
    name: "Михаил",
    image: "/images/kitchen-2.jpg",
    style: "Современная классика",
    review:
      "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество.",
  },
  {
    name: "Елена",
    image: "/images/kitchen-3.jpg",
    style: "Эко-стиль",
    review:
      "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома.",
  },
  {
    name: "Пётр",
    image: "/images/kitchen-4.jpg",
    style: "Премиум",
    review:
      "Качество материалов и сборки на высшем уровне. Кухня работает как швейцарские часы. Спасибо команде Пегас!",
  },
]

export function PortfolioSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-card py-24" id="portfolio">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Портфолио
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            Выполненные проекты
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Каждая кухня — индивидуальная история, созданная с вниманием к деталям и любовью к своему делу.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {kitchens.map((kitchen, i) => (
            <button
              key={kitchen.name}
              onClick={() => setActive(i)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                active === i ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`relative ${active === i ? "aspect-[4/3]" : "aspect-square"}`}>
                <Image
                  src={kitchen.image}
                  alt={`Кухня для ${kitchen.name}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/20 transition-opacity group-hover:bg-foreground/30" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium text-card">
                    {"Для " + kitchen.name}
                  </p>
                  <p className="text-xs text-card/80">{kitchen.style}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-background p-8">
          <div className="flex items-start gap-4">
            <Quote className="mt-1 h-8 w-8 shrink-0 text-primary/30" />
            <div>
              <p className="text-lg leading-relaxed text-foreground italic">
                {kitchens[active].review}
              </p>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {"— " + kitchens[active].name + ", " + kitchens[active].style}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
