// Purpose: capture first-touch attribution in the browser and send normalized events to the site API.

const clientIdKey = "kitchen_v_client_id"
const attributionKey = "kitchen_v_attribution"

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

function isBrowser() {
  return typeof window !== "undefined"
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

export async function trackSiteEvent(eventName: string, payload: TrackingPayload = {}) {
  if (!isBrowser()) {
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
