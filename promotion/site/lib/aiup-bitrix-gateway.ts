// Purpose: local-only AI-UP -> Bitrix24 test gateway with hard test-mode guards, duplicate checks and safe logging.

import {
  appendAiupGatewayJournalRecord,
  buildDayKey,
  getAiupGatewayStorePath,
  readAiupGatewayJournal,
} from "./aiup-bitrix-gateway-store.ts"

export const AIUP_GATEWAY_ENDPOINT_PATH = "/api/aiup/bitrix-test"
export const AIUP_GATEWAY_MODE_REQUIRED = "test"
export const AIUP_GATEWAY_MANUAL_GATE_REQUIRED = "test-only-enabled"
export const AIUP_GATEWAY_TEST_PHONE = "+79990000000"
export const AIUP_GATEWAY_MAX_DAILY_DEFAULT = 5

export const AIUP_GATEWAY_BITRIX_CATEGORY_NAME = "AI-UP / Test"
export const AIUP_GATEWAY_BITRIX_STAGE_NAME = "Новый AI-UP контакт"
export const AIUP_GATEWAY_BITRIX_SOURCE_NAME = "AI-UP"

export const AIUP_GATEWAY_FIELD_LABELS = {
  sourceType: "AI-UP Source Type",
  sourceName: "AI-UP Source Name",
  sourceUrlOrPhone: "AI-UP Source URL or Phone",
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
  "name",
  "phone",
  "source_type",
  "source_name",
  "source_url_or_phone",
  "region",
  "channel",
  "status",
  "manager_comment",
] as const

export const AIUP_GATEWAY_REQUIRED_FIELDS = [
  "mode",
  "approval_token",
  "batch_id",
  "name",
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
  manager_comment: string
  mode: string
  name: string
  phone: string
  region: string
  source_name: string
  source_type: string
  source_url_or_phone: string
  status: string
}

type AiupGatewaySanitizedPayload = Omit<AiupGatewayNormalizedPayload, "approval_token" | "phone"> & {
  phone_masked: string
}

type BitrixFieldLabel = (typeof AIUP_GATEWAY_FIELD_LABELS)[keyof typeof AIUP_GATEWAY_FIELD_LABELS]

type BitrixGatewayMapping = {
  categoryId: string
  categoryName: string
  fieldCodes: Record<BitrixFieldLabel, string>
  sourceId: string
  sourceName: string
  startStageId: string
  startStageName: string
}

type GatewayEnv = {
  approvalToken: string
  bitrixWebhookUrl: string
  dailyLimit: number
  manualGate: string
  mode: string
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
    created_deal_id?: string
    source_id: string
    source_name: string
    stage_id: string
    stage_name: string
  }
  check_summary: {
    daily_limit_remaining: number
    duplicate_result: "bitrix" | "local_journal" | "none"
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

type GatewayDependencies = {
  appendJournalRecord?: typeof appendAiupGatewayJournalRecord
  bitrixWebhookUrl?: string
  env?: Partial<GatewayEnv>
  fetchImpl?: typeof fetch
  now?: () => Date
  randomUUID?: () => string
  readJournal?: typeof readAiupGatewayJournal
}

type BitrixDealRecord = Record<string, unknown>

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePhone(value: string) {
  return cleanString(value).replace(/[^\d+]/g, "")
}

function lowerSafe(value: unknown) {
  return cleanString(value).toLowerCase()
}

function maskPhone(phone: string) {
  const normalized = normalizePhone(phone)
  const digits = normalized.replace(/\D/g, "")

  if (digits.length < 6) {
    return normalized || "+"
  }

  return `+${digits.slice(0, 4)}******${digits.slice(-2)}`
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
    manager_comment: cleanString(payload.manager_comment),
    mode: cleanString(payload.mode),
    name: cleanString(payload.name),
    phone: normalizePhone(payload.phone),
    region: cleanString(payload.region),
    source_name: cleanString(payload.source_name),
    source_type: cleanString(payload.source_type),
    source_url_or_phone: cleanString(payload.source_url_or_phone),
    status: cleanString(payload.status),
  }
}

function sanitizePayload(payload: AiupGatewayNormalizedPayload): AiupGatewaySanitizedPayload {
  return {
    batch_id: payload.batch_id,
    channel: payload.channel,
    manager_comment: payload.manager_comment,
    mode: payload.mode,
    name: payload.name,
    phone_masked: maskPhone(payload.phone),
    region: payload.region,
    source_name: payload.source_name,
    source_type: payload.source_type,
    source_url_or_phone: payload.source_url_or_phone,
    status: payload.status,
  }
}

function buildDuplicateKey(payload: AiupGatewayNormalizedPayload) {
  return [
    normalizePhone(payload.phone),
    lowerSafe(payload.source_type),
    lowerSafe(payload.source_name),
    lowerSafe(payload.batch_id),
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
  const mode = cleanString(env.mode ?? process.env.AIUP_GATEWAY_MODE)
  const manualGate = cleanString(env.manualGate ?? process.env.AIUP_GATEWAY_MANUAL_GATE)
  const approvalToken = cleanString(env.approvalToken ?? process.env.AIUP_GATEWAY_APPROVAL_TOKEN)
  const bitrixWebhookUrl = cleanString(
    env.bitrixWebhookUrl ?? deps.bitrixWebhookUrl ?? process.env.BITRIX24_TEST_CRM_WEBHOOK_URL,
  )
  const dailyLimitRaw = cleanString(
    String(env.dailyLimit ?? process.env.AIUP_GATEWAY_DAILY_LIMIT ?? AIUP_GATEWAY_MAX_DAILY_DEFAULT),
  )
  const dailyLimit = parsePositiveInteger(dailyLimitRaw)

  if (mode !== AIUP_GATEWAY_MODE_REQUIRED) {
    throw new Error("AIUP_GATEWAY_MODE must be test")
  }

  if (manualGate !== AIUP_GATEWAY_MANUAL_GATE_REQUIRED) {
    throw new Error("AIUP_GATEWAY_MANUAL_GATE must be test-only-enabled")
  }

  if (!approvalToken) {
    throw new Error("AIUP_GATEWAY_APPROVAL_TOKEN is not configured")
  }

  if (!bitrixWebhookUrl) {
    throw new Error("BITRIX24_TEST_CRM_WEBHOOK_URL is not configured")
  }

  if (!dailyLimit) {
    throw new Error("AIUP_GATEWAY_DAILY_LIMIT must be a positive integer")
  }

  return {
    approvalToken,
    bitrixWebhookUrl,
    dailyLimit,
    manualGate,
    mode,
  }
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

async function resolveBitrixMapping(
  webhookUrl: string,
  fetchImpl: typeof fetch,
): Promise<BitrixGatewayMapping> {
  const categories = await callBitrixMethod<Array<Record<string, unknown>>>(
    webhookUrl,
    "crm.dealcategory.list",
    {},
    fetchImpl,
  )
  const category = requireSingleMatch(
    categories.filter((item) => cleanString(item.NAME) === AIUP_GATEWAY_BITRIX_CATEGORY_NAME),
    "AI-UP / Test category",
    (item) => cleanString(item.NAME),
  )

  const categoryId = cleanString(category.ID)
  const stageRows = await callBitrixMethod<Array<Record<string, unknown>>>(
    webhookUrl,
    "crm.status.list",
    {
      filter: {
        ENTITY_ID: `DEAL_STAGE_${categoryId}`,
      },
    },
    fetchImpl,
  )

  const startStage = requireSingleMatch(
    stageRows.filter((item) => cleanString(item.NAME) === AIUP_GATEWAY_BITRIX_STAGE_NAME),
    "AI-UP / Test start stage",
    (item) => cleanString(item.NAME),
  )

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

  const fieldCodes = {} as Record<BitrixFieldLabel, string>

  for (const fieldLabel of Object.values(AIUP_GATEWAY_FIELD_LABELS)) {
    const matches = Object.entries(dealFields)
      .filter(([, value]) => {
        const formLabel = cleanString(value.formLabel)
        const listLabel = cleanString(value.listLabel)
        const filterLabel = cleanString(value.filterLabel)
        return formLabel === fieldLabel || listLabel === fieldLabel || filterLabel === fieldLabel
      })
      .map(([fieldCode]) => fieldCode)

    fieldCodes[fieldLabel] = requireSingleMatch(matches, `${fieldLabel} custom field`, (item) => item)
  }

  return {
    categoryId,
    categoryName: cleanString(category.NAME),
    fieldCodes,
    sourceId: cleanString(source.STATUS_ID),
    sourceName: cleanString(source.NAME),
    startStageId: cleanString(startStage.STATUS_ID),
    startStageName: cleanString(startStage.NAME),
  }
}

function buildBitrixDealPayload(mapping: BitrixGatewayMapping, payload: AiupGatewayNormalizedPayload, now: Date) {
  const importedAt = now.toISOString()
  const comments = [
    "TEST ONLY / controlled webhook gateway",
    `Phone: ${payload.phone}`,
    `Source type: ${payload.source_type}`,
    `Source name: ${payload.source_name}`,
    `Batch ID: ${payload.batch_id}`,
    `Source URL or Phone: ${payload.source_url_or_phone || "-"}`,
    `Manager comment: ${payload.manager_comment || "-"}`,
  ].join("\n")

  return {
    fields: {
      TITLE: payload.name,
      CATEGORY_ID: mapping.categoryId,
      STAGE_ID: mapping.startStageId,
      SOURCE_ID: mapping.sourceId,
      COMMENTS: comments,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceType]]: payload.source_type,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceName]]: payload.source_name,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceUrlOrPhone]]: payload.source_url_or_phone,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.region]]: payload.region,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.importedAt]]: importedAt,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.status]]: payload.status,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.channel]]: payload.channel,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.managerComment]]: payload.manager_comment,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.callAttempts]]: "0",
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.contactQuality]]: payload.status,
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.nextStep]]: "Не обрабатывать",
      [mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.batchId]]: payload.batch_id,
    },
    params: {
      REGISTER_SONET_EVENT: "N",
    },
  }
}

async function findBitrixDuplicateDeal(
  webhookUrl: string,
  mapping: BitrixGatewayMapping,
  payload: AiupGatewayNormalizedPayload,
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
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceType],
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceName],
        mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.batchId],
      ],
    },
    fetchImpl,
  )

  const normalizedPhone = normalizePhone(payload.phone)

  return (
    deals.find((deal) => {
      const batchMatch =
        cleanString(deal[mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.batchId]]) === payload.batch_id
      const sourceTypeMatch =
        cleanString(deal[mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceType]]) === payload.source_type
      const sourceNameMatch =
        cleanString(deal[mapping.fieldCodes[AIUP_GATEWAY_FIELD_LABELS.sourceName]]) === payload.source_name
      const commentMatch = cleanString(deal.COMMENTS).includes(normalizedPhone)

      return batchMatch && sourceTypeMatch && sourceNameMatch && commentMatch
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

    const forbiddenMode = lowerSafe(normalized.mode)
    if (forbiddenMode !== "test") {
      return {
        ok: false,
        status: 403,
        body: {
          error: "Only mode=test is allowed. live/prod/production are blocked.",
          ignored_fields: picked.ignored,
          log_entry: logEntry,
          ok: false,
          request_id: requestId,
          sanitized_payload: sanitized,
        },
      }
    }

    if (normalized.approval_token !== env.approvalToken) {
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

    if (normalized.phone !== AIUP_GATEWAY_TEST_PHONE) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "Only the dedicated test phone is allowed",
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

    if (!options.performWrite) {
      logEntry = buildGatewayLogEntry({
        bitrixResult: "not_sent",
        duplicateResult: "none",
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
            category_id: "",
            category_name: AIUP_GATEWAY_BITRIX_CATEGORY_NAME,
            source_id: "",
            source_name: AIUP_GATEWAY_BITRIX_SOURCE_NAME,
            stage_id: "",
            stage_name: AIUP_GATEWAY_BITRIX_STAGE_NAME,
          },
          check_summary: {
            daily_limit_remaining: Math.max(env.dailyLimit - createdToday, 0),
            duplicate_result: "none",
            ignored_fields: picked.ignored,
            journal_store_path: getAiupGatewayStorePath(),
          },
          log_entry: logEntry,
          mapping: {
            field_codes: {},
          },
          ok: true,
          request_id: requestId,
          result: "dry_run",
          sanitized_payload: sanitized,
        },
      }
    }

    const mapping = await resolveBitrixMapping(env.bitrixWebhookUrl, fetchImpl)

    const localDuplicate = journal.records.find(
      (record) =>
        record.duplicateKey === duplicateKey && (record.status === "created" || record.status === "duplicate"),
    )

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
            created_deal_id: localDuplicate.bitrixDealId || undefined,
            source_id: mapping.sourceId,
            source_name: mapping.sourceName,
            stage_id: mapping.startStageId,
            stage_name: mapping.startStageName,
          },
          check_summary: {
            daily_limit_remaining: Math.max(env.dailyLimit - createdToday, 0),
            duplicate_result: "local_journal",
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

    const bitrixDuplicate = await findBitrixDuplicateDeal(
      env.bitrixWebhookUrl,
      mapping,
      normalized,
      fetchImpl,
    )

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
            created_deal_id: cleanString(bitrixDuplicate.ID) || undefined,
            source_id: mapping.sourceId,
            source_name: mapping.sourceName,
            stage_id: mapping.startStageId,
            stage_name: mapping.startStageName,
          },
          check_summary: {
            daily_limit_remaining: Math.max(env.dailyLimit - createdToday, 0),
            duplicate_result: "bitrix",
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

    const payloadForBitrix = buildBitrixDealPayload(mapping, normalized, now)
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
          created_deal_id: String(createdDealId),
          source_id: mapping.sourceId,
          source_name: mapping.sourceName,
          stage_id: mapping.startStageId,
          stage_name: mapping.startStageName,
        },
        check_summary: {
          daily_limit_remaining: Math.max(env.dailyLimit - createdToday - 1, 0),
          duplicate_result: "none",
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
    category_id: cleanString(deal.CATEGORY_ID),
    id: cleanString(deal.ID),
    source_id: cleanString(deal.SOURCE_ID),
    stage_id: cleanString(deal.STAGE_ID),
    title: cleanString(deal.TITLE),
  }
}

export function buildAiupGatewayTestPayload(approvalToken: string) {
  return {
    approval_token: approvalToken,
    batch_id: "aiup-gateway-test-2026-06-08-001",
    channel: "gateway_test",
    manager_comment:
      "Тестовая запись через controlled webhook gateway. Не звонить. Не писать. Не ставить задачи. Не обрабатывать как клиента.",
    mode: "test",
    name: "TEST / AI-UP / gateway / не обрабатывать",
    phone: AIUP_GATEWAY_TEST_PHONE,
    region: "Ростов-на-Дону / Ростовская область",
    source_name: "TEST_GATEWAY",
    source_type: "test_only_gateway",
    source_url_or_phone: "https://example.com/gateway-test",
    status: "test_only_gateway",
  } satisfies Record<AllowedFieldName, string>
}
