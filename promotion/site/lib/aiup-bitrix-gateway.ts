// Purpose: AI-UP -> Bitrix24 guarded gateway with hard test-mode guards, duplicate checks and safe logging.

import {
  appendAiupGatewayJournalRecord,
  buildDayKey,
  getAiupGatewayStorePath,
  readAiupGatewayJournal,
} from "./aiup-bitrix-gateway-store.ts"

export const AIUP_GATEWAY_ENDPOINT_PATH = "/api/aiup/bitrix-test"
export const AIUP_GATEWAY_DRY_RUN_MODE = "dry_run"
export const AIUP_GATEWAY_TEST_ONLY_MODE = "test_only"
export const AIUP_GATEWAY_FIRST_REAL_CONTACT_MODE = "first_real_contact"
export const AIUP_GATEWAY_LIMITED_BATCH_MODE = "limited_batch"
export const AIUP_GATEWAY_MODE_REQUIRED = AIUP_GATEWAY_TEST_ONLY_MODE
export const AIUP_GATEWAY_FIRST_REAL_TEST_MODE = AIUP_GATEWAY_FIRST_REAL_CONTACT_MODE
export const AIUP_GATEWAY_MANUAL_GATE_REQUIRED = "test-only-enabled"
export const AIUP_GATEWAY_TEST_PHONE = "+79990000000"
export const AIUP_GATEWAY_MAX_DAILY_DEFAULT = 5
export const AIUP_GATEWAY_ALLOWED_MODES = [
  AIUP_GATEWAY_DRY_RUN_MODE,
  AIUP_GATEWAY_MODE_REQUIRED,
  AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
  AIUP_GATEWAY_LIMITED_BATCH_MODE,
] as const
export const AIUP_GATEWAY_BLOCKED_MODES = ["live", "prod", "production"] as const
export const AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS = [
  "pegasmebel.ru",
  "legokuhni.ru",
  "kuhnihit.ru",
  "rosta-mebel.ru",
  "dekol-mebel.ru",
  "ukuhni.ru",
] as const
export const AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_REGIONS = [
  "ростов-на-дону",
  "ростовская область",
  "ростов-на-дону / ростовская область",
  "ростов-на-дону, ростовская область",
] as const

export const AIUP_GATEWAY_BITRIX_CATEGORY_NAME = "Продажи"
export const AIUP_GATEWAY_BITRIX_STAGE_NAME = "Новый AI-UP контакт"
export const AIUP_GATEWAY_BITRIX_SOURCE_NAME = "AI-UP"
export const AIUP_GATEWAY_SAFE_MANAGER_SCRIPT =
  "Контакт поступил через сервис подбора аудитории по интересу к теме кухонь и ремонта. Мы не утверждаем, что вы оставляли заявку у нас или у какой-то конкретной компании. Если вопрос неактуален, я отмечу отказ и исключу номер из дальнейшей обработки."

export const AIUP_GATEWAY_FIELD_LABELS = {
  sourceType: "AI-UP Source Type",
  sourceName: "AI-UP Source Name",
  sourceUrlOrPhone: "AI-UP Source URL or Phone",
  sourceDomain: "AI-UP Source Domain",
  requestType: "AI-UP Request Type",
  aiUpSource: "AI-UP Source",
  callScriptRequired: "AI-UP Call Script Required",
  optOutStatus: "AI-UP Opt Out Status",
  doNotClaimCompetitorApplication: "AI-UP Do Not Claim Competitor Application",
  region: "AI-UP Region",
  importedAt: "AI-UP Imported At",
  status: "AI-UP Status",
  channel: "AI-UP Channel",
  managerComment: "AI-UP Manager Comment",
  callAttempts: "AI-UP Call Attempts",
  contactQuality: "AI-UP Contact Quality",
  nextStep: "AI-UP Next Step",
  batchId: "AI-UP Batch ID",
} as const

export const AIUP_GATEWAY_ALLOWED_FIELDS = [
  "mode",
  "approval_token",
  "batch_id",
  "imported_at",
  "name",
  "phone",
  "source_type",
  "source_name",
  "source_url_or_phone",
  "source_domain",
  "request_type",
  "ai_up_source",
  "call_script_required",
  "opt_out_status",
  "do_not_claim_competitor_application",
  "region",
  "channel",
  "status",
  "manager_comment",
] as const

export const AIUP_GATEWAY_REQUIRED_FIELDS = [
  "mode",
  "approval_token",
  "batch_id",
  "phone",
  "source_type",
  "source_name",
  "region",
  "status",
] as const

type AllowedFieldName = (typeof AIUP_GATEWAY_ALLOWED_FIELDS)[number]
type RequiredFieldName = (typeof AIUP_GATEWAY_REQUIRED_FIELDS)[number]

type AiupGatewayInput = Record<string, unknown>

type AiupGatewayNormalizedPayload = {
  approval_token: string
  batch_id: string
  channel: string
  imported_at: string
  manager_comment: string
  mode: string
  name: string
  phone: string
  region: string
  source_name: string
  source_type: string
  source_url_or_phone: string
  source_domain: string
  request_type: string
  ai_up_source: string
  call_script_required: string
  opt_out_status: string
  do_not_claim_competitor_application: string
  status: string
}

type AiupGatewaySanitizedPayload = Omit<AiupGatewayNormalizedPayload, "approval_token" | "phone"> & {
  phone_masked: string
}

type BitrixFieldLabel = (typeof AIUP_GATEWAY_FIELD_LABELS)[keyof typeof AIUP_GATEWAY_FIELD_LABELS]

type BitrixGatewayMapping = {
  categoryId: string
  categoryName: string
  fieldCodes: Partial<Record<BitrixFieldLabel, string>>
  missingFieldLabels: BitrixFieldLabel[]
  sourceId: string
  sourceName: string
  startStageId: string
  startStageName: string
  usedStageFallback: boolean
}

type GatewayEnv = {
  approvalToken: string
  bitrixCategoryName: string
  bitrixStageName: string
  bitrixWebhookUrl: string
  dailyLimit: number
  firstRealApprovalToken: string
  limitedBatchEnabled: boolean
  manualGate: string
  mode: (typeof AIUP_GATEWAY_ALLOWED_MODES)[number]
  nativeWebhookEnabled: boolean
}

type GatewayLogEntry = {
  bitrixResult: "not_sent" | "duplicate" | "created"
  batchId: string
  duplicateResult: "bitrix" | "local_journal" | "none"
  mode: string
  phoneMasked: string
  requestId: string
  sourceName: string
  sourceType: string
  timestamp: string
  validationResult: "accepted" | "rejected"
}

type GatewayResultBody = {
  bitrix: {
    category_id: string
    category_name: string
    contact_action?: "created" | "existing"
    contact_id?: string
    created_deal_id?: string
    created_contact_id?: string
    source_id: string
    source_name: string
    stage_id: string
    stage_name: string
  }
  check_summary: {
    daily_limit_remaining: number
    duplicate_result: "bitrix" | "local_journal" | "none"
    existing_lead_ids?: string[]
    ignored_fields: string[]
    journal_store_path: string
  }
  log_entry: GatewayLogEntry
  mapping: {
    field_codes: Record<string, string>
  }
  ok: true
  request_id: string
  result: "created" | "dry_run" | "duplicate"
  sanitized_payload: AiupGatewaySanitizedPayload
}

type GatewayResponse =
  | {
      body: GatewayResultBody
      ok: true
      status: 200
    }
  | {
      body: {
        error: string
        ignored_fields?: string[]
        log_entry?: GatewayLogEntry
        ok: false
        request_id: string
        sanitized_payload?: Partial<AiupGatewaySanitizedPayload>
      }
      ok: false
      status: 400 | 403 | 409 | 429 | 500
    }

type AiupNativeContact = {
  "Дата"?: unknown
  "Тип взаимодействия"?: unknown
  "Источник"?: unknown
  "Телефон"?: unknown
  "Канал"?: unknown
}

type AiupNativeWebhookInput = {
  "Контакты"?: unknown
}

type AiupNativeWebhookResponse = {
  ok: true
  request_id: string
  result: "dry_run" | "native_webhook_processed" | "verification_only"
  contacts_total: number
  contacts_created: number
  contacts_duplicate: number
  contacts_rejected: number
  contacts_dry_run: number
  items: Array<{
    ok: boolean
    result: string
    source_name: string
    phone_masked: string
    error?: string
    created_deal_id?: string
  }>
}

type GatewayDependencies = {
  appendJournalRecord?: typeof appendAiupGatewayJournalRecord
  bitrixWebhookUrl?: string
  env?: Partial<GatewayEnv>
  fetchImpl?: typeof fetch
  nativeRequestToken?: string
  now?: () => Date
  randomUUID?: () => string
  readJournal?: typeof readAiupGatewayJournal
}

type BitrixDealRecord = Record<string, unknown>

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function canonicalizeGatewayMode(value: unknown) {
  const normalized = lowerSafe(value)

  if (normalized === "test") {
    return AIUP_GATEWAY_TEST_ONLY_MODE
  }

  if (normalized === "first_real_test") {
    return AIUP_GATEWAY_FIRST_REAL_CONTACT_MODE
  }

  return normalized
}

function normalizePhone(value: string) {
  return cleanString(value).replace(/[^\d+]/g, "")
}

function lowerSafe(value: unknown) {
  return cleanString(value).toLowerCase()
}

function normalizeRegion(value: string) {
  return lowerSafe(value).replace(/ё/g, "е").replace(/\s*\/\s*/g, " / ").replace(/\s+/g, " ").trim()
}

function normalizeSourceHost(value: string) {
  const cleaned = cleanString(value)

  if (!cleaned) {
    return ""
  }

  const candidates = cleaned.includes("://") ? [cleaned] : [cleaned, `https://${cleaned}`]

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate)
      return parsed.hostname.toLowerCase().replace(/^www\./, "")
    } catch {
      continue
    }
  }

  return ""
}

function maskPhone(phone: string) {
  const normalized = normalizePhone(phone)
  const digits = normalized.replace(/\D/g, "")

  if (digits.length < 6) {
    return normalized || "+"
  }

  return `+${digits.slice(0, 4)}******${digits.slice(-2)}`
}

function isAiupNativeWebhookInput(input: AiupGatewayInput): input is AiupNativeWebhookInput {
  return Array.isArray((input as AiupNativeWebhookInput)["Контакты"])
}

function resolveNativeWebhookEnabled(envValue: unknown) {
  return cleanString(envValue).toLowerCase() === "enabled"
}

function resolveLimitedBatchEnabled(envValue: unknown) {
  return cleanString(envValue).toLowerCase() === "enabled"
}

function pickAllowedFields(input: AiupGatewayInput) {
  const picked = {} as Record<AllowedFieldName, string>
  const ignored: string[] = []

  for (const [key, value] of Object.entries(input)) {
    if (AIUP_GATEWAY_ALLOWED_FIELDS.includes(key as AllowedFieldName)) {
      picked[key as AllowedFieldName] = cleanString(value)
    } else {
      ignored.push(key)
    }
  }

  return { picked, ignored }
}

function validateRequiredFields(payload: Record<AllowedFieldName, string>) {
  const missing: RequiredFieldName[] = []

  for (const fieldName of AIUP_GATEWAY_REQUIRED_FIELDS) {
    if (!cleanString(payload[fieldName])) {
      missing.push(fieldName)
    }
  }

  return missing
}

function toNormalizedPayload(payload: Record<AllowedFieldName, string>): AiupGatewayNormalizedPayload {
  return {
    approval_token: cleanString(payload.approval_token),
    batch_id: cleanString(payload.batch_id),
    channel: cleanString(payload.channel),
    imported_at: cleanString(payload.imported_at),
    manager_comment: cleanString(payload.manager_comment),
    mode: canonicalizeGatewayMode(payload.mode),
    name: cleanString(payload.name) || "AI-UP контакт",
    phone: normalizePhone(payload.phone),
    region: cleanString(payload.region),
    source_name: cleanString(payload.source_name),
    source_type: cleanString(payload.source_type),
    source_url_or_phone: cleanString(payload.source_url_or_phone),
    source_domain: cleanString(payload.source_domain) || normalizeSourceHost(payload.source_url_or_phone) || "unknown_from_ai_up",
    request_type: cleanString(payload.request_type) || "not_direct_request",
    ai_up_source: cleanString(payload.ai_up_source) || "true",
    call_script_required: cleanString(payload.call_script_required) || "soft_interest_check",
    opt_out_status: cleanString(payload.opt_out_status) || "active",
    do_not_claim_competitor_application:
      cleanString(payload.do_not_claim_competitor_application) || "true",
    status: cleanString(payload.status),
  }
}

function sanitizePayload(payload: AiupGatewayNormalizedPayload): AiupGatewaySanitizedPayload {
  return {
    batch_id: payload.batch_id,
    channel: payload.channel,
    imported_at: payload.imported_at,
    manager_comment: payload.manager_comment,
    mode: payload.mode,
    name: payload.name,
    phone_masked: maskPhone(payload.phone),
    region: payload.region,
    source_name: payload.source_name,
    source_type: payload.source_type,
    source_url_or_phone: payload.source_url_or_phone,
    source_domain: payload.source_domain,
    request_type: payload.request_type,
    ai_up_source: payload.ai_up_source,
    call_script_required: payload.call_script_required,
    opt_out_status: payload.opt_out_status,
    do_not_claim_competitor_application: payload.do_not_claim_competitor_application,
    status: payload.status,
  }
}

function buildDuplicateKey(payload: AiupGatewayNormalizedPayload) {
  return [
    normalizePhone(payload.phone),
    lowerSafe(payload.source_type),
    lowerSafe(payload.source_name),
    lowerSafe(payload.batch_id),
    lowerSafe(payload.imported_at),
  ].join("::")
}

function buildGatewayLogEntry(args: {
  duplicateResult: GatewayLogEntry["duplicateResult"]
  now: Date
  payload: AiupGatewayNormalizedPayload
  requestId: string
  validationResult: GatewayLogEntry["validationResult"]
  bitrixResult?: GatewayLogEntry["bitrixResult"]
}): GatewayLogEntry {
  return {
    batchId: args.payload.batch_id,
    bitrixResult: args.bitrixResult || "not_sent",
    duplicateResult: args.duplicateResult,
    mode: args.payload.mode,
    phoneMasked: maskPhone(args.payload.phone),
    requestId: args.requestId,
    sourceName: args.payload.source_name,
    sourceType: args.payload.source_type,
    timestamp: args.now.toISOString(),
    validationResult: args.validationResult,
  }
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function resolveGatewayEnv(deps: GatewayDependencies): GatewayEnv {
  const env = deps.env || {}
  const mode = canonicalizeGatewayMode(env.mode ?? process.env.AIUP_GATEWAY_MODE)
  const manualGate = cleanString(env.manualGate ?? process.env.AIUP_GATEWAY_MANUAL_GATE)
  const approvalToken = cleanString(env.approvalToken ?? process.env.AIUP_GATEWAY_APPROVAL_TOKEN)
  const firstRealApprovalToken = cleanString(
    env.firstRealApprovalToken ??
      process.env.AIUP_GATEWAY_FIRST_REAL_CONTACT_APPROVAL_TOKEN ??
      process.env.AIUP_GATEWAY_FIRST_REAL_TEST_APPROVAL_TOKEN,
  )
  const bitrixWebhookUrl = cleanString(
    env.bitrixWebhookUrl ??
      deps.bitrixWebhookUrl ??
      process.env.BITRIX24_AIUP_CRM_WEBHOOK_URL ??
      process.env.BITRIX24_TEST_CRM_WEBHOOK_URL,
  )
  const bitrixCategoryName = cleanString(process.env.AIUP_GATEWAY_BITRIX_CATEGORY_NAME) || AIUP_GATEWAY_BITRIX_CATEGORY_NAME
  const bitrixStageName = cleanString(process.env.AIUP_GATEWAY_BITRIX_STAGE_NAME) || AIUP_GATEWAY_BITRIX_STAGE_NAME
  const dailyLimitRaw = cleanString(
    String(env.dailyLimit ?? process.env.AIUP_GATEWAY_DAILY_LIMIT ?? AIUP_GATEWAY_MAX_DAILY_DEFAULT),
  )
  const nativeWebhookEnabled = resolveNativeWebhookEnabled(
    env.nativeWebhookEnabled ?? process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED,
  )
  const limitedBatchEnabled = resolveLimitedBatchEnabled(
    env.limitedBatchEnabled ?? process.env.AIUP_GATEWAY_LIMITED_BATCH_ENABLED,
  )
  const dailyLimit = parsePositiveInteger(dailyLimitRaw)

  if (!AIUP_GATEWAY_ALLOWED_MODES.includes(mode as (typeof AIUP_GATEWAY_ALLOWED_MODES)[number])) {
    throw new Error("AIUP_GATEWAY_MODE must be dry_run, test_only, first_real_contact or limited_batch")
  }

  if (manualGate !== AIUP_GATEWAY_MANUAL_GATE_REQUIRED) {
    throw new Error("AIUP_GATEWAY_MANUAL_GATE must be test-only-enabled")
  }

  if (!approvalToken) {
    throw new Error("AIUP_GATEWAY_APPROVAL_TOKEN is not configured")
  }

  if (!bitrixWebhookUrl) {
    throw new Error("BITRIX24_AIUP_CRM_WEBHOOK_URL or BITRIX24_TEST_CRM_WEBHOOK_URL is not configured")
  }

  if (!dailyLimit) {
    throw new Error("AIUP_GATEWAY_DAILY_LIMIT must be a positive integer")
  }

  return {
    approvalToken,
    bitrixCategoryName,
    bitrixStageName,
    bitrixWebhookUrl,
    dailyLimit,
    firstRealApprovalToken,
    limitedBatchEnabled,
    manualGate,
    mode: mode as (typeof AIUP_GATEWAY_ALLOWED_MODES)[number],
    nativeWebhookEnabled,
  }
}

function buildNativeWebhookBatchId(now: Date) {
  return `aiup-native-${buildDayKey(now)}`
}

function normalizeAiupNativeContact(
  contact: AiupNativeContact,
  env: GatewayEnv,
  now: Date,
): Record<AllowedFieldName, string> {
  const sourceName = cleanString(contact["Источник"])
  const date = cleanString(contact["Дата"])
  const interactionType = cleanString(contact["Тип взаимодействия"])
  const channel = cleanString(contact["Канал"]) || "AI-UP"

  return {
    approval_token: env.firstRealApprovalToken || env.approvalToken,
    batch_id: buildNativeWebhookBatchId(now),
    channel,
    imported_at: date,
    manager_comment: [`AI-UP native webhook`, interactionType && `Тип: ${interactionType}`, date && `Дата: ${date}`]
      .filter(Boolean)
      .join("; "),
    mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    name: `AI-UP / ${sourceName || "unknown source"}`,
    phone: cleanString(contact["Телефон"]),
    region: "Ростовская область",
    source_name: sourceName,
    source_type: "behavioral_interest",
    source_url_or_phone: sourceName,
    source_domain: normalizeSourceHost(sourceName) || "unknown_from_ai_up",
    request_type: "not_direct_request",
    ai_up_source: "true",
    call_script_required: "soft_interest_check",
    opt_out_status: "active",
    do_not_claim_competitor_application: "true",
    status: "first_real_test",
  }
}

function buildNativeVerificationItem(contact: AiupNativeContact, error: string) {
  return {
    error,
    ok: false,
    phone_masked: maskPhone(cleanString(contact["Телефон"])),
    result: "verification_only",
    source_name: cleanString(contact["Источник"]),
  }
}

export async function processAiupNativeWebhookRequest(
  input: AiupGatewayInput,
  options: GatewayDependencies & { performWrite: boolean },
): Promise<{ body: AiupNativeWebhookResponse | { ok: false; error: string; request_id: string }; ok: boolean; status: number }> {
  const requestId = options.randomUUID ? options.randomUUID() : crypto.randomUUID()
  const now = (options.now || (() => new Date()))()

  try {
    const env = resolveGatewayEnv(options)

    if (!env.nativeWebhookEnabled) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED must be enabled",
          ok: false,
          request_id: requestId,
        },
      }
    }

    if (
      !cleanString(options.nativeRequestToken) ||
      cleanString(options.nativeRequestToken) !== env.firstRealApprovalToken
    ) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "Invalid native webhook approval token",
          ok: false,
          request_id: requestId,
        },
      }
    }

    if (env.mode !== AIUP_GATEWAY_FIRST_REAL_TEST_MODE) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "AI-UP native webhook requires first_real_test gateway mode",
          ok: false,
          request_id: requestId,
        },
      }
    }

    if (!isAiupNativeWebhookInput(input)) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "Invalid AI-UP native webhook payload",
          ok: false,
          request_id: requestId,
        },
      }
    }

    const contacts = input["Контакты"] as AiupNativeContact[]
    const items: AiupNativeWebhookResponse["items"] = []

    for (const contact of contacts) {
      const normalized = normalizeAiupNativeContact(contact, env, now)
      const sourceHost = normalizeSourceHost(normalized.source_url_or_phone)

      if (
        !sourceHost ||
        !AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS.includes(
          sourceHost as (typeof AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS)[number],
        )
      ) {
        items.push(buildNativeVerificationItem(contact, "source_not_allowlisted"))
        continue
      }

      const result = await processAiupBitrixGatewayRequest(normalized, options)

      if (result.ok) {
        items.push({
          created_deal_id: result.body.bitrix.created_deal_id,
          ok: true,
          phone_masked: result.body.sanitized_payload.phone_masked,
          result: result.body.result,
          source_name: result.body.sanitized_payload.source_name,
        })
      } else {
        items.push({
          error: result.body.error,
          ok: false,
          phone_masked: sanitizePayload(toNormalizedPayload(normalized)).phone_masked,
          result: "rejected",
          source_name: normalized.source_name,
        })
      }
    }

    const contactsCreated = items.filter((item) => item.result === "created").length
    const contactsDuplicate = items.filter((item) => item.result === "duplicate").length
    const contactsDryRun = items.filter((item) => item.result === "dry_run").length
    const contactsRejected = items.filter((item) => !item.ok).length
    const resultType =
      contactsCreated > 0 || contactsDuplicate > 0
        ? "native_webhook_processed"
        : contactsDryRun > 0
          ? "dry_run"
          : "verification_only"

    return {
      ok: true,
      status: 200,
      body: {
        contacts_created: contactsCreated,
        contacts_dry_run: contactsDryRun,
        contacts_duplicate: contactsDuplicate,
        contacts_rejected: contactsRejected,
        contacts_total: contacts.length,
        items,
        ok: true,
        request_id: requestId,
        result: resultType,
      },
    }
  } catch (error) {
    return {
      ok: false,
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "native_webhook_failed",
        ok: false,
        request_id: requestId,
      },
    }
  }
}

function validatePayloadForMode(payload: AiupGatewayNormalizedPayload, mode: GatewayEnv["mode"]) {
  if (mode === AIUP_GATEWAY_DRY_RUN_MODE || mode === AIUP_GATEWAY_TEST_ONLY_MODE) {
    if (payload.phone !== AIUP_GATEWAY_TEST_PHONE) {
      return "Only the dedicated test phone is allowed"
    }

    return null
  }

  if (mode === AIUP_GATEWAY_LIMITED_BATCH_MODE) {
    // Same content guard as first_real_contact, but enabled separately at env level.
  }

  const normalizedSourceHost = normalizeSourceHost(payload.source_url_or_phone)
  if (
    !normalizedSourceHost ||
    !AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS.includes(
      normalizedSourceHost as (typeof AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS)[number],
    )
  ) {
    return "Only the approved first_real_contact source sites are allowed"
  }

  const normalizedRegion = normalizeRegion(payload.region)
  if (
    !AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_REGIONS.includes(
      normalizedRegion as (typeof AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_REGIONS)[number],
    )
  ) {
    return "Only the approved first_real_contact region is allowed"
  }

  const phoneDigits = payload.phone.replace(/\D/g, "")
  if (phoneDigits.length < 11) {
    return "Phone must contain at least 11 digits in first_real_contact mode"
  }

  if (
    payload.source_type !== "behavioral_interest" ||
    payload.request_type !== "not_direct_request" ||
    payload.ai_up_source !== "true" ||
    payload.call_script_required !== "soft_interest_check" ||
    payload.opt_out_status !== "active" ||
    payload.do_not_claim_competitor_application !== "true"
  ) {
    return "AI-UP behavioral lead safeguards are required"
  }

  return null
}

function encodeBracketedParams(
  params: Record<string, unknown>,
  prefix = "",
  target = new URLSearchParams(),
): URLSearchParams {
  for (const [key, value] of Object.entries(params)) {
    const paramName = prefix ? `${prefix}[${key}]` : key

    if (value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item && typeof item === "object") {
          encodeBracketedParams(item as Record<string, unknown>, `${paramName}[]`, target)
        } else {
          target.append(`${paramName}[]`, item === null ? "" : String(item))
        }
      })
      continue
    }

    if (value && typeof value === "object") {
      encodeBracketedParams(value as Record<string, unknown>, paramName, target)
      continue
    }

    target.append(paramName, value === null ? "" : String(value))
  }

  return target
}

async function callBitrixMethod<T>(
  webhookUrl: string,
  method: string,
  params: Record<string, unknown>,
  fetchImpl: typeof fetch,
) {
  const normalizedBase = webhookUrl.endsWith("/") ? webhookUrl : `${webhookUrl}/`
  const response = await fetchImpl(`${normalizedBase}${method}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeBracketedParams(params),
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as { error?: string; error_description?: string; result?: T }) : {}

  if (!response.ok || data.error) {
    const reason = cleanString(data.error_description) || cleanString(data.error) || text || "unknown_error"
    throw new Error(`Bitrix method ${method} failed: ${response.status} ${reason}`)
  }

  return data.result as T
}

function requireSingleMatch<T>(
  matches: T[],
  label: string,
  selector: (item: T) => string,
) {
  if (matches.length !== 1) {
    const values = matches.map(selector).join(", ") || "none"
    throw new Error(`${label} lookup is ambiguous: ${values}`)
  }

  return matches[0]
}

function sortBitrixRowsBySort<T extends Record<string, unknown>>(rows: T[]) {
  return [...rows].sort((left, right) => {
    const leftSort = Number.parseInt(cleanString(left.SORT), 10)
    const rightSort = Number.parseInt(cleanString(right.SORT), 10)

    return (Number.isFinite(leftSort) ? leftSort : 0) - (Number.isFinite(rightSort) ? rightSort : 0)
  })
}

function resolveDealStageEntityId(categoryId: string) {
  return categoryId === "0" ? "DEAL_STAGE" : `DEAL_STAGE_${categoryId}`
}

async function resolveBitrixMapping(
  webhookUrl: string,
  fetchImpl: typeof fetch,
  env: GatewayEnv,
): Promise<BitrixGatewayMapping> {
  const categories = await callBitrixMethod<Array<Record<string, unknown>>>(
    webhookUrl,
    "crm.dealcategory.list",
    {},
    fetchImpl,
  )
  const categoryMatches = categories.filter((item) => cleanString(item.NAME) === env.bitrixCategoryName)
  const category =
    categoryMatches.length === 0 && env.bitrixCategoryName === AIUP_GATEWAY_BITRIX_CATEGORY_NAME
      ? { ID: "0", NAME: AIUP_GATEWAY_BITRIX_CATEGORY_NAME, SORT: "0" }
      : requireSingleMatch(categoryMatches, `${env.bitrixCategoryName} category`, (item) => cleanString(item.NAME))

  const categoryId = cleanString(category.ID)
  const stageRows = await callBitrixMethod<Array<Record<string, unknown>>>(
    webhookUrl,
    "crm.status.list",
    {
      filter: {
        ENTITY_ID: resolveDealStageEntityId(categoryId),
      },
    },
    fetchImpl,
  )

  const preferredStageMatches = stageRows.filter((item) => cleanString(item.NAME) === env.bitrixStageName)
  const usedStageFallback = preferredStageMatches.length === 0
  const startStage = usedStageFallback
    ? sortBitrixRowsBySort(stageRows)[0]
    : requireSingleMatch(preferredStageMatches, `${env.bitrixStageName} start stage`, (item) => cleanString(item.NAME))

  if (!startStage) {
    throw new Error(`${env.bitrixCategoryName} start stage lookup returned no stages`)
  }

  const sources = await callBitrixMethod<Array<Record<string, unknown>>>(
    webhookUrl,
    "crm.status.list",
    {
      filter: {
        ENTITY_ID: "SOURCE",
      },
    },
    fetchImpl,
  )
  const source = requireSingleMatch(
    sources.filter((item) => cleanString(item.NAME) === AIUP_GATEWAY_BITRIX_SOURCE_NAME),
    "AI-UP source",
    (item) => cleanString(item.NAME),
  )

  const dealFields = await callBitrixMethod<Record<string, Record<string, unknown>>>(
    webhookUrl,
    "crm.deal.fields",
    {},
    fetchImpl,
  )

  const fieldCodes = {} as Partial<Record<BitrixFieldLabel, string>>
  const missingFieldLabels: BitrixFieldLabel[] = []

  for (const fieldLabel of Object.values(AIUP_GATEWAY_FIELD_LABELS)) {
    const matches = Object.entries(dealFields)
      .filter(([, value]) => {
        const formLabel = cleanString(value.formLabel)
        const listLabel = cleanString(value.listLabel)
        const filterLabel = cleanString(value.filterLabel)
        return formLabel === fieldLabel || listLabel === fieldLabel || filterLabel === fieldLabel
      })
      .map(([fieldCode]) => fieldCode)

    if (matches.length === 0) {
      missingFieldLabels.push(fieldLabel)
      continue
    }

    fieldCodes[fieldLabel] = requireSingleMatch(matches, `${fieldLabel} custom field`, (item) => item)
  }

  return {
    categoryId,
    categoryName: cleanString(category.NAME),
    fieldCodes,
    missingFieldLabels,
    sourceId: cleanString(source.STATUS_ID),
    sourceName: cleanString(source.NAME),
    startStageId: cleanString(startStage.STATUS_ID),
    startStageName: cleanString(startStage.NAME),
    usedStageFallback,
  }
}

function getImportedAtValue(payload: AiupGatewayNormalizedPayload, now: Date) {
  return payload.imported_at || now.toISOString()
}

function buildContactComment(payload: AiupGatewayNormalizedPayload, importedAt: string) {
  return [
    "AI-UP / controlled webhook gateway contact",
    `Masked phone: ${maskPhone(payload.phone)}`,
    `Source type: ${payload.source_type}`,
    `Source name: ${payload.source_name}`,
    `Source domain: ${payload.source_domain}`,
    `Request type: ${payload.request_type}`,
    `AI-UP source: ${payload.ai_up_source}`,
    `Call script required: ${payload.call_script_required}`,
    `Opt-out status: ${payload.opt_out_status}`,
    `Do not claim competitor application: ${payload.do_not_claim_competitor_application}`,
    `Safe manager script: ${AIUP_GATEWAY_SAFE_MANAGER_SCRIPT}`,
    `Channel: ${payload.channel || "-"}`,
    `Imported at: ${importedAt}`,
    `Batch ID: ${payload.batch_id}`,
    `Manager comment: ${payload.manager_comment || "-"}`,
  ].join("\n")
}

function buildBitrixDealPayload(
  mapping: BitrixGatewayMapping,
  payload: AiupGatewayNormalizedPayload,
  now: Date,
  contactId: string,
) {
  const importedAt = getImportedAtValue(payload, now)
  const title = payload.name.startsWith("TEST /")
    ? payload.name
    : `AI-UP / ${payload.source_name || "unknown source"} / ${maskPhone(payload.phone)}`
  const comments = [
    "AI-UP / controlled webhook gateway",
    `Masked phone: ${maskPhone(payload.phone)}`,
    `Source type: ${payload.source_type}`,
    `Source name: ${payload.source_name}`,
    `Source domain: ${payload.source_domain}`,
    `Request type: ${payload.request_type}`,
    `AI-UP source: ${payload.ai_up_source}`,
    `Call script required: ${payload.call_script_required}`,
    `Opt-out status: ${payload.opt_out_status}`,
    `Do not claim competitor application: ${payload.do_not_claim_competitor_application}`,
    `Safe manager script: ${AIUP_GATEWAY_SAFE_MANAGER_SCRIPT}`,
    `Channel: ${payload.channel || "-"}`,
    `Imported at: ${importedAt}`,
    `Batch ID: ${payload.batch_id}`,
    `Source URL or Phone: ${payload.source_url_or_phone || "-"}`,
    `Manager comment: ${payload.manager_comment || "-"}`,
    mapping.missingFieldLabels.length > 0 && `Missing AI-UP custom fields: ${mapping.missingFieldLabels.join(", ")}`,
    mapping.usedStageFallback && `Stage fallback used: ${mapping.startStageName}`,
  ].join("\n")
  const fields: Record<string, unknown> = {
    TITLE: title,
    CATEGORY_ID: mapping.categoryId,
    STAGE_ID: mapping.startStageId,
    SOURCE_ID: mapping.sourceId,
    CONTACT_ID: contactId,
    COMMENTS: comments,
  }

  const assignCustomField = (label: BitrixFieldLabel, value: string) => {
    const code = mapping.fieldCodes[label]
    if (code) {
      fields[code] = value
    }
  }

  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.sourceType, payload.source_type)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.sourceName, payload.source_name)
  assignCustomField(
    AIUP_GATEWAY_FIELD_LABELS.sourceUrlOrPhone,
    payload.source_url_or_phone || payload.source_name || maskPhone(payload.phone),
  )
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.sourceDomain, payload.source_domain)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.requestType, payload.request_type)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.aiUpSource, payload.ai_up_source)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.callScriptRequired, payload.call_script_required)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.optOutStatus, payload.opt_out_status)
  assignCustomField(
    AIUP_GATEWAY_FIELD_LABELS.doNotClaimCompetitorApplication,
    payload.do_not_claim_competitor_application,
  )
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.region, payload.region)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.importedAt, importedAt)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.status, payload.status)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.channel, payload.channel)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.managerComment, payload.manager_comment)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.callAttempts, "0")
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.contactQuality, payload.status)
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.nextStep, "Ручная обработка")
  assignCustomField(AIUP_GATEWAY_FIELD_LABELS.batchId, payload.batch_id)

  return {
    fields,
    params: {
      REGISTER_SONET_EVENT: "N",
    },
  }
}

async function findLeadDuplicatesByPhone(
  webhookUrl: string,
  payload: AiupGatewayNormalizedPayload,
  fetchImpl: typeof fetch,
) {
  const result = await callBitrixMethod<Record<string, number[]>>(
    webhookUrl,
    "crm.duplicate.findbycomm",
    {
      entity_type: "LEAD",
      type: "PHONE",
      values: [payload.phone],
    },
    fetchImpl,
  )

  return (result.LEAD || []).map((item) => String(item))
}

async function findContactDuplicatesByPhone(
  webhookUrl: string,
  payload: AiupGatewayNormalizedPayload,
  fetchImpl: typeof fetch,
) {
  const result = await callBitrixMethod<Record<string, number[]>>(
    webhookUrl,
    "crm.duplicate.findbycomm",
    {
      entity_type: "CONTACT",
      type: "PHONE",
      values: [payload.phone],
    },
    fetchImpl,
  )

  return (result.CONTACT || []).map((item) => String(item))
}

async function createBitrixContact(
  webhookUrl: string,
  mapping: BitrixGatewayMapping,
  payload: AiupGatewayNormalizedPayload,
  now: Date,
  fetchImpl: typeof fetch,
) {
  const importedAt = getImportedAtValue(payload, now)
  const name = cleanString(payload.name) || "AI-UP контакт"
  const lastName = cleanString(payload.source_name) || "Pegas"

  const result = await callBitrixMethod<number>(
    webhookUrl,
    "crm.contact.add",
    {
      fields: {
        NAME: name,
        LAST_NAME: lastName,
        SOURCE_ID: mapping.sourceId,
        COMMENTS: buildContactComment(payload, importedAt),
        PHONE: [
          {
            VALUE: payload.phone,
            VALUE_TYPE: "WORK",
          },
        ],
      },
      params: {
        REGISTER_SONET_EVENT: "N",
      },
    },
    fetchImpl,
  )

  return String(result)
}

async function getBitrixContact(
  webhookUrl: string,
  contactId: string,
  fetchImpl: typeof fetch,
) {
  return callBitrixMethod<Record<string, unknown>>(
    webhookUrl,
    "crm.contact.get",
    { id: contactId },
    fetchImpl,
  )
}

async function findBitrixDuplicateDeal(
  webhookUrl: string,
  mapping: BitrixGatewayMapping,
  payload: AiupGatewayNormalizedPayload,
  contactId: string | null,
  now: Date,
  fetchImpl: typeof fetch,
) {
  const deals = await callBitrixMethod<BitrixDealRecord[]>(
    webhookUrl,
    "crm.deal.list",
    {
      filter: {
        CATEGORY_ID: mapping.categoryId,
      },
      select: [
        "ID",
        "TITLE",
        "COMMENTS",
        "CATEGORY_ID",
        "STAGE_ID",
        "SOURCE_ID",
        "CONTACT_ID",
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceType],
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceName],
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceUrlOrPhone],
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.importedAt],
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.batchId],
      ].filter(Boolean),
    },
    fetchImpl,
  )

  const normalizedPhone = normalizePhone(payload.phone)

  return (
    deals.find((deal) => {
      const comments = cleanString(deal.COMMENTS)
      const contactMatch = contactId ? cleanString(deal.CONTACT_ID) === contactId : false
      const batchCode = mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.batchId]
      const sourceTypeCode = mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceType]
      const sourceNameCode = mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceName]
      const importedAtCode = mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.importedAt]
      const sourceUrlOrPhoneCode = mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceUrlOrPhone]
      const batchMatch = batchCode ? cleanString(deal[batchCode]) === payload.batch_id : comments.includes(payload.batch_id)
      const sourceTypeMatch = sourceTypeCode
        ? cleanString(deal[sourceTypeCode]) === payload.source_type
        : comments.includes(payload.source_type)
      const sourceNameMatch = sourceNameCode
        ? cleanString(deal[sourceNameCode]) === payload.source_name
        : comments.includes(payload.source_name)
      const importedAt = getImportedAtValue(payload, now)
      const importedAtMatch = importedAtCode
        ? cleanString(deal[importedAtCode]) === importedAt
        : comments.includes(importedAt)
      const phoneFieldMatch = sourceUrlOrPhoneCode
        ? normalizePhone(cleanString(deal[sourceUrlOrPhoneCode])) === normalizedPhone
        : false
      const commentMatch = comments.includes(normalizedPhone) || comments.includes(maskPhone(payload.phone))

      return (
        (batchMatch && contactMatch) ||
        (batchMatch && sourceTypeMatch && sourceNameMatch && (commentMatch || phoneFieldMatch)) ||
        (contactMatch && sourceNameMatch && importedAtMatch)
      )
    }) || null
  )
}

export async function processAiupBitrixGatewayRequest(
  input: AiupGatewayInput,
  options: GatewayDependencies & { performWrite: boolean },
): Promise<GatewayResponse> {
  const requestId = options.randomUUID ? options.randomUUID() : crypto.randomUUID()
  const now = (options.now || (() => new Date()))()
  const fetchImpl = options.fetchImpl || fetch
  const readJournal = options.readJournal || readAiupGatewayJournal
  const appendJournalRecord = options.appendJournalRecord || appendAiupGatewayJournalRecord
  const picked = pickAllowedFields(input)
  const normalized = toNormalizedPayload(picked.picked)
  const sanitized = sanitizePayload(normalized)

  let logEntry = buildGatewayLogEntry({
    duplicateResult: "none",
    now,
    payload: normalized,
    requestId,
    validationResult: "rejected",
  })

  try {
    const env = resolveGatewayEnv(options)
    const missingFields = validateRequiredFields(picked.picked)
    if (missingFields.length > 0) {
      return {
        ok: false,
        status: 400,
        body: {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const requestedMode = canonicalizeGatewayMode(normalized.mode)
    if (AIUP_GATEWAY_BLOCKED_MODES.includes(requestedMode as (typeof AIUP_GATEWAY_BLOCKED_MODES)[number])) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "live/prod/production are blocked.",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    if (!AIUP_GATEWAY_ALLOWED_MODES.includes(requestedMode as (typeof AIUP_GATEWAY_ALLOWED_MODES)[number])) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "Only mode=dry_run, mode=test_only, mode=first_real_contact or mode=limited_batch is allowed.",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const effectiveMode =
      requestedMode === AIUP_GATEWAY_DRY_RUN_MODE
        ? env.mode
        : (requestedMode as Exclude<(typeof AIUP_GATEWAY_ALLOWED_MODES)[number], typeof AIUP_GATEWAY_DRY_RUN_MODE>)

    if (requestedMode !== AIUP_GATEWAY_DRY_RUN_MODE && effectiveMode !== env.mode) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "Payload mode does not match configured gateway mode.",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    if (effectiveMode === AIUP_GATEWAY_LIMITED_BATCH_MODE && !env.limitedBatchEnabled) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "limited_batch mode is configured as disabled",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const expectedApprovalToken =
      effectiveMode === AIUP_GATEWAY_FIRST_REAL_CONTACT_MODE && env.firstRealApprovalToken
        ? env.firstRealApprovalToken
        : env.approvalToken

    if (normalized.approval_token !== expectedApprovalToken) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "approval_token is invalid",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const modeValidationError = validatePayloadForMode(normalized, effectiveMode)
    if (modeValidationError) {
      return {
        ok: false,
        status: 403,
        body: {
          error: modeValidationError,
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const journal = await readJournal()
    const dayKey = buildDayKey(now)
    const duplicateKey = buildDuplicateKey(normalized)
    const createdToday = journal.records.filter(
      (record) => record.dayKey === dayKey && record.status === "created",
    ).length
    const isDryRunRequest = !options.performWrite || requestedMode === AIUP_GATEWAY_DRY_RUN_MODE

    if (createdToday >= env.dailyLimit) {
      return {
        ok: false,
        status: 429,
        body: {
          error: `Daily limit reached: ${env.dailyLimit}`,
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const mapping = await resolveBitrixMapping(env.bitrixWebhookUrl, fetchImpl, env)
    const leadDuplicateIds = await findLeadDuplicatesByPhone(env.bitrixWebhookUrl, normalized, fetchImpl)
    if (leadDuplicateIds.length > 0) {
      return {
        ok: false,
        status: 409,
        body: {
          error: "duplicate_detected: existing lead already uses this phone",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const localDuplicate = journal.records.find(
      (record) =>
        record.duplicateKey === duplicateKey && (record.status === "created" || record.status === "duplicate"),
    )
    const contactDuplicateIds = await findContactDuplicatesByPhone(env.bitrixWebhookUrl, normalized, fetchImpl)
    if (contactDuplicateIds.length > 1) {
      return {
        ok: false,
        status: 409,
        body: {
          error: "duplicate_detected: multiple contacts already use this phone",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    const existingContactId = contactDuplicateIds[0] || null
    const bitrixDuplicate = await findBitrixDuplicateDeal(
      env.bitrixWebhookUrl,
      mapping,
      normalized,
      existingContactId,
      now,
      fetchImpl,
    )

    const duplicateResult = localDuplicate ? "local_journal" : bitrixDuplicate ? "bitrix" : "none"
    const duplicateDealId = localDuplicate?.bitrixDealId || cleanString(bitrixDuplicate?.ID) || undefined
    const dryRunContactAction = existingContactId ? "existing" : "created"

    if (isDryRunRequest) {
      logEntry = buildGatewayLogEntry({
        bitrixResult: "not_sent",
        duplicateResult,
        now,
        payload: normalized,
        requestId,
        validationResult: "accepted",
      })

      return {
        ok: true,
        status: 200,
        body: {
          bitrix: {
            category_id: mapping.categoryId,
            category_name: mapping.categoryName,
            contact_action: dryRunContactAction,
            contact_id: existingContactId || undefined,
            created_contact_id: undefined,
            created_deal_id: duplicateDealId,
            source_id: mapping.sourceId,
            source_name: mapping.sourceName,
            stage_id: mapping.startStageId,
            stage_name: mapping.startStageName,
          },
          check_summary: {
            daily_limit_remaining: Math.max(env.dailyLimit - createdToday, 0),
            duplicate_result: duplicateResult,
            existing_lead_ids: leadDuplicateIds,
            ignored_fields: picked.ignored,
            journal_store_path: getAiupGatewayStorePath(),
          },
          log_entry: logEntry,
          mapping: {
            field_codes: mapping.fieldCodes,
          },
          ok: true,
          request_id: requestId,
          result: localDuplicate || bitrixDuplicate ? "duplicate" : "dry_run",
          sanitized_payload: sanitized,
        },
      }
    }

    if (localDuplicate) {
      logEntry = buildGatewayLogEntry({
        bitrixResult: "duplicate",
        duplicateResult: "local_journal",
        now,
        payload: normalized,
        requestId,
        validationResult: "accepted",
      })

      return {
        ok: true,
        status: 200,
        body: {
          bitrix: {
            category_id: mapping.categoryId,
            category_name: mapping.categoryName,
            contact_action: existingContactId ? "existing" : undefined,
            contact_id: existingContactId || localDuplicate.bitrixContactId || undefined,
            created_deal_id: localDuplicate.bitrixDealId || undefined,
            source_id: mapping.sourceId,
            source_name: mapping.sourceName,
            stage_id: mapping.startStageId,
            stage_name: mapping.startStageName,
          },
          check_summary: {
            daily_limit_remaining: Math.max(env.dailyLimit - createdToday, 0),
            duplicate_result: "local_journal",
            existing_lead_ids: leadDuplicateIds,
            ignored_fields: picked.ignored,
            journal_store_path: getAiupGatewayStorePath(),
          },
          log_entry: logEntry,
          mapping: {
            field_codes: mapping.fieldCodes,
          },
          ok: true,
          request_id: requestId,
          result: "duplicate",
          sanitized_payload: sanitized,
        },
      }
    }

    if (bitrixDuplicate) {
      logEntry = buildGatewayLogEntry({
        bitrixResult: "duplicate",
        duplicateResult: "bitrix",
        now,
        payload: normalized,
        requestId,
        validationResult: "accepted",
      })

      await appendJournalRecord({
        batchId: normalized.batch_id,
        bitrixContactId: existingContactId,
        bitrixDealId: cleanString(bitrixDuplicate.ID) || null,
        createdAt: now.toISOString(),
        dayKey,
        duplicateKey,
        phoneMasked: sanitized.phone_masked,
        requestId,
        sourceName: normalized.source_name,
        sourceType: normalized.source_type,
        status: "duplicate",
      })

      return {
        ok: true,
        status: 200,
        body: {
          bitrix: {
            category_id: mapping.categoryId,
            category_name: mapping.categoryName,
            contact_action: existingContactId ? "existing" : undefined,
            contact_id: existingContactId || undefined,
            created_deal_id: cleanString(bitrixDuplicate.ID) || undefined,
            source_id: mapping.sourceId,
            source_name: mapping.sourceName,
            stage_id: mapping.startStageId,
            stage_name: mapping.startStageName,
          },
          check_summary: {
            daily_limit_remaining: Math.max(env.dailyLimit - createdToday, 0),
            duplicate_result: "bitrix",
            existing_lead_ids: leadDuplicateIds,
            ignored_fields: picked.ignored,
            journal_store_path: getAiupGatewayStorePath(),
          },
          log_entry: logEntry,
          mapping: {
            field_codes: mapping.fieldCodes,
          },
          ok: true,
          request_id: requestId,
          result: "duplicate",
          sanitized_payload: sanitized,
        },
      }
    }

    const contactId =
      existingContactId || (await createBitrixContact(env.bitrixWebhookUrl, mapping, normalized, now, fetchImpl))
    const contactAction: "created" | "existing" = existingContactId ? "existing" : "created"
    const payloadForBitrix = buildBitrixDealPayload(mapping, normalized, now, contactId)
    const resultType = "created"

    logEntry = buildGatewayLogEntry({
      bitrixResult: options.performWrite ? "created" : "not_sent",
      duplicateResult: "none",
      now,
      payload: normalized,
      requestId,
      validationResult: "accepted",
    })

    const createdDealId = await callBitrixMethod<number>(
      env.bitrixWebhookUrl,
      "crm.deal.add",
      payloadForBitrix,
      fetchImpl,
    )

    await appendJournalRecord({
      batchId: normalized.batch_id,
      bitrixContactId: contactId,
      bitrixDealId: String(createdDealId),
      createdAt: now.toISOString(),
      dayKey,
      duplicateKey,
      phoneMasked: sanitized.phone_masked,
      requestId,
      sourceName: normalized.source_name,
      sourceType: normalized.source_type,
      status: "created",
    })

    return {
      ok: true,
      status: 200,
      body: {
        bitrix: {
          category_id: mapping.categoryId,
          category_name: mapping.categoryName,
          contact_action: contactAction,
          contact_id: contactId,
          created_deal_id: String(createdDealId),
          created_contact_id: contactAction === "created" ? contactId : undefined,
          source_id: mapping.sourceId,
          source_name: mapping.sourceName,
          stage_id: mapping.startStageId,
          stage_name: mapping.startStageName,
        },
        check_summary: {
          daily_limit_remaining: Math.max(env.dailyLimit - createdToday - 1, 0),
          duplicate_result: "none",
          existing_lead_ids: leadDuplicateIds,
          ignored_fields: picked.ignored,
          journal_store_path: getAiupGatewayStorePath(),
        },
        log_entry: logEntry,
        mapping: {
          field_codes: mapping.fieldCodes,
        },
        ok: true,
        request_id: requestId,
        result: resultType,
        sanitized_payload: sanitized,
      },
    }
  } catch (error) {
    return {
      ok: false,
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "gateway_failed",
        ignored_fields: picked.ignored,
        log_entry: logEntry,
        ok: false,
        request_id: requestId,
        sanitized_payload: sanitized,
      },
    }
  }
}

export async function verifyAiupGatewayBitrixDeal(args: {
  bitrixWebhookUrl: string
  dealId: string
  fetchImpl?: typeof fetch
}) {
  const fetchImpl = args.fetchImpl || fetch
  const deal = await callBitrixMethod<Record<string, unknown>>(
    args.bitrixWebhookUrl,
    "crm.deal.get",
    { id: args.dealId },
    fetchImpl,
  )
  const activities = await callBitrixMethod<Record<string, unknown>[]>(
    args.bitrixWebhookUrl,
    "crm.activity.list",
    {
      filter: {
        OWNER_TYPE_ID: 2,
        OWNER_ID: args.dealId,
      },
    },
    fetchImpl,
  )

  return {
    activities_count: activities.length,
    contact_id: cleanString(deal.CONTACT_ID),
    category_id: cleanString(deal.CATEGORY_ID),
    id: cleanString(deal.ID),
    source_id: cleanString(deal.SOURCE_ID),
    stage_id: cleanString(deal.STAGE_ID),
    title: cleanString(deal.TITLE),
  }
}

export function buildAiupGatewayTestPayload(
  approvalToken: string,
  overrides: Partial<Record<AllowedFieldName, string>> = {},
) {
  return {
    approval_token: approvalToken,
    batch_id: "aiup-gateway-test-2026-06-08-001",
    channel: "gateway_test",
    imported_at: "2026-06-11T10:00:00+03:00",
    manager_comment:
      "Тестовая запись через controlled webhook gateway. Не звонить. Не писать. Не ставить задачи. Не обрабатывать как клиента.",
    mode: AIUP_GATEWAY_TEST_ONLY_MODE,
    name: "TEST / AI-UP / gateway / не обрабатывать",
    phone: AIUP_GATEWAY_TEST_PHONE,
    region: "Ростов-на-Дону / Ростовская область",
    source_name: "TEST_GATEWAY",
    source_type: "test_only_gateway",
    source_url_or_phone: "https://example.com/gateway-test",
    source_domain: "example.com",
    request_type: "not_direct_request",
    ai_up_source: "true",
    call_script_required: "soft_interest_check",
    opt_out_status: "active",
    do_not_claim_competitor_application: "true",
    status: "test_only_gateway",
    ...overrides,
  } satisfies Record<AllowedFieldName, string>
}
