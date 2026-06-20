// Title: Cookie consent tests
// Purpose: verify versioned storage and optional consent choices without using real tracking identifiers.
// Owner: Project team
// Last updated: 2026-06-20

import assert from "node:assert/strict"
import test from "node:test"

import { buildAiUpPixelSrc, shouldLoadAiUpPixel } from "../components/ai-up-pixel.ts"
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  createCookieConsentPreferences,
  readCookieConsent,
  writeCookieConsent,
} from "./cookie-consent.ts"

function createMemoryStorage() {
  const values = new Map<string, string>()

  return {
    getItem(key: string) {
      return values.get(key) ?? null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }
}

test("first visit has no saved choice", () => {
  assert.equal(readCookieConsent(createMemoryStorage()), null)
})

test("reject optional stores analytics and marketing as false", () => {
  const storage = createMemoryStorage()
  const preferences = createCookieConsentPreferences({
    analytics: false,
    marketing: false,
    updatedAt: "2026-06-20T00:00:00.000Z",
  })

  writeCookieConsent(storage, preferences)
  assert.deepEqual(readCookieConsent(storage), preferences)
})

test("accept all stores analytics and marketing as true", () => {
  const storage = createMemoryStorage()
  const preferences = createCookieConsentPreferences({
    analytics: true,
    marketing: true,
    updatedAt: "2026-06-20T00:00:00.000Z",
  })

  writeCookieConsent(storage, preferences)
  assert.deepEqual(readCookieConsent(storage), preferences)
})

test("custom choice keeps analytics and marketing independent", () => {
  const storage = createMemoryStorage()
  const preferences = createCookieConsentPreferences({
    analytics: true,
    marketing: false,
    updatedAt: "2026-06-20T00:00:00.000Z",
  })

  writeCookieConsent(storage, preferences)
  assert.deepEqual(readCookieConsent(storage), preferences)
})

test("old or malformed consent is ignored", () => {
  const storage = createMemoryStorage()
  storage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({
      version: COOKIE_CONSENT_VERSION + 1,
      necessary: true,
      analytics: true,
      marketing: true,
      updatedAt: "2026-06-20T00:00:00.000Z",
    }),
  )

  assert.equal(readCookieConsent(storage), null)
  storage.setItem(COOKIE_CONSENT_STORAGE_KEY, "{")
  assert.equal(readCookieConsent(storage), null)
})

test("AI-UP remains blocked without marketing consent", () => {
  assert.equal(
    shouldLoadAiUpPixel({
      enabled: true,
      id: "test-public-id",
      hasConsent: false,
      scriptPresent: false,
    }),
    false,
  )
})

test("AI-UP loads only once after marketing consent", () => {
  assert.equal(
    shouldLoadAiUpPixel({
      enabled: true,
      id: "test-public-id",
      hasConsent: true,
      scriptPresent: false,
    }),
    true,
  )
  assert.equal(
    shouldLoadAiUpPixel({
      enabled: true,
      id: "test-public-id",
      hasConsent: true,
      scriptPresent: true,
    }),
    false,
  )
  assert.match(buildAiUpPixelSrc("test-public-id") ?? "", /^https:\/\/ai-up\.ru\/fn\/pixel\?p=/)
})
