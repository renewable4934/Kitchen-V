// Purpose: local-only journal for the AI-UP Bitrix test gateway to enforce duplicate checks and daily limits without external services.

import { mkdir, readFile, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

export type AiupGatewayJournalStatus =
  | "rejected"
  | "dry_run"
  | "duplicate"
  | "created"
  | "verification_only"

export type AiupGatewayJournalRecord = {
  requestId: string
  duplicateKey: string
  batchId: string
  createdAt: string
  dayKey: string
  status: AiupGatewayJournalStatus
  bitrixDealId?: string | null
  bitrixContactId?: string | null
  phoneMasked: string
  sourceName: string
  sourceType: string
}

type AiupGatewayJournalFile = {
  records: AiupGatewayJournalRecord[]
}

const DEFAULT_STORE_PATH = path.join(os.tmpdir(), "kitchen-v-aiup-bitrix-gateway-store.json")

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isRecordShape(value: unknown): value is AiupGatewayJournalRecord {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  return Boolean(
    safeString(record.requestId) &&
      safeString(record.duplicateKey) &&
      safeString(record.batchId) &&
      safeString(record.createdAt) &&
      safeString(record.dayKey) &&
      safeString(record.status) &&
      safeString(record.phoneMasked) &&
      safeString(record.sourceName) &&
      safeString(record.sourceType),
  )
}

function normalizeJournal(value: unknown): AiupGatewayJournalFile {
  if (!value || typeof value !== "object") {
    return { records: [] }
  }

  const records = Array.isArray((value as { records?: unknown[] }).records)
    ? (value as { records: unknown[] }).records.filter(isRecordShape)
    : []

  return { records }
}

export function getAiupGatewayStorePath() {
  return process.env.AIUP_GATEWAY_STORE_PATH || DEFAULT_STORE_PATH
}

export function buildDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function readAiupGatewayJournal(storePath = getAiupGatewayStorePath()) {
  try {
    const raw = await readFile(storePath, "utf8")
    return normalizeJournal(JSON.parse(raw))
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("ENOENT")) {
      return { records: [] }
    }
    throw error
  }
}

export async function writeAiupGatewayJournal(
  journal: AiupGatewayJournalFile,
  storePath = getAiupGatewayStorePath(),
) {
  await mkdir(path.dirname(storePath), { recursive: true })
  await writeFile(storePath, `${JSON.stringify(journal, null, 2)}\n`, "utf8")
}

export async function appendAiupGatewayJournalRecord(
  record: AiupGatewayJournalRecord,
  storePath = getAiupGatewayStorePath(),
) {
  const journal = await readAiupGatewayJournal(storePath)
  journal.records.push(record)
  await writeAiupGatewayJournal(journal, storePath)
}
