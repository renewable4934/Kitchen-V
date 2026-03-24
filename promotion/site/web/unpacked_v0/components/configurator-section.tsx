"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"

const steps = [
  {
    id: "style",
    title: "Атмосфера",
    description: "Выберите стиль кухни",
    options: [
      { value: "modern", label: "Современный" },
      { value: "classic", label: "Классический" },
      { value: "scandinavian", label: "Скандинавский" },
      { value: "minimalist", label: "Минимализм" },
      { value: "loft", label: "Лофт" },
      { value: "eco", label: "Эко" },
    ],
  },
  {
    id: "shape",
    title: "Форма кухни",
    description: "Выберите конфигурацию",
    options: [
      { value: "straight", label: "Прямая" },
      { value: "l-shaped", label: "Угловая" },
      { value: "u-shaped", label: "П-образная" },
    ],
  },
  {
    id: "base-cabinets",
    title: "Напольные шкафы",
    description: "Тип нижних модулей",
    options: [
      { value: "standard", label: "Стандартные" },
      { value: "handleless", label: "Без ручек" },
    ],
  },
  {
    id: "wall-cabinets",
    title: "Навесные шкафы",
    description: "Тип верхних модулей",
    options: [
      { value: "standard", label: "Стандартные" },
      { value: "handleless", label: "Без ручек" },
    ],
  },
  {
    id: "oven",
    title: "Духовка",
    description: "Расположение духового шкафа",
    options: [
      { value: "base", label: "В нижнем шкафу" },
      { value: "tall", label: "В высоком шкафу" },
      { value: "pencil", label: "В пенале" },
    ],
  },
  {
    id: "fridge",
    title: "Холодильник",
    description: "Расположение холодильника",
    options: [
      { value: "builtin", label: "Встроен в шкаф" },
      { value: "standalone", label: "Отдельно стоящий" },
      { value: "side-by-side", label: "Side-by-Side" },
      { value: "external", label: "Вне гарнитура" },
    ],
  },
  {
    id: "sink",
    title: "Мойка и ПМ",
    description: "Мойка и посудомоечная машина",
    options: [
      { value: "sink-only", label: "Только мойка" },
      { value: "sink-pm45", label: "Мойка + ПМ 45" },
      { value: "sink-pm60", label: "Мойка + ПМ 60" },
    ],
  },
  {
    id: "cooktop",
    title: "Печь",
    description: "Тип варочной поверхности",
    options: [
      { value: "electric", label: "Электрическая" },
      { value: "induction", label: "Индукционная" },
      { value: "gas", label: "Газовая" },
    ],
  },
  {
    id: "hood",
    title: "Вытяжка",
    description: "Тип вытяжки",
    options: [
      { value: "builtin", label: "Встроенная" },
      { value: "dome", label: "Купольная" },
      { value: "angled", label: "Наклонная" },
    ],
  },
]

const discountOptions = [
  { value: "video-review", label: "Оставить видеоотзыв", discount: "5%" },
  { value: "standard-project", label: "Типовой проект", discount: "7%" },
  { value: "stock-parts", label: "Детали со склада", discount: "10%" },
]

export function ConfiguratorSection() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    comment: "",
    messenger: false,
    consent: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const totalSteps = steps.length + 2 // +1 for discounts, +1 for contact form
  const isDiscountStep = currentStep === steps.length
  const isContactStep = currentStep === steps.length + 1
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleSelect = (stepId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: value }))
  }

  const toggleDiscount = (value: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value]
    )
  }

  const canProceed = () => {
    if (isContactStep) {
      return contactInfo.name && contactInfo.phone && contactInfo.consent
    }
    if (isDiscountStep) return true
    return !!selections[steps[currentStep]?.id]
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <section className="bg-card py-24" id="configurator">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-foreground">
            Заявка отправлена!
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Мы свяжемся с вами в ближайшее время для обсуждения вашего проекта.
            Бесплатный 3D-проект уже в работе.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-card py-24" id="configurator">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            3D проект для вас
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            Создайте свою кухню
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ответьте на несколько вопросов, и мы бесплатно подготовим 3D-проект
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {"Шаг " + (currentStep + 1) + " из " + totalSteps}
            </span>
            <span>{Math.round(progress) + "%"}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-8">
          {!isDiscountStep && !isContactStep && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">
                {steps[currentStep].title}
              </h3>
              <p className="mt-1 text-muted-foreground">
                {steps[currentStep].description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {steps[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(steps[currentStep].id, option.value)}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      selections[steps[currentStep].id] === option.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span
                      className={`text-base font-medium ${
                        selections[steps[currentStep].id] === option.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isDiscountStep && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Соберите скидку
              </h3>
              <p className="mt-1 text-muted-foreground">
                Выберите подходящие варианты для дополнительной скидки
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {discountOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleDiscount(option.value)}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${
                      selectedDiscounts.includes(option.value)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-base font-medium text-foreground">
                      {option.label}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        selectedDiscounts.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {"-" + option.discount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isContactStep && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Бесплатный 3D-проект
              </h3>
              <p className="mt-1 text-muted-foreground">
                Оставьте контакты, и мы подготовим дизайн-проект для вас
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                    Имя
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo((p) => ({ ...p, name: e.target.value }))}
                    placeholder="ваше имя"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
                    Телефон
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+7 (999) 999-99-99"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="mb-1 block text-sm font-medium text-foreground">
                    Комментарий
                  </label>
                  <textarea
                    id="comment"
                    value={contactInfo.comment}
                    onChange={(e) => setContactInfo((p) => ({ ...p, comment: e.target.value }))}
                    placeholder="Опишите пожелания к проекту"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactInfo.messenger}
                    onChange={(e) => setContactInfo((p) => ({ ...p, messenger: e.target.checked }))}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Связаться через мессенджер
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactInfo.consent}
                    onChange={(e) => setContactInfo((p) => ({ ...p, consent: e.target.checked }))}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Согласие на обработку персональных данных
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </button>

            {isContactStep ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить заявку"
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1))}
                disabled={!canProceed()}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Далее
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
