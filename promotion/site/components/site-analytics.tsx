"use client"

// Purpose: loads global analytics once and tracks route changes / delegated CTA clicks safely on the client.

import { useEffect, useRef } from "react"
import Script from "next/script"

import { getAnalyticsIds, trackCTA, trackPageView, trackPhoneClick } from "@/lib/tracking"

export function SiteAnalytics() {
  const lastTrackedUrlRef = useRef<string | null>(null)
  const hasTrackedInitialPageRef = useRef(false)
  const { gaMeasurementId, yandexMetricaId } = getAnalyticsIds()

  useEffect(() => {
    const trackCurrentPage = () => {
      const pagePath = `${window.location.pathname}${window.location.search}`
      const pageLocation = `${window.location.origin}${pagePath}`

      if (lastTrackedUrlRef.current === pageLocation) {
        return
      }

      const skipMetricaHit = !hasTrackedInitialPageRef.current
      lastTrackedUrlRef.current = pageLocation
      hasTrackedInitialPageRef.current = true

      void trackPageView({
        pagePath,
        pageLocation,
        pageTitle: document.title,
        skipMetricaHit,
      })
    }

    const emitRouteChange = () => window.dispatchEvent(new Event("analytics-route-change"))
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args)
      emitRouteChange()
      return result
    }

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args)
      emitRouteChange()
      return result
    }

    trackCurrentPage()
    window.addEventListener("popstate", trackCurrentPage)
    window.addEventListener("analytics-route-change", trackCurrentPage)

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener("popstate", trackCurrentPage)
      window.removeEventListener("analytics-route-change", trackCurrentPage)
    }
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-analytics-event]") : null
      if (!target) {
        return
      }

      const analyticsEvent = target.dataset.analyticsEvent
      const buttonName = target.dataset.analyticsButtonName || target.textContent?.trim() || "cta"
      const sectionName = target.dataset.analyticsSectionName || "page"
      const destination = target.dataset.analyticsDestination
      const funnelType = target.dataset.analyticsFunnelType || "kitchen"
      const offerVariant = target.dataset.analyticsOfferVariant || null
      const experimentKey = target.dataset.analyticsExperimentKey || null

      if (analyticsEvent === "cta_click") {
        void trackCTA({
          buttonName,
          sectionName,
          destination,
          funnelType,
          offerVariant,
          experimentKey,
        })
      }

      if (analyticsEvent === "phone_click") {
        void trackPhoneClick({
          buttonName,
          sectionName,
          funnelType,
          offerVariant,
          experimentKey,
        })
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return (
    <>
      {gaMeasurementId ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', {
                send_page_view: false,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      ) : null}

      {yandexMetricaId ? (
        <>
          <Script id="yandex-metrica-init" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {
                  if (document.scripts[j].src === r) {
                    return;
                  }
                }
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${Number(yandexMetricaId)}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
              });
            `}
          </Script>
          <noscript>
            <div>
              <img
                alt=""
                src={`https://mc.yandex.ru/watch/${yandexMetricaId}`}
                style={{ position: "absolute", left: "-9999px" }}
              />
            </div>
          </noscript>
        </>
      ) : null}
    </>
  )
}
