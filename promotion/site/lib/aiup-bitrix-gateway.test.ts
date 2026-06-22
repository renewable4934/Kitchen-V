import test from "node:test"
import assert from "node:assert/strict"

import {
  AIUP_GATEWAY_ALLOWED_MODES,
  AIUP_GATEWAY_ALLOWED_FIELDS,
  AIUP_GATEWAY_BITRIX_CATEGORY_NAME,
  AIUP_GATEWAY_BITRIX_SOURCE_NAME,
  AIUP_GATEWAY_BITRIX_STAGE_NAME,
  AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_REGIONS,
  AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS,
  AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
  AIUP_GATEWAY_FIELD_LABELS,
  AIUP_GATEWAY_MANUAL_GATE_REQUIRED,
  AIUP_GATEWAY_MODE_REQUIRED,
  AIUP_GATEWAY_SAFE_MANAGER_SCRIPT,
  AIUP_GATEWAY_TEST_PHONE,
  buildAiupGatewayTestPayload,
  processAiupNativeWebhookRequest,
  processAiupBitrixGatewayRequest,
} from "./aiup-bitrix-gateway.ts"

type StubJournalRecord = {
  batchId: string
  bitrixContactId?: string | null
  bitrixDealId?: string | null
  createdAt: string
  dayKey: string
  duplicateKey: string
  phoneMasked: string
  requestId: string
  sourceName: string
  sourceType: string
  status: "created" | "duplicate" | "dry_run" | "rejected" | "verification_only"
}

type StubDeal = Record<string, string>
type StubContact = Record<string, string | Array<Record<string, string>>>

function createFakeBitrixFields() {
  return Object.fromEntries(
    Object.entries(AIUP_GATEWAY_FIELD_LABELS).map(([key, label], index) => [
      `UF_CRM_FAKE_${index + 1}`,
      {
        filterLabel: label,
        formLabel: label,
        listLabel: label,
        title: `UF_CRM_FAKE_${key.toUpperCase()}`,
        type: "string",
      },
    ]),
  )
}

function createGatewayTestHarness(options?: {
  existingDeals?: StubDeal[]
  existingContacts?: StubContact[]
  journalRecords?: Array<Record<string, string>>
  overrideEnv?: Partial<{
    approvalToken: string
    bitrixWebhookUrl: string
    dailyLimit: number
    firstRealApprovalToken: string
    limitedBatchEnabled: boolean
    manualGate: string
    mode: (typeof AIUP_GATEWAY_ALLOWED_MODES)[number]
  }>
  sourceRows?: Array<Record<string, string>>
  stageRows?: Array<Record<string, string>>
  categories?: Array<Record<string, string>>
}) {
  const capturedRequests: Array<{ method: string; body: string }> = []
  const createdDeals = options?.existingDeals ? [...options.existingDeals] : []
  const createdContacts = options?.existingContacts ? [...options.existingContacts] : []
  const journal: { records: StubJournalRecord[] } = {
    records: (options?.journalRecords || []).map((record) => ({
      batchId: record.batchId,
      bitrixContactId: record.bitrixContactId ?? null,
      bitrixDealId: record.bitrixDealId ?? null,
      createdAt: record.createdAt,
      dayKey: record.dayKey,
      duplicateKey: record.duplicateKey,
      phoneMasked: record.phoneMasked,
      requestId: record.requestId,
      sourceName: record.sourceName,
      sourceType: record.sourceType,
      status: record.status as "created" | "duplicate" | "dry_run" | "rejected" | "verification_only",
    })),
  }

  const fakeFetch: typeof fetch = (async (input, init) => {
    const url = String(input)
    const method = url.match(/\/([^/]+)\.json$/)?.[1] || "unknown"
    const body = init?.body instanceof URLSearchParams ? init.body.toString() : String(init?.body || "")
    capturedRequests.push({ method, body })
    const params = new URLSearchParams(body)

    if (method === "crm.dealcategory.list") {
      return Response.json({
        result: options?.categories || [{ ID: "0", NAME: AIUP_GATEWAY_BITRIX_CATEGORY_NAME, SORT: "10" }],
      })
    }

    if (method === "crm.status.list") {
      const entityId = params.get("filter[ENTITY_ID]")
      if (entityId === "SOURCE") {
        return Response.json({
          result:
            options?.sourceRows || [
              { NAME: "WEB", STATUS_ID: "WEB" },
              { NAME: AIUP_GATEWAY_BITRIX_SOURCE_NAME, STATUS_ID: "1" },
            ],
        })
      }

      if (entityId === "DEAL_STAGE") {
        return Response.json({
          result:
            options?.stageRows || [
              { ENTITY_ID: "DEAL_STAGE", ID: "107", NAME: AIUP_GATEWAY_BITRIX_STAGE_NAME, SORT: "10", STATUS_ID: "NEW" },
              { ENTITY_ID: "DEAL_STAGE", ID: "109", NAME: "Связь установлена", SORT: "20", STATUS_ID: "PREPARATION" },
            ],
        })
      }

      return Response.json({ result: [] })
    }

    if (method === "crm.deal.fields") {
      return Response.json({ result: createFakeBitrixFields() })
    }

    if (method === "crm.deal.list") {
      return Response.json({ result: createdDeals })
    }

    if (method === "crm.duplicate.findbycomm") {
      const entityType = params.get("entity_type")
      const value = (params.getAll("values[]")[0] || "").replace(/[^\d+]/g, "")
      if (entityType === "LEAD") {
        return Response.json({ result: { LEAD: [] } })
      }

      if (entityType === "CONTACT") {
        const matches = createdContacts
          .filter((contact) =>
            ((contact.PHONE as Array<Record<string, string>> | undefined) || []).some(
              (phone) => (phone.VALUE || "").replace(/[^\d+]/g, "") === value,
            ),
          )
          .map((contact) => Number(contact.ID))
        return Response.json({ result: { CONTACT: matches } })
      }
    }

    if (method === "crm.contact.add") {
      const nextId = String(createdContacts.length + 200)
      createdContacts.push({
        COMMENTS: params.get("fields[COMMENTS]") || "",
        ID: nextId,
        LAST_NAME: params.get("fields[LAST_NAME]") || "",
        NAME: params.get("fields[NAME]") || "",
        PHONE: [
          {
            VALUE: params.get("fields[PHONE][0][VALUE]") || "",
            VALUE_TYPE: params.get("fields[PHONE][0][VALUE_TYPE]") || "WORK",
          },
        ],
        SOURCE_ID: params.get("fields[SOURCE_ID]") || "",
      })
      return Response.json({ result: Number(nextId) })
    }

    if (method === "crm.contact.get") {
      return Response.json({
        result:
          createdContacts.find((contact) => String(contact.ID) === params.get("id")) || {
            ID: params.get("id") || "",
            NAME: "TEST",
            LAST_NAME: "CONTACT",
            PHONE: [],
            SOURCE_ID: "1",
          },
      })
    }

    if (method === "crm.deal.add") {
      const nextId = String(createdDeals.length + 100)
      createdDeals.push({
        CATEGORY_ID: params.get("fields[CATEGORY_ID]") || "",
        COMMENTS: params.get("fields[COMMENTS]") || "",
        CONTACT_ID: params.get("fields[CONTACT_ID]") || "",
        ID: nextId,
        SOURCE_ID: params.get("fields[SOURCE_ID]") || "",
        STAGE_ID: params.get("fields[STAGE_ID]") || "",
        TITLE: params.get("fields[TITLE]") || "",
        [Object.keys(createFakeBitrixFields())[0]]: params.get(`fields[${Object.keys(createFakeBitrixFields())[0]}]`) || "",
      })
      return Response.json({ result: Number(nextId) })
    }

    if (method === "crm.deal.get") {
      return Response.json({
        result:
          createdDeals.find((deal) => deal.ID === params.get("id")) || {
            CATEGORY_ID: "0",
            CONTACT_ID: "",
            ID: params.get("id") || "",
            SOURCE_ID: "1",
            STAGE_ID: "NEW",
            TITLE: "TEST",
          },
      })
    }

    if (method === "crm.activity.list") {
      return Response.json({ result: [] })
    }

    throw new Error(`Unexpected method ${method}`)
  }) as typeof fetch

  const mode: (typeof AIUP_GATEWAY_ALLOWED_MODES)[number] = options?.overrideEnv?.mode ?? AIUP_GATEWAY_MODE_REQUIRED

  return {
    capturedRequests,
    createdContacts,
    createdDeals,
    deps: {
      appendJournalRecord: async (record: StubJournalRecord) => {
        journal.records.push(record)
      },
      env: {
        approvalToken: "test-approval-token",
        bitrixWebhookUrl: "https://example.invalid/rest/13/fake/",
        dailyLimit: 5,
        firstRealApprovalToken: "first-real-token",
        limitedBatchEnabled: false,
        manualGate: AIUP_GATEWAY_MANUAL_GATE_REQUIRED,
        mode,
        ...options?.overrideEnv,
      },
      fetchImpl: fakeFetch,
      now: () => new Date("2026-06-08T10:00:00.000Z"),
      randomUUID: () => "request-1",
      readJournal: async () => journal,
    },
    journal,
  }
}

test("rejects missing mode", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")
  delete (payload as Partial<typeof payload>).mode

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 400)
})

for (const blockedMode of ["live", "prod", "production"]) {
  test(`rejects blocked mode ${blockedMode}`, async () => {
    const harness = createGatewayTestHarness()
    const payload = buildAiupGatewayTestPayload("test-approval-token")
    payload.mode = blockedMode

    const result = await processAiupBitrixGatewayRequest(payload, {
      ...harness.deps,
      performWrite: false,
    })

    assert.equal(result.ok, false)
    assert.equal(result.status, 403)
  })
}

test("rejects any non-test mode", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")
  payload.mode = "preview"

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 403)
})

test("rejects when payload mode does not match configured gateway mode", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 403)
  assert.equal(result.body.error.includes("does not match"), true)
})

test("rejects wrong approval token", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("wrong-token")

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 403)
})

test("rejects missing approval token field", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")
  delete (payload as Partial<typeof payload>).approval_token

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 400)
})

test("rejects when manual gate is missing", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      manualGate: "",
    },
  })
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 500)
  assert.equal(result.body.error.includes("AIUP_GATEWAY_MANUAL_GATE"), true)
})

test("rejects when manual gate value is not test-only-enabled", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      manualGate: "disabled",
    },
  })
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 500)
  assert.equal(result.body.error.includes("AIUP_GATEWAY_MANUAL_GATE"), true)
})

test("rejects non-test phone", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")
  payload.phone = "+79991112233"

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 403)
})

test("accepts first_real_test dry run with allowlisted source and region", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      dailyLimit: 15,
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const payload = buildAiupGatewayTestPayload("first-real-token", {
    batch_id: "aiup-first-real-test-2026-06-09-001",
    channel: "first_real_test",
    mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    name: "TEST / AI-UP / first real test / не обрабатывать",
    phone: "+79991112233",
    source_name: "legokuhni.ru",
    source_type: "behavioral_interest",
    source_url_or_phone: `https://${AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS[0]}/`,
    region: "Ростов-на-Дону / Ростовская область",
    status: "first_real_test",
  })

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, true)
  assert.equal(result.body.result, "dry_run")
  assert.equal(result.body.log_entry.validationResult, "accepted")
  assert.equal(result.body.check_summary.daily_limit_remaining, 15)
})

test("accepts AI-UP native webhook dry run for allowlisted source", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      dailyLimit: 15,
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const originalNativeGate = process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED
  process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED = "enabled"
  const nativeTestPhone = ["7", "999", "111", "22", "33"].join("")

  try {
    const result = await processAiupNativeWebhookRequest(
      {
        Контакты: [
          {
            Дата: "11.06.2026",
            "Тип взаимодействия": "Посещение",
            Источник: "legokuhni.ru",
            Телефон: nativeTestPhone,
            Канал: "Vault Core",
          },
        ],
      },
      {
        ...harness.deps,
        nativeRequestToken: "first-real-token",
        performWrite: false,
      },
    )

    assert.equal(result.ok, true)
    assert.equal(result.body.ok, true)
    assert.equal(result.body.result, "dry_run")
    assert.equal(result.body.contacts_total, 1)
    assert.equal(result.body.contacts_dry_run, 1)
    assert.equal(JSON.stringify(result.body).includes(nativeTestPhone), false)
  } finally {
    if (originalNativeGate === undefined) {
      delete process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED
    } else {
      process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED = originalNativeGate
    }
  }
})

test("AI-UP native webhook does not write disallowed source", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      dailyLimit: 15,
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const originalNativeGate = process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED
  process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED = "enabled"
  const nativeTestPhone = ["7", "999", "111", "22", "33"].join("")

  try {
    const result = await processAiupNativeWebhookRequest(
      {
        Контакты: [
          {
            Дата: "11.06.2026",
            "Тип взаимодействия": "Посещение",
            Источник: "example.com",
            Телефон: nativeTestPhone,
            Канал: "Vault Core",
          },
        ],
      },
      {
        ...harness.deps,
        nativeRequestToken: "first-real-token",
        performWrite: true,
      },
    )

    assert.equal(result.ok, true)
    assert.equal(result.body.ok, true)
    assert.equal(result.body.result, "verification_only")
    assert.equal(result.body.contacts_rejected, 1)
    assert.equal(harness.capturedRequests.some((request) => request.method === "crm.deal.add"), false)
  } finally {
    if (originalNativeGate === undefined) {
      delete process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED
    } else {
      process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED = originalNativeGate
    }
  }
})

test("AI-UP native webhook rejects missing request token", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      dailyLimit: 6,
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const originalNativeGate = process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED
  process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED = "enabled"

  try {
    const result = await processAiupNativeWebhookRequest(
      {
        Контакты: [
          {
            Дата: "11.06.2026",
            Источник: "legokuhni.ru",
            Телефон: ["7", "999", "111", "22", "33"].join(""),
          },
        ],
      },
      {
        ...harness.deps,
        performWrite: true,
      },
    )

    assert.equal(result.ok, false)
    assert.equal(result.status, 403)
    assert.equal(harness.capturedRequests.some((request) => request.method === "crm.deal.add"), false)
  } finally {
    if (originalNativeGate === undefined) {
      delete process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED
    } else {
      process.env.AIUP_GATEWAY_NATIVE_WEBHOOK_ENABLED = originalNativeGate
    }
  }
})

test("rejects first_real_test source outside allowlist", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const payload = buildAiupGatewayTestPayload("first-real-token", {
    mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    phone: "+79991112233",
    source_type: "behavioral_interest",
    source_url_or_phone: "https://example.com/not-allowed",
    region: AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_REGIONS[2],
    status: "first_real_test",
  })

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 403)
  assert.equal(result.body.error.includes("source sites"), true)
})

test("rejects first_real_test region outside allowlist", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const payload = buildAiupGatewayTestPayload("first-real-token", {
    mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    phone: "+79991112233",
    source_type: "behavioral_interest",
    source_url_or_phone: `https://${AIUP_GATEWAY_FIRST_REAL_TEST_ALLOWED_SOURCE_HOSTS[1]}`,
    region: "Краснодар",
    status: "first_real_test",
  })

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 403)
  assert.equal(result.body.error.includes("region"), true)
})

test("ignores extra payload fields and accepts dry run", async () => {
  const harness = createGatewayTestHarness()
  const payload = {
    ...buildAiupGatewayTestPayload("test-approval-token"),
    extra_field: "must-not-pass",
  }

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, true)
  assert.equal(result.body.result, "dry_run")
  assert.deepEqual(result.body.check_summary.ignored_fields, ["extra_field"])
  assert.equal(result.body.check_summary.duplicate_result, "none")
  assert.equal(harness.capturedRequests.some((request) => request.method === "crm.deal.add"), false)
  assert.equal(harness.capturedRequests.some((request) => request.method === "crm.contact.add"), false)
  assert.ok(!JSON.stringify(result.body).includes("test-approval-token"))
  assert.equal(result.body.sanitized_payload.phone_masked, "+7999******00")
})

test("forwards only allowlisted fields on write", async () => {
  const harness = createGatewayTestHarness()
  const payload = {
    ...buildAiupGatewayTestPayload("test-approval-token"),
    extra_field: "must-not-pass",
  }

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: true,
  })

  assert.equal(result.ok, true)
  const addRequest = harness.capturedRequests.find((request) => request.method === "crm.deal.add")
  const contactAddRequest = harness.capturedRequests.find((request) => request.method === "crm.contact.add")
  assert.ok(addRequest)
  assert.ok(contactAddRequest)
  assert.equal(addRequest?.body.includes("extra_field"), false)
  assert.equal(result.body.bitrix.category_name, AIUP_GATEWAY_BITRIX_CATEGORY_NAME)
  assert.equal(result.body.bitrix.source_name, AIUP_GATEWAY_BITRIX_SOURCE_NAME)
  assert.equal(result.body.bitrix.stage_name, AIUP_GATEWAY_BITRIX_STAGE_NAME)
  assert.equal(result.body.bitrix.category_id, "0")
  assert.equal(result.body.bitrix.contact_action, "created")
  assert.ok(result.body.bitrix.contact_id)
  assert.equal(result.body.bitrix.contact_id, result.body.bitrix.created_contact_id)
  assert.equal(addRequest?.body.includes("behavioral_interest"), false)
})

test("first real contact writes behavioral lead safeguards and safe manager script", async () => {
  const harness = createGatewayTestHarness({
    overrideEnv: {
      dailyLimit: 6,
      mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    },
  })
  const payload = buildAiupGatewayTestPayload("first-real-token", {
    mode: AIUP_GATEWAY_FIRST_REAL_TEST_MODE,
    phone: "+79991112233",
    source_name: "legokuhni.ru",
    source_type: "behavioral_interest",
    source_url_or_phone: "https://legokuhni.ru/",
    source_domain: "legokuhni.ru",
    region: "Ростов-на-Дону / Ростовская область",
    status: "bounded_real_test",
  })

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: true,
  })

  assert.equal(result.ok, true)
  const addRequest = harness.capturedRequests.find((request) => request.method === "crm.deal.add")
  assert.ok(addRequest)
  const decodedBody = decodeURIComponent(addRequest.body.replace(/\+/g, "%20"))
  assert.equal(decodedBody.includes("behavioral_interest"), true)
  assert.equal(decodedBody.includes("not_direct_request"), true)
  assert.equal(decodedBody.includes("soft_interest_check"), true)
  assert.equal(decodedBody.includes("Do not claim competitor application: true"), true)
  assert.equal(decodedBody.includes(AIUP_GATEWAY_SAFE_MANAGER_SCRIPT), true)
})

test("duplicate payload does not create second deal", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const first = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: true,
  })
  const second = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: true,
  })

  assert.equal(first.ok, true)
  assert.equal(first.body.result, "created")
  assert.equal(second.ok, true)
  assert.equal(second.body.result, "duplicate")
  assert.equal(harness.capturedRequests.filter((request) => request.method === "crm.deal.add").length, 1)
  assert.equal(harness.capturedRequests.filter((request) => request.method === "crm.contact.add").length, 1)
})

test("daily limit works", async () => {
  const harness = createGatewayTestHarness({
    journalRecords: Array.from({ length: 5 }, (_, index) => ({
      batchId: `batch-${index}`,
      bitrixDealId: String(index + 1),
      createdAt: "2026-06-08T09:00:00.000Z",
      dayKey: "2026-06-08",
      duplicateKey: `dup-${index}`,
      phoneMasked: "+7999******00",
      requestId: `req-${index}`,
      sourceName: "TEST_GATEWAY",
      sourceType: "test_only_gateway",
      status: "created",
    })),
  })

  const payload = buildAiupGatewayTestPayload("test-approval-token")
  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: true,
  })

  assert.equal(result.ok, false)
  assert.equal(result.status, 429)
})

test("uses first sales stage when dedicated AI-UP stage is unavailable", async () => {
  const harness = createGatewayTestHarness({
    stageRows: [
      { ENTITY_ID: "DEAL_STAGE", ID: "101", NAME: "Новый лид", SORT: "10", STATUS_ID: "NEW" },
      { ENTITY_ID: "DEAL_STAGE", ID: "103", NAME: "Связь установлена", SORT: "20", STATUS_ID: "PREPARATION" },
    ],
  })
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: true,
  })

  assert.equal(result.ok, true)
  assert.equal(result.body.bitrix.category_name, AIUP_GATEWAY_BITRIX_CATEGORY_NAME)
  assert.equal(result.body.bitrix.stage_name, "Новый лид")
  assert.equal(result.body.bitrix.stage_id, "NEW")
  assert.equal(harness.capturedRequests.some((request) => request.method === "crm.deal.add"), true)
})

test("creates deal when AI-UP custom fields are unavailable", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const originalCreateFakeBitrixFields = createFakeBitrixFields
  void originalCreateFakeBitrixFields
  harness.capturedRequests.length = 0
  const fakeFetchWithoutFields: typeof fetch = (async (input, init) => {
    const url = String(input)
    const method = url.match(/\/([^/]+)\.json$/)?.[1] || "unknown"
    if (method === "crm.deal.fields") {
      return Response.json({ result: {} })
    }
    return harness.deps.fetchImpl(input, init)
  }) as typeof fetch

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    fetchImpl: fakeFetchWithoutFields,
    performWrite: true,
  })

  assert.equal(result.ok, true)
  assert.equal(result.body.result, "created")
  assert.deepEqual(result.body.mapping.field_codes, {})
})

test("result does not expose approval token or full non-masked logging fields", async () => {
  const harness = createGatewayTestHarness()
  const payload = buildAiupGatewayTestPayload("test-approval-token")

  const result = await processAiupBitrixGatewayRequest(payload, {
    ...harness.deps,
    performWrite: false,
  })

  assert.equal(result.ok, true)
  const serialized = JSON.stringify(result.body)
  assert.equal(serialized.includes("approval_token"), false)
  assert.equal(serialized.includes("test-approval-token"), false)
  assert.equal(serialized.includes(AIUP_GATEWAY_TEST_PHONE), false)
})

test("gateway constants do not drift from allowlist contract", async () => {
  assert.deepEqual(AIUP_GATEWAY_ALLOWED_FIELDS, [
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
  ])
})
