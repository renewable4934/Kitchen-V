// Purpose: shared validation and persistence logic for Next.js route handlers.

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

const allowedFunnels = new Set(["kitchen", "wardrobe"])
const allowedEvents = new Set(["view_offer", "click_call", "start_quiz", "submit_lead", "open_whatsapp"])

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePhone(phone: string) {
  return cleanString(phone).replace(/[^\d+]/g, "")
}

function isValidPhone(phone: string) {
  const raw = normalizePhone(phone)
  const digits = raw.replace(/\D/g, "")
  return digits.length >= 10 && digits.length <= 15
}

function safeJsonObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {}
}

function getRequestMeta(request: Request) {
  return {
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null,
    userAgent: request.headers.get("user-agent") || null,
  }
}

function getClient() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error("Supabase is not configured")
  }
  return client
}

export function getHealthStatus() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    supabase_enabled: isSupabaseConfigured(),
  }
}

export function validateLeadInput(input: Record<string, unknown> = {}) {
  const errors: string[] = []
  const funnelType = cleanString(input.funnel_type) || "kitchen"

  if (!allowedFunnels.has(funnelType)) {
    errors.push("funnel_type must be kitchen|wardrobe")
  }

  const name = cleanString(input.name)
  if (name.length < 2 || name.length > 70) {
    errors.push("name must be 2..70 characters")
  }

  const phone = cleanString(input.phone)
  if (!isValidPhone(phone)) {
    errors.push("phone is invalid")
  }

  const landingUrl = cleanString(input.landing_url)
  if (landingUrl && !/^https?:\/\//i.test(landingUrl)) {
    errors.push("landing_url must start with http:// or https://")
  }

  const payload = {
    id: crypto.randomUUID(),
    funnel_type: funnelType,
    name,
    phone,
    city: cleanString(input.city) || "Москва",
    comment: cleanString(input.comment) || null,
    prefer_messenger: Boolean(input.prefer_messenger),
    utm_source: cleanString(input.utm_source) || null,
    utm_medium: cleanString(input.utm_medium) || null,
    utm_campaign: cleanString(input.utm_campaign) || null,
    utm_content: cleanString(input.utm_content) || null,
    utm_term: cleanString(input.utm_term) || null,
    yclid: cleanString(input.yclid) || null,
    vkclid: cleanString(input.vkclid) || null,
    quiz_answers: safeJsonObject(input.quiz_answers),
    offer_variant: cleanString(input.offer_variant) || null,
    experiment_key: cleanString(input.experiment_key) || null,
    landing_url: landingUrl || null,
    client_id: cleanString(input.client_id) || null,
    timestamp: new Date().toISOString(),
  }

  return {
    isValid: errors.length === 0,
    errors,
    payload,
  }
}

export function validateEventInput(input: Record<string, unknown> = {}) {
  const errors: string[] = []
  const eventName = cleanString(input.event_name)
  if (!allowedEvents.has(eventName)) {
    errors.push("event_name is invalid")
  }

  const funnelType = cleanString(input.funnel_type)
  if (funnelType && !allowedFunnels.has(funnelType)) {
    errors.push("funnel_type must be kitchen|wardrobe when provided")
  }

  const payload = {
    id: crypto.randomUUID(),
    event_name: eventName,
    funnel_type: funnelType || "kitchen",
    offer_variant: cleanString(input.offer_variant) || null,
    experiment_key: cleanString(input.experiment_key) || null,
    landing_url: cleanString(input.landing_url) || null,
    client_id: cleanString(input.client_id) || null,
    utm_source: cleanString(input.utm_source) || null,
    utm_medium: cleanString(input.utm_medium) || null,
    utm_campaign: cleanString(input.utm_campaign) || null,
    yclid: cleanString(input.yclid) || null,
    vkclid: cleanString(input.vkclid) || null,
    metadata: safeJsonObject(input.metadata),
    timestamp: new Date().toISOString(),
  }

  return {
    isValid: errors.length === 0,
    errors,
    payload,
  }
}

async function pushLeadToCrm(lead: Record<string, unknown>) {
  const bitrixWebhookUrl = process.env.BITRIX24_WEBHOOK_URL
  const crmWebhookUrl = process.env.CRM_WEBHOOK_URL

  if (!bitrixWebhookUrl && !crmWebhookUrl) {
    return { delivered: false, reason: "webhook_not_configured" }
  }

  if (bitrixWebhookUrl) {
    const response = await fetch(bitrixWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          TITLE: `Заявка с сайта (${lead.funnel_type || "kitchen"})`,
          NAME: lead.name,
          PHONE: [{ VALUE: normalizePhone(String(lead.phone || "")), VALUE_TYPE: "WORK" }],
          CITY: lead.city,
          SOURCE_ID: "WEB",
          SOURCE_DESCRIPTION: JSON.stringify(lead.quiz_answers || {}),
          COMMENTS: `Создано: ${lead.timestamp}`,
        },
        params: {
          REGISTER_SONET_EVENT: "Y",
        },
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || data?.error) {
      throw new Error(`Bitrix24 webhook failed: ${response.status}`)
    }

    return { delivered: true, channel: "bitrix24" }
  }

  const response = await fetch(crmWebhookUrl!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  })

  if (!response.ok) {
    throw new Error(`CRM webhook failed: ${response.status}`)
  }

  return { delivered: true, channel: "generic" }
}

export async function storeLead(input: Record<string, unknown>, request: Request) {
  const validation = validateLeadInput(input)
  if (!validation.isValid) {
    return {
      ok: false,
      status: 400,
      body: { ok: false, errors: validation.errors },
    }
  }

  const meta = getRequestMeta(request)
  const payload = {
    ...validation.payload,
    ip: meta.ip,
    user_agent: meta.userAgent,
  }

  const client = getClient()
  const { error } = await client.from("leads").insert(payload)
  if (error) {
    return {
      ok: false,
      status: 500,
      body: { ok: false, error: error.message },
    }
  }

  let crm: { delivered: boolean; reason?: string; channel?: string } = {
    delivered: false,
    reason: "webhook_not_configured",
  }
  try {
    crm = await pushLeadToCrm(payload)
  } catch (error) {
    crm = { delivered: false, reason: error instanceof Error ? error.message : "crm_failed" }
  }

  return {
    ok: true,
    status: 200,
    body: { ok: true, lead_id: payload.id, crm },
  }
}

export async function storeEvent(input: Record<string, unknown>, request: Request) {
  const validation = validateEventInput(input)
  if (!validation.isValid) {
    return {
      ok: false,
      status: 400,
      body: { ok: false, errors: validation.errors },
    }
  }

  const meta = getRequestMeta(request)
  const payload = {
    ...validation.payload,
    ip: meta.ip,
    user_agent: meta.userAgent,
  }

  const client = getClient()
  const { error } = await client.from("events").insert(payload)
  if (error) {
    return {
      ok: false,
      status: 500,
      body: { ok: false, error: error.message },
    }
  }

  return {
    ok: true,
    status: 200,
    body: { ok: true, event_id: payload.id },
  }
}
