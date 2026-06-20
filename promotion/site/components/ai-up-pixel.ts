"use client"

// Purpose: load the official AI-UP pixel once, only after an explicit marketing consent signal.

import { useEffect } from "react"

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  MARKETING_CONSENT_GRANTED_EVENT,
} from "../lib/cookie-consent.ts"

const aiUpPixelScriptId = "ai-up-pixel-script"
const pixelEnabled = process.env.NEXT_PUBLIC_AIUP_PIXEL_ENABLED === "true"
const pixelId = process.env.NEXT_PUBLIC_AIUP_PIXEL_ID?.trim() || ""

export function buildAiUpPixelSrc(id: string) {
  const normalizedId = id.trim()
  if (!normalizedId) {
    return null
  }

  const url = new URL("https://ai-up.ru/fn/pixel")
  url.searchParams.set("p", normalizedId)
  return url.toString()
}

export function shouldLoadAiUpPixel({
  enabled,
  id,
  hasConsent,
  scriptPresent,
}: {
  enabled: boolean
  id: string
  hasConsent: boolean
  scriptPresent: boolean
}) {
  return enabled && Boolean(id.trim()) && hasConsent && !scriptPresent
}

export function AiUpPixel() {
  useEffect(() => {
    const syncPixel = () => {
      if (window.__marketingConsent !== true) {
        document.getElementById(aiUpPixelScriptId)?.remove()
        return
      }

      if (
        !shouldLoadAiUpPixel({
          enabled: pixelEnabled,
          id: pixelId,
          hasConsent: true,
          scriptPresent: Boolean(document.getElementById(aiUpPixelScriptId)),
        })
      ) {
        return
      }

      const src = buildAiUpPixelSrc(pixelId)
      if (!src) {
        return
      }

      const script = document.createElement("script")
      script.id = aiUpPixelScriptId
      script.src = src
      script.async = true
      script.dataset.provider = "ai-up"
      document.head.appendChild(script)
    }

    syncPixel()
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncPixel)
    window.addEventListener(MARKETING_CONSENT_GRANTED_EVENT, syncPixel)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncPixel)
      window.removeEventListener(MARKETING_CONSENT_GRANTED_EVENT, syncPixel)
    }
  }, [])

  return null
}
