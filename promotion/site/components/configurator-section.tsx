"use client"

import Image from "next/image"
import type { ClipboardEvent } from "react"
import { useRef, useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react"

import type { ConfiguratorContent, DiscountOption } from "@/lib/site-content"
import { getTrackingContext, trackFormStart, trackFormSubmit, trackLead } from "@/lib/tracking"

type ConfiguratorSectionProps = {
  content: ConfiguratorContent
  offerVariant: string | null
  experimentKey: string | null
}

type ContactMethod = "call" | "max" | "telegram" | "whatsapp"

type StyleOption = {
  value: string
  label: string
  imageSrc: string
}

type ShapeOption = {
  value: string
  label: string
  imageSrc: string
}

type ContactMethodOption = {
  value: ContactMethod
  label: string
  Icon: typeof Phone
}

type StepItem = {
  id: string
  label: string
}

const styleOptions: StyleOption[] = [
  { value: "neoklassika", label: "Неоклассика", imageSrc: "/images/configurator/styles/neoklassika.png" },
  { value: "minimalizm", label: "Минимализм", imageSrc: "/images/configurator/styles/minimalizm.png" },
  { value: "eko", label: "Эко", imageSrc: "/images/configurator/styles/eko.png" },
  { value: "klassika", label: "Классика", imageSrc: "/images/configurator/styles/klassika.png" },
  { value: "skandi-dzen", label: "Сканди-дзен", imageSrc: "/images/configurator/styles/skandi-dzen.png" },
  { value: "loft", label: "Лофт", imageSrc: "/images/configurator/styles/loft.png" },
  { value: "kantri", label: "Кантри", imageSrc: "/images/configurator/styles/kantri.png" },
  {
    value: "sredizemnomore",
    label: "Средиземноморье",
    imageSrc: "/images/configurator/styles/sredizemnomore.png",
  },
]

const shapeOptions: ShapeOption[] = [
  { value: "straight", label: "Прямая", imageSrc: "/images/configurator/shape-straight.jpg" },
  { value: "l-shaped", label: "Угловая", imageSrc: "/images/configurator/shape-l-shaped.jpg" },
  { value: "u-shaped", label: "П-образная", imageSrc: "/images/configurator/shape-u-shaped.jpg" },
]

const applianceOptions = [
  "Варочная панель",
  "Посудомоечная машина",
  "Духовой шкаф",
  "Мойка",
  "Холодильник",
  "Вытяжка",
  "Микроволновка",
]

const contactMethodOptions: ContactMethodOption[] = [
  { value: "call", label: "Звонок", Icon: Phone },
  { value: "max", label: "MAX", Icon: MessageSquare },
  { value: "telegram", label: "Telegram", Icon: Send },
  { value: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
]

const stepItems: StepItem[] = [
  { id: "styles", label: "Стиль" },
  { id: "shape", label: "Форма" },
  { id: "appliances", label: "Техника" },
  { id: "details", label: "Размер" },
  { id: "discount", label: "Скидка" },
  { id: "contact", label: "Контакт" },
]

function buildDiscountPayload(discounts: string[], options: DiscountOption[]) {
  return options
    .filter((option) => discounts.includes(option.value))
    .map((option) => ({
      value: option.value,
      label: option.label,
      discount: option.discount,
      kind: option.kind || "percent",
      amount: option.amount ?? 0,
    }))
}

function extractDigits(value: string) {
  return value.replace(/\D/g, "")
}

function normalizePhoneDigits(value: string) {
  const digits = extractDigits(value)

  if (!digits) {
    return ""
  }

  if (digits.length >= 11 && digits[0] === "8") {
    return `7${digits.slice(1, 11)}`
  }

  if (digits.length >= 11 && digits[0] === "7") {
    return digits.slice(0, 11)
  }

  if (digits.length === 10 && digits[0] === "9") {
    return `7${digits}`
  }

  if (digits.length <= 10 && (digits[0] === "8" || digits[0] === "9")) {
    const normalized = digits[0] === "8" ? `7${digits.slice(1)}` : `7${digits}`
    return normalized.slice(0, 11)
  }

  if (digits[0] === "7") {
    return digits.slice(0, 11)
  }

  if (digits[0] === "9") {
    return `7${digits}`.slice(0, 11)
  }

  return digits.slice(0, 11)
}

function formatPhone(value: string) {
  const digits = normalizePhoneDigits(value)

  if (!digits) {
    return ""
  }

  const country = digits[0] || "7"
  const part1 = digits.slice(1, 4)
  const part2 = digits.slice(4, 7)
  const part3 = digits.slice(7, 9)
  const part4 = digits.slice(9, 11)

  let formatted = `+${country}`

  if (part1) {
    formatted += ` ${part1}`
  }

  if (part2) {
    formatted += ` ${part2}`
  }

  if (part3) {
    formatted += `-${part3}`
  }

  if (part4) {
    formatted += `-${part4}`
  }

  return formatted
}

function countDigitsBeforeCursor(value: string, cursor: number | null) {
  if (cursor === null) {
    return extractDigits(value).length
  }

  return extractDigits(value.slice(0, cursor)).length
}

function getCursorPositionFromDigits(value: string, digitsCount: number) {
  if (digitsCount <= 0) {
    return 0
  }

  let seenDigits = 0

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seenDigits += 1
    }

    if (seenDigits === digitsCount) {
      return index + 1
    }
  }

  return value.length
}

function isPhoneComplete(value: string) {
  return normalizePhoneDigits(value).length === 11
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })
    .format(Math.round(value))
    .replace(/[\u00A0\u202F]/g, " ")
}

export function ConfiguratorSection({
  content,
  offerVariant,
  experimentKey,
}: ConfiguratorSectionProps) {
  const discountOptions = Array.isArray(content.discountOptions) ? content.discountOptions : []
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedShape, setSelectedShape] = useState("")
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([])
  const [meters, setMeters] = useState("")
  const [needsMeasurement, setNeedsMeasurement] = useState(false)
  const [budget, setBudget] = useState("")
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    consent: false,
    contactMethod: "call" as ContactMethod,
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const hasTrackedFormStartRef = useRef(false)
  const phoneInputRef = useRef<HTMLInputElement | null>(null)

  const totalSteps = stepItems.length
  const isDiscountStep = currentStep === 4
  const isContactStep = currentStep === 5
  const progress = ((currentStep + 1) / totalSteps) * 100
  const parsedMeters = meters.trim() ? Number(meters.replace(",", ".")) : null
  const hasValidMeters = parsedMeters !== null && Number.isFinite(parsedMeters) && parsedMeters > 0
  const estimatedPrice = hasValidMeters && !needsMeasurement ? parsedMeters * 70000 : null

  const markFormStarted = () => {
    if (hasTrackedFormStartRef.current) {
      return
    }

    hasTrackedFormStartRef.current = true

    void trackFormStart({
      formName: "configurator",
      sectionName: "configurator",
      stepNumber: currentStep + 1,
      funnelType: "kitchen",
      offerVariant,
      experimentKey,
    })
  }

  const toggleStyle = (value: string) => {
    markFormStarted()
    setSelectedStyles((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const selectShape = (value: string) => {
    markFormStarted()
    setSelectedShape(value)
  }

  const toggleAppliance = (value: string) => {
    markFormStarted()
    setSelectedAppliances((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const toggleDiscount = (value: string) => {
    markFormStarted()
    setSelectedDiscounts((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleMetersChange = (value: string) => {
    markFormStarted()
    const sanitized = value.replace(",", ".").replace(/[^\d.]/g, "")
    const parts = sanitized.split(".")
    const normalized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized

    setMeters(normalized)
  }

  const handleNeedsMeasurementChange = (checked: boolean) => {
    markFormStarted()
    setNeedsMeasurement(checked)

    if (checked) {
      setMeters("")
    }
  }

  const handleBudgetChange = (value: string) => {
    markFormStarted()
    setBudget(extractDigits(value))
  }

  const handlePhoneChange = (value: string, cursorPosition: number | null) => {
    markFormStarted()
    const digitsBeforeCursor = countDigitsBeforeCursor(value, cursorPosition)
    const formatted = formatPhone(value)

    setContactInfo((prev) => ({ ...prev, phone: formatted }))

    requestAnimationFrame(() => {
      const input = phoneInputRef.current
      if (!input) {
        return
      }

      const nextCursor = getCursorPositionFromDigits(formatted, digitsBeforeCursor)
      input.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const handlePhoneCopy = (event: ClipboardEvent<HTMLInputElement>) => {
    const input = phoneInputRef.current
    if (!input) {
      return
    }

    const { selectionStart, selectionEnd, value } = input
    const copiedValue =
      selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd
        ? value.slice(selectionStart, selectionEnd)
        : value

    event.clipboardData.setData("text/plain", copiedValue)
    event.preventDefault()
  }

  const handlePhonePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    const input = phoneInputRef.current
    if (!input) {
      return
    }

    const pastedText = event.clipboardData.getData("text/plain")
    const selectionStart = input.selectionStart ?? input.value.length
    const selectionEnd = input.selectionEnd ?? selectionStart
    const nextValue = `${input.value.slice(0, selectionStart)}${pastedText}${input.value.slice(selectionEnd)}`

    handlePhoneChange(nextValue, selectionStart + pastedText.length)
  }

  const canProceed = () => {
    if (currentStep === 0) {
      return selectedStyles.length > 0
    }

    if (currentStep === 1) {
      return Boolean(selectedShape)
    }

    if (currentStep === 2) {
      return selectedAppliances.length > 0
    }

    if (currentStep === 3) {
      return hasValidMeters || needsMeasurement
    }

    if (isDiscountStep) {
      return true
    }

    if (isContactStep) {
      return Boolean(contactInfo.name.trim() && isPhoneComplete(contactInfo.phone) && contactInfo.consent)
    }

    return true
  }

  const handleNext = () => {
    markFormStarted()
    setCurrentStep((step) => Math.min(totalSteps - 1, step + 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    const trackingContext = getTrackingContext()
    const formattedPhone = formatPhone(contactInfo.phone)
    const normalizedPhoneDigits = normalizePhoneDigits(contactInfo.phone)
    const payload = {
      funnel_type: "kitchen",
      name: contactInfo.name,
      phone: formattedPhone,
      city: "Москва",
      comment: null,
      prefer_messenger: contactInfo.contactMethod !== "call",
      quiz_answers: {
        styles: styleOptions.filter((item) => selectedStyles.includes(item.value)).map((item) => item.label),
        kitchen_shape: shapeOptions.find((item) => item.value === selectedShape)?.label || null,
        appliances: applianceOptions.filter((item) => selectedAppliances.includes(item)),
        meters: hasValidMeters && !needsMeasurement ? parsedMeters : null,
        need_measurement: needsMeasurement,
        desired_budget: budget ? Number(budget) : null,
        discounts: buildDiscountPayload(selectedDiscounts, discountOptions),
        phone: formattedPhone,
        phone_digits: normalizedPhoneDigits || null,
        contact_method: contactMethodOptions.find((item) => item.value === contactInfo.contactMethod)?.label || null,
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

      void trackFormSubmit({
        formName: "configurator",
        sectionName: "configurator",
        stepNumber: totalSteps,
        success: true,
        funnelType: "kitchen",
        offerVariant,
        experimentKey,
      })

      void trackLead({
        formName: "configurator",
        sectionName: "configurator",
        success: true,
        funnelType: "kitchen",
        offerVariant,
        experimentKey,
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
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground text-balance lg:text-5xl">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.description}</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{`Шаг ${currentStep + 1} из ${totalSteps}`}</span>
            <span>{stepItems[currentStep]?.label}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {stepItems.map((step, index) => {
              const isActive = index === currentStep
              const isDone = index < currentStep

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border px-3 py-3 text-center transition-all ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-primary/8 text-primary ring-1 ring-primary/20"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <div
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
                      isDone
                        ? "border-primary-foreground/30 bg-primary-foreground/12 text-primary-foreground"
                        : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`mt-2 block text-xs font-medium leading-tight ${
                      isDone ? "text-primary-foreground" : isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-background p-5 shadow-sm sm:p-8">
          <div className="sm:min-h-[38rem]">
            {currentStep === 0 ? (
              <div className="mx-auto max-w-5xl">
                <h3 className="max-w-3xl font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  В какой атмосфере Вам хочется находиться на своей кухне?
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Можно выбрать один или несколько стилей. Мы сохраним выбранные варианты и вернемся к ним, если Вы
                  захотите изменить ответ позже.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {styleOptions.map((option) => {
                    const isSelected = selectedStyles.includes(option.value)

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleStyle(option.value)}
                        aria-pressed={isSelected}
                        aria-label={option.label}
                        className={`group flex h-full flex-col overflow-hidden rounded-[1.25rem] border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_10px_30px_rgba(36,72,126,0.10)] ring-1 ring-primary/30"
                            : "border-border hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        <div className="relative aspect-[4/3] w-full">
                          <Image
                            src={option.imageSrc}
                            alt={option.label}
                            fill
                            className="object-cover"
                            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
                          {isSelected ? (
                            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex min-h-[5.25rem] flex-1 items-center px-4 py-4 sm:px-5">
                          <span
                            className={`block text-base font-medium leading-snug ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="mx-auto max-w-5xl">
                <h3 className="max-w-3xl font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  Какая форма кухни планируется Вами?
                </h3>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {shapeOptions.map((option) => {
                    const isSelected = selectedShape === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectShape(option.value)}
                        aria-pressed={isSelected}
                        aria-label={option.label}
                        className={`group flex h-full flex-col overflow-hidden rounded-[1.25rem] border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_10px_30px_rgba(36,72,126,0.10)] ring-1 ring-primary/30"
                            : "border-border hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        <div className="relative aspect-[4/3] w-full">
                          <Image
                            src={option.imageSrc}
                            alt={option.label}
                            fill
                            className="object-cover"
                            sizes="(max-width: 767px) 100vw, 33vw"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                        </div>
                        <div className="flex min-h-[5rem] items-center px-4 py-4 sm:px-5">
                          <span className={`block text-base font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {option.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="mx-auto max-w-4xl">
                <h3 className="max-w-3xl font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  Какую бытовую технику Вы хотели бы приобрести и установить с нашей помощью?
                </h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {applianceOptions.map((option) => {
                    const isSelected = selectedAppliances.includes(option)

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleAppliance(option)}
                        aria-pressed={isSelected}
                        className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-base ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(36,72,126,0.12)]"
                            : "border-border text-foreground hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <span>{option}</span>
                        <span
                          className={`ml-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-primary-foreground/40 bg-primary-foreground/12 text-primary-foreground"
                              : "border-border bg-background text-transparent"
                          }`}
                          aria-hidden="true"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="mx-auto max-w-3xl space-y-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                    Какого размера кухню вы планируете?
                  </h3>
                  <div className="mt-6 max-w-xl space-y-3">
                    <input
                      id="kitchen-size"
                      type="text"
                      inputMode="decimal"
                      value={meters}
                      onChange={(event) => handleMetersChange(event.target.value)}
                      disabled={needsMeasurement}
                      placeholder="Например, 6"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Какого размера кухню вы планируете?"
                    />
                    <p className="text-sm text-muted-foreground">
                      Можно указать дробное значение, если длина известна не точно.
                    </p>
                    <label className="inline-flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={needsMeasurement}
                        onChange={(event) => handleNeedsMeasurementChange(event.target.checked)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <span className="text-sm text-foreground">Необходимо замерить</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                    Какой желаемый бюджет для Вас?
                  </h3>
                  <div className="mt-6 max-w-xl space-y-3">
                    <input
                      id="desired-budget"
                      type="text"
                      inputMode="numeric"
                      value={budget}
                      onChange={(event) => handleBudgetChange(event.target.value)}
                      placeholder="Например, 350000"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      aria-label="Какой желаемый бюджет для Вас?"
                    />
                    <p className="text-sm text-muted-foreground">
                      Это поле необязательно. Если пока сомневаетесь, можно оставить его пустым.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isDiscountStep ? (
              <div className="mx-auto max-w-3xl">
                <h3 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{content.discountTitle}</h3>
                <p className="mt-2 max-w-2xl text-muted-foreground">{content.discountDescription}</p>
                <div className="mt-6 flex flex-col gap-3">
                  {discountOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleDiscount(option.value)}
                      className={`flex min-h-16 items-center justify-between rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        selectedDiscounts.includes(option.value)
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/30 hover:bg-primary/5"
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
                        {`-${option.discount}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {isContactStep ? (
              <div className="mx-auto max-w-4xl">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-10 w-10" />
                </div>

                <div className="rounded-[1.5rem] bg-secondary/70 px-5 py-6 text-center sm:px-8 sm:py-8">
                  <h3 className="font-serif text-3xl font-bold leading-tight text-foreground text-balance sm:text-4xl">
                    {estimatedPrice !== null
                      ? `Стоимость Вашей кухни примерно ${formatPrice(estimatedPrice)} р`
                      : "Стоимость Вашей кухни пока не определена"}
                  </h3>
                  <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Оставьте контакт — и получите 3D-проект с точной сметой в течение суток.
                  </p>
                </div>

                <div className="mt-8 space-y-6">
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
                      className="w-full rounded-2xl border border-input bg-background px-4 py-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
                      {content.fields.phoneLabel}
                    </label>
                    <input
                      id="phone"
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={contactInfo.phone}
                      onChange={(event) => handlePhoneChange(event.target.value, event.target.selectionStart)}
                      onCopy={handlePhoneCopy}
                      onPaste={handlePhonePaste}
                      placeholder={content.fields.phonePlaceholder}
                      maxLength={16}
                      aria-describedby="phone-hint"
                      className="w-full rounded-2xl border border-input bg-background px-4 py-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p id="phone-hint" className="mt-2 text-sm leading-6 text-muted-foreground">
                      Подойдет любой привычный ввод: мы сами приведем номер к формату +7 928 123-45-67.
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">Удобный способ связи</p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {contactMethodOptions.map((option) => {
                        const isSelected = contactInfo.contactMethod === option.value
                        const Icon = option.Icon

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setContactInfo((prev) => ({ ...prev, contactMethod: option.value }))}
                            aria-pressed={isSelected}
                            className={`flex min-h-28 flex-col justify-between rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                              isSelected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/30 hover:bg-primary/5"
                            }`}
                          >
                            <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`mt-4 block text-base font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {option.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={contactInfo.consent}
                      onChange={(event) => setContactInfo((prev) => ({ ...prev, consent: event.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-input accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">{content.consentLabel}</span>
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              disabled={currentStep === 0}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40 sm:min-w-[148px] sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              {content.backButtonLabel}
            </button>

            {isContactStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:min-w-[148px] sm:w-auto"
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
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:min-w-[148px] sm:w-auto"
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
