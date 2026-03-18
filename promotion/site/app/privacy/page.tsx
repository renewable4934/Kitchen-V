import type { Metadata } from "next"

import { loadSiteContent } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Пегас",
  description: "Политика обработки персональных данных сайта Пегас.",
  alternates: {
    canonical: "/privacy",
  },
}

export default async function PrivacyPage() {
  const content = await loadSiteContent()
  const phoneHref = `tel:${content.site.contactPhone.replace(/[^\d+]/g, "")}`

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">Политика конфиденциальности</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Мы собираем имя, номер телефона, технические данные посещения (UTM, client_id, URL) только для обработки
          заявки и связи с клиентом.
        </p>

        <div className="mt-10 grid gap-4">
          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">1. Состав данных</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Имя, телефон, город, ответы квиза, UTM-метки, дата и время отправки.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">2. Цель обработки</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Расчет стоимости, обратный звонок, ведение сделки в CRM и улучшение маркетинга.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">3. Срок хранения</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Данные хранятся до достижения цели обработки или отзыва согласия.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">4. Контакты для запроса</h2>
            <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
              <p>{content.site.footerCopyrightOwner}</p>
              <a
                className="transition-colors hover:text-foreground"
                href={phoneHref}
                data-analytics-event="phone_click"
                data-analytics-button-name="phone_primary"
                data-analytics-section-name="privacy"
                data-analytics-funnel-type="kitchen"
              >
                {content.site.contactPhone}
              </a>
              <a className="transition-colors hover:text-foreground" href={`mailto:${content.site.email}`}>
                {content.site.email}
              </a>
              <p>{content.site.address}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
