"use client"

import Image from "next/image"
import { useState } from "react"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import type { CmsAsset, ConfiguratorContent } from "@/lib/site-content"
import { getTrackingContext, trackSiteEvent } from "@/lib/tracking"

type ConfiguratorSectionProps = {
  content: ConfiguratorContent
  assets: Record<string, CmsAsset>
  offerVariant: string | null
  experimentKey: string | null
}

export function ConfiguratorSection({
  content,
  assets,
  offerVariant,
  experimentKey,
}: ConfiguratorSectionProps) {
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

  const totalSteps = content.steps.length + 2
  const isDiscountStep = currentStep === content.steps.length
  const isContactStep = currentStep === content.steps.length + 1
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleSelect = (stepId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: value }))
  }

  const handleInput = (stepId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: value }))
  }

  const toggleDiscount = (value: string) => {
    setSelectedDiscounts((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const getDiscountSummary = () => {
    return selectedDiscounts.reduce(
      (summary, selectedValue) => {
        const option = content.discountOptions.find((item) => item.value === selectedValue)
        if (!option) {
          return summary
        }

        if (option.discountType === "percent") {
          summary.percent += option.discountValue
        } else {
          summary.fixed += option.discountValue
        }

        return summary
      },
      { percent: 0, fixed: 0 },
    )
  }

  const canProceed = () => {
    if (isContactStep) {
      return Boolean(contactInfo.name && contactInfo.phone && contactInfo.consent)
    }
    if (isDiscountStep) {
      return true
    }
    const current = content.steps[currentStep]
    if (current?.inputType === "number") {
      return Boolean(selections[current.id]?.trim())
    }
    return Boolean(selections[current?.id])
  }

  const handleNext = () => {
    if (currentStep === 0) {
      void trackSiteEvent("start_quiz", {
        funnel_type: "kitchen",
        offer_variant: offerVariant,
        experiment_key: experimentKey,
        metadata: {
          placement: "configurator",
        },
      })
    }
    setCurrentStep((step) => Math.min(totalSteps - 1, step + 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    const trackingContext = getTrackingContext()
    const discountSummary = getDiscountSummary()
    const payload = {
      funnel_type: "kitchen",
      name: contactInfo.name,
      phone: contactInfo.phone,
      city: "Москва",
      comment: contactInfo.comment,
      prefer_messenger: contactInfo.messenger,
      quiz_answers: {
        selections,
        discounts: selectedDiscounts,
        discount_summary: discountSummary,
      },
      offer_variant: offerVariant,
      experiment_key: experimentKey,
      ...trackingContext,
    }

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Lead submit failed: ${response.status}`)
      }

      await trackSiteEvent("submit_lead", {
        funnel_type: "kitchen",
        offer_variant: offerVariant,
        experiment_key: experimentKey,
        metadata: {
          placement: "configurator",
          discounts: selectedDiscounts,
        },
      })

      setSubmitted(true)
    } catch (error) {
      console.error(error)
      window.alert("Не удалось отправить заявку. Попробуйте еще раз.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="bg-card py-24" id="configurator">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-foreground">{content.successTitle}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.successDescription}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-card py-24" id="configurator">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.description}</p>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{`Шаг ${currentStep + 1} из ${totalSteps}`}</span>
            <span>{`${Math.round(progress)}%`}</span>
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
              <h3 className="font-serif text-2xl font-bold text-foreground">{content.steps[currentStep].title}</h3>
              <p className="mt-1 text-muted-foreground">{content.steps[currentStep].description}</p>
              {content.steps[currentStep].inputType === "number" ? (
                <div className="mt-6">
                  <label htmlFor={content.steps[currentStep].id} className="mb-1 block text-sm font-medium text-foreground">
                    Длина кухни, пог. м
                  </label>
                  <input
                    id={content.steps[currentStep].id}
                    type="number"
                    min={content.steps[currentStep].min}
                    step={content.steps[currentStep].step}
                    value={selections[content.steps[currentStep].id] || ""}
                    onChange={(event) => handleInput(content.steps[currentStep].id, event.target.value)}
                    placeholder={content.steps[currentStep].placeholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {content.steps[currentStep].options.map((option) => {
                    const image = option.imageKey ? assets[option.imageKey] : null
                    const selected = selections[content.steps[currentStep].id] === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(content.steps[currentStep].id, option.value)}
                        className={`overflow-hidden rounded-lg border text-left transition-all ${
                          selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30"
                        }`}
                      >
                        {image ? (
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={image.publicUrl}
                              alt={option.imageAlt || image.alt || option.label}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="p-4">
                          <span className={`text-base font-medium ${selected ? "text-primary" : "text-foreground"}`}>
                            {option.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {isDiscountStep && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">{content.discountTitle}</h3>
              <p className="mt-1 text-muted-foreground">{content.discountDescription}</p>
              <div className="mt-6 flex flex-col gap-3">
                {content.discountOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleDiscount(option.value)}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${
                      selectedDiscounts.includes(option.value)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-base font-medium text-foreground">{option.label}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        selectedDiscounts.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {option.discountLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isContactStep && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">{content.contactTitle}</h3>
              <p className="mt-1 text-muted-foreground">{content.contactDescription}</p>
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                    {content.fields.nameLabel}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={contactInfo.name}
                    onChange={(event) => setContactInfo((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder={content.fields.namePlaceholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
                    {content.fields.phoneLabel}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(event) => setContactInfo((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder={content.fields.phonePlaceholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="mb-1 block text-sm font-medium text-foreground">
                    {content.fields.commentLabel}
                  </label>
                  <textarea
                    id="comment"
                    value={contactInfo.comment}
                    onChange={(event) => setContactInfo((prev) => ({ ...prev, comment: event.target.value }))}
                    placeholder={content.fields.commentPlaceholder}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactInfo.messenger}
                    onChange={(event) => setContactInfo((prev) => ({ ...prev, messenger: event.target.checked }))}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">{content.messengerLabel}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactInfo.consent}
                    onChange={(event) => setContactInfo((prev) => ({ ...prev, consent: event.target.checked }))}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">{content.consentLabel}</span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              {content.backButtonLabel}
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
                    {content.submittingLabel}
                  </>
                ) : (
                  content.submitButtonLabel
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {content.nextButtonLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
