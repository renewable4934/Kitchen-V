// Title: Cookie consent state
// Purpose: store and publish versioned necessary, analytics and marketing choices in the browser.
// Owner: Project team
// Last updated: 2026-06-20

export const COOKIE_CONSENT_VERSION = 1
export const COOKIE_CONSENT_STORAGE_KEY = "pegas_cookie_consent"
export const COOKIE_CONSENT_UPDATED_EVENT = "cookie-consent-updated"
export const COOKIE_CONSENT_OPEN_EVENT = "cookie-consent-open"
export const MARKETING_CONSENT_GRANTED_EVENT = "marketing-consent-granted"

export type CookieConsentPreferences = {
  version: typeof COOKIE_CONSENT_VERSION
  necessary: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

type StorageReader = Pick<Storage, "getItem">
type StorageWriter = Pick<Storage, "setItem">

declare global {
  interface Window {
    __analyticsConsent?: boolean
    __marketingConsent?: boolean
  }
}

export function createCookieConsentPreferences({
  analytics,
  marketing,
  updatedAt = new Date().toISOString(),
}: {
  analytics: boolean
  marketing: boolean
  updatedAt?: string
}): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics,
    marketing,
    updatedAt,
  }
}

export function createDefaultCookieConsentPreferences() {
  return createCookieConsentPreferences({
    analytics: false,
    marketing: false,
  })
}

export function isCookieConsentPreferences(value: unknown): value is CookieConsentPreferences {
  if (!value || typeof value !== "object") {
    return false
  }

  const preferences = value as Partial<CookieConsentPreferences>
  return (
    preferences.version === COOKIE_CONSENT_VERSION &&
    preferences.necessary === true &&
    typeof preferences.analytics === "boolean" &&
    typeof preferences.marketing === "boolean" &&
    typeof preferences.updatedAt === "string"
  )
}

export function readCookieConsent(storage: StorageReader): CookieConsentPreferences | null {
  try {
    const stored = storage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!stored) {
      return null
    }

    const parsed: unknown = JSON.parse(stored)
    return isCookieConsentPreferences(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeCookieConsent(storage: StorageWriter, preferences: CookieConsentPreferences) {
  storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences))
}

export function publishCookieConsent(preferences: CookieConsentPreferences) {
  window.__analyticsConsent = preferences.analytics
  window.__marketingConsent = preferences.marketing
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: preferences }))

  if (preferences.marketing) {
    window.dispatchEvent(new Event(MARKETING_CONSENT_GRANTED_EVENT))
  }
}
