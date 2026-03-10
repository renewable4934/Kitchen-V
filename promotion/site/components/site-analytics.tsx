"use client"

// Purpose: fires the first page-level marketing event once the landing is visible in the browser.

import { useEffect } from "react"

import { trackSiteEvent } from "@/lib/tracking"

type SiteAnalyticsProps = {
  funnelType: string
  offerVariant: string | null
  experimentKey: string | null
}

export function SiteAnalytics({ funnelType, offerVariant, experimentKey }: SiteAnalyticsProps) {
  useEffect(() => {
    void trackSiteEvent("view_offer", {
      funnel_type: funnelType,
      offer_variant: offerVariant,
      experiment_key: experimentKey,
      metadata: {
        screen: "home",
      },
    })
  }, [experimentKey, funnelType, offerVariant])

  return null
}
