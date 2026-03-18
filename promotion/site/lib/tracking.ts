// Purpose: capture first-touch attribution in the browser and send normalized events
// to the site API, Google Analytics 4 and Yandex Metrica without leaking PII.

const clientIdKey = "kitchen_v_client_id"
const attributionKey = "kitchen_v_attribution"
const defaultFunnelType = "kitchen"
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || ""
const yandexMetricaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() || ""

type TrackingContext = {
  client_id: string
  landing_url: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  yclid: string | null
  vkclid: string | null
}

type TrackingPayload = Partial<
  TrackingContext & {
    funnel_type: string
    offer_variant: string | null
    experiment_key: string | null
    metadata: Record<string, unknown>
  }
>

type AnalyticsValue = string | number | boolean

type AnalyticsParams = Record<string, AnalyticsValue | null | undefined>

type AnalyticsEventOptions = {
  funnelType?: string
  offerVariant?: string | null
  experimentKey?: string | null
  metadata?: Record<string, unknown>
}

type PageViewOptions = AnalyticsEventOptions & {
  pagePath?: string
  pageTitle?: string
  pageLocation?: string
  skipMetricaHit?: boolean
}

type CTAOptions = AnalyticsEventOptions & {
  buttonName: string
  sectionName: string
  destination?: string
}

type PhoneClickOptions = AnalyticsEventOptions & {
  buttonName?: string
  sectionName: string
}

type FormEventOptions = AnalyticsEventOptions & {
  formName: string
  sectionName: string
  stepNumber?: number
  success?: boolean
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    ym?: (...args: unknown[]) => void
    __analyticsConsent?: boolean
  }
}

function isBrowser() {
  return typeof window !== "undefined"
}

function hasAnalyticsConsent() {
  if (!isBrowser()) {
    return false
  }

  // TODO: wire this to the site's cookie banner once consent UX is added.
  // Until then analytics works as before, but this flag gives a single gating point.
  return window.__analyticsConsent ?? true
}

function ensureClientId() {
  if (!isBrowser()) {
    return "server"
  }

  const existing = window.localStorage.getItem(clientIdKey)
  if (existing) {
    return existing
  }

  const nextId = crypto.randomUUID()
  window.localStorage.setItem(clientIdKey, nextId)
  return nextId
}

function saveAttribution() {
  if (!isBrowser()) {
    return null
  }

  const params = new URLSearchParams(window.location.search)
  const incoming = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    yclid: params.get("yclid"),
    vkclid: params.get("vkclid"),
  }

  const hasAnyIncoming = Object.values(incoming).some(Boolean)
  if (hasAnyIncoming) {
    window.localStorage.setItem(attributionKey, JSON.stringify(incoming))
  }

  const saved = window.localStorage.getItem(attributionKey)
  return saved ? (JSON.parse(saved) as Omit<TrackingContext, "client_id" | "landing_url">) : incoming
}

export function getTrackingContext(): TrackingContext {
  const attribution = saveAttribution()
  return {
    client_id: ensureClientId(),
    landing_url: isBrowser() ? window.location.href : "",
    utm_source: attribution?.utm_source || null,
    utm_medium: attribution?.utm_medium || null,
    utm_campaign: attribution?.utm_campaign || null,
    utm_content: attribution?.utm_content || null,
    utm_term: attribution?.utm_term || null,
    yclid: attribution?.yclid || null,
    vkclid: attribution?.vkclid || null,
  }
}

function cleanAnalyticsValue(value: unknown): AnalyticsValue | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "boolean") {
    return value
  }

  return null
}

function sanitizeAnalyticsParams(params: AnalyticsParams = {}) {
  const sanitized = Object.entries(params).reduce<Record<string, AnalyticsValue>>((acc, [key, value]) => {
    if (/(name|phone|email|address|comment|message|textarea)/i.test(key)) {
      return acc
    }

    const safeValue = cleanAnalyticsValue(value)
    if (safeValue !== null) {
      acc[key] = safeValue
    }

    return acc
  }, {})

  return sanitized
}

function getPagePath(pagePath?: string) {
  if (pagePath) {
    return pagePath
  }

  if (!isBrowser()) {
    return "/"
  }

  const search = window.location.search || ""
  return `${window.location.pathname}${search}`
}

function getPageLocation(pageLocation?: string) {
  if (pageLocation) {
    return pageLocation
  }

  return isBrowser() ? window.location.href : ""
}

function ensureGoogleTag() {
  if (!isBrowser() || !gaMeasurementId) {
    return null
  }

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtagProxy(...args: unknown[]) {
      window.dataLayer?.push(args)
    }

  return window.gtag
}

function trackGoogleEvent(eventName: string, params: AnalyticsParams = {}) {
  if (!gaMeasurementId || !hasAnalyticsConsent()) {
    return
  }

  const gtag = ensureGoogleTag()
  if (!gtag) {
    return
  }

  gtag("event", eventName, sanitizeAnalyticsParams(params))
}

function trackMetricaGoal(goalName: string, params: AnalyticsParams = {}) {
  if (!isBrowser() || !yandexMetricaId || !hasAnalyticsConsent() || typeof window.ym !== "function") {
    return
  }

  window.ym(Number(yandexMetricaId), "reachGoal", goalName, sanitizeAnalyticsParams(params))
}

function trackMetricaHit(pageLocation: string, pageTitle?: string) {
  if (!isBrowser() || !yandexMetricaId || !hasAnalyticsConsent() || typeof window.ym !== "function") {
    return
  }

  const options = pageTitle ? { title: pageTitle } : undefined
  window.ym(Number(yandexMetricaId), "hit", pageLocation, options)
}

export async function trackSiteEvent(eventName: string, payload: TrackingPayload = {}) {
  if (!isBrowser() || !hasAnalyticsConsent()) {
    return
  }

  const body = {
    event_name: eventName,
    ...getTrackingContext(),
    ...payload,
  }

  try {
    await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch {
    // Tracking should never block the landing experience.
  }
}

function buildBaseParams(options: AnalyticsEventOptions = {}) {
  return sanitizeAnalyticsParams({
    funnel_type: options.funnelType || defaultFunnelType,
    offer_variant: options.offerVariant || undefined,
    experiment_key: options.experimentKey || undefined,
    page_path: getPagePath(),
  })
}

export async function trackPageView({
  funnelType = defaultFunnelType,
  offerVariant = null,
  experimentKey = null,
  pagePath,
  pageTitle,
  pageLocation,
  skipMetricaHit = false,
}: PageViewOptions = {}) {
  if (!isBrowser()) {
    return
  }

  const resolvedPath = getPagePath(pagePath)
  const resolvedLocation = getPageLocation(pageLocation)
  const analyticsParams = sanitizeAnalyticsParams({
    funnel_type: funnelType,
    offer_variant: offerVariant || undefined,
    experiment_key: experimentKey || undefined,
    page_path: resolvedPath,
    page_title: pageTitle || document.title,
    page_location: resolvedLocation,
  })

  trackGoogleEvent("page_view", analyticsParams)

  if (!skipMetricaHit) {
    trackMetricaHit(resolvedLocation, typeof analyticsParams.page_title === "string" ? analyticsParams.page_title : undefined)
  }

  await trackSiteEvent("page_view", {
    funnel_type: funnelType,
    offer_variant: offerVariant,
    experiment_key: experimentKey,
    landing_url: resolvedLocation,
    metadata: {
      page_path: resolvedPath,
      page_title: analyticsParams.page_title || null,
    },
  })
}

export async function trackCTA({
  buttonName,
  sectionName,
  destination,
  funnelType = defaultFunnelType,
  offerVariant = null,
  experimentKey = null,
}: CTAOptions) {
  const analyticsParams = {
    ...buildBaseParams({ funnelType, offerVariant, experimentKey }),
    button_name: buttonName,
    section_name: sectionName,
    destination: destination || undefined,
  }

  trackGoogleEvent("cta_click", analyticsParams)
  trackMetricaGoal("cta_click", analyticsParams)

  await trackSiteEvent("cta_click", {
    funnel_type: funnelType,
    offer_variant: offerVariant,
    experiment_key: experimentKey,
    metadata: {
      button_name: buttonName,
      section_name: sectionName,
      destination: destination || null,
    },
  })
}

export async function trackPhoneClick({
  buttonName = "phone_primary",
  sectionName,
  funnelType = defaultFunnelType,
  offerVariant = null,
  experimentKey = null,
}: PhoneClickOptions) {
  const analyticsParams = {
    ...buildBaseParams({ funnelType, offerVariant, experimentKey }),
    button_name: buttonName,
    section_name: sectionName,
    contact_method: "phone",
  }

  trackGoogleEvent("phone_click", analyticsParams)
  trackMetricaGoal("phone_click", analyticsParams)

  await trackSiteEvent("phone_click", {
    funnel_type: funnelType,
    offer_variant: offerVariant,
    experiment_key: experimentKey,
    metadata: {
      button_name: buttonName,
      section_name: sectionName,
      contact_method: "phone",
    },
  })
}

export async function trackFormStart({
  formName,
  sectionName,
  stepNumber,
  funnelType = defaultFunnelType,
  offerVariant = null,
  experimentKey = null,
}: FormEventOptions) {
  const analyticsParams = {
    ...buildBaseParams({ funnelType, offerVariant, experimentKey }),
    form_name: formName,
    section_name: sectionName,
    step_number: stepNumber,
  }

  trackGoogleEvent("form_start", analyticsParams)
  trackMetricaGoal("form_start", analyticsParams)

  await trackSiteEvent("form_start", {
    funnel_type: funnelType,
    offer_variant: offerVariant,
    experiment_key: experimentKey,
    metadata: {
      form_name: formName,
      section_name: sectionName,
      step_number: stepNumber || null,
    },
  })
}

export async function trackFormSubmit({
  formName,
  sectionName,
  stepNumber,
  success = true,
  funnelType = defaultFunnelType,
  offerVariant = null,
  experimentKey = null,
}: FormEventOptions) {
  const analyticsParams = {
    ...buildBaseParams({ funnelType, offerVariant, experimentKey }),
    form_name: formName,
    section_name: sectionName,
    step_number: stepNumber,
    success,
  }

  trackGoogleEvent("form_submit", analyticsParams)
  trackMetricaGoal("form_submit", analyticsParams)

  await trackSiteEvent("form_submit", {
    funnel_type: funnelType,
    offer_variant: offerVariant,
    experiment_key: experimentKey,
    metadata: {
      form_name: formName,
      section_name: sectionName,
      step_number: stepNumber || null,
      success,
    },
  })
}

export async function trackLead({
  formName,
  sectionName,
  success = true,
  funnelType = defaultFunnelType,
  offerVariant = null,
  experimentKey = null,
}: FormEventOptions) {
  const analyticsParams = {
    ...buildBaseParams({ funnelType, offerVariant, experimentKey }),
    form_name: formName,
    section_name: sectionName,
    success,
  }

  trackGoogleEvent("generate_lead", analyticsParams)
  trackMetricaGoal("lead", analyticsParams)

  await trackSiteEvent("lead", {
    funnel_type: funnelType,
    offer_variant: offerVariant,
    experiment_key: experimentKey,
    metadata: {
      form_name: formName,
      section_name: sectionName,
      success,
    },
  })
}

export function getAnalyticsIds() {
  return {
    gaMeasurementId,
    yandexMetricaId,
  }
}
