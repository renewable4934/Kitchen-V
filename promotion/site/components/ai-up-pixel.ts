"use client"

// Purpose: load the official AI-UP pixel once, only after an explicit marketing consent signal.

import { useEffect } from "react"

const aiUpPixelScriptId = "ai-up-pixel-script"
const marketingConsentEvent = "marketing-consent-granted"
const pixelEnabled = process.env.NEXT_PUBLIC_AIUP_PIXEL_ENABLED === "true"
const pixelId = process.env.NEXT_PUBLIC_AIUP_PIXEL_ID?.trim() || ""

declare global {
  interface Window {
    __marketingConsent?: boolean
  }
}

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
    const loadPixel = () => {
      if (
        !shouldLoadAiUpPixel({
          enabled: pixelEnabled,
          id: pixelId,
          hasConsent: window.__marketingConsent === true,
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

    loadPixel()
    window.addEventListener(marketingConsentEvent, loadPixel)

    return () => window.removeEventListener(marketingConsentEvent, loadPixel)
  }, [])

  return null
}
