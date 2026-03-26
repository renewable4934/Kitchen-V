// Purpose: loads the landing content from Supabase CMS tables and safely falls back to the exact v0 copy.

import { unstable_noStore as noStore } from "next/cache"

import { fallbackSiteContent, type CmsAsset, type SiteContent } from "@/lib/site-content"
import { getSupabasePublicEnv, isSupabaseCmsConfigured } from "@/lib/supabase"

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T
  }

  if (isRecord(base) && isRecord(override)) {
    const result: JsonRecord = { ...base }
    for (const [key, value] of Object.entries(override)) {
      result[key] = key in base ? deepMerge((base as JsonRecord)[key], value) : value
    }
    return result as T
  }

  return (override ?? base) as T
}

function cloneFallback() {
  return structuredClone(fallbackSiteContent)
}

function normalizePortfolioItems(
  incomingItems: unknown,
  fallbackItems: SiteContent["sections"]["portfolio"]["items"],
) {
  const items = Array.isArray(incomingItems) ? incomingItems : []

  return fallbackItems.map((fallbackItem, index) => {
    const matched =
      items.find(
        (item) =>
          isRecord(item) &&
          ((typeof item.name === "string" && item.name === fallbackItem.name) ||
            (typeof item.imageKey === "string" && item.imageKey === fallbackItem.imageKey)),
      ) || items[index]

    return deepMerge(fallbackItem, matched)
  })
}

function normalizeConfiguratorSteps(
  incomingSteps: unknown,
  fallbackSteps: SiteContent["sections"]["configurator"]["steps"],
) {
  const steps = Array.isArray(incomingSteps) ? incomingSteps : []

  return fallbackSteps.map((fallbackStep, index) => {
    const matched =
      steps.find((step) => isRecord(step) && typeof step.id === "string" && step.id === fallbackStep.id) || steps[index]

    const mergedStep = deepMerge(fallbackStep, matched)
    const matchedOptions = isRecord(matched) && Array.isArray(matched.options) ? matched.options : []

    if (Array.isArray(fallbackStep.options)) {
      mergedStep.options = fallbackStep.options.map((fallbackOption, optionIndex) => {
        const matchedOption =
          matchedOptions.find(
            (option) =>
              isRecord(option) && typeof option.value === "string" && option.value === fallbackOption.value,
          ) || matchedOptions[optionIndex]

        return deepMerge(fallbackOption, matchedOption)
      })
    }

    return mergedStep
  })
}

function normalizeDiscountOptions(
  incomingDiscounts: unknown,
  fallbackDiscounts: SiteContent["sections"]["configurator"]["discountOptions"],
) {
  const discounts = Array.isArray(incomingDiscounts) ? incomingDiscounts : []

  return fallbackDiscounts.map((fallbackDiscount, index) => {
    const matched =
      discounts.find(
        (discount) =>
          isRecord(discount) && typeof discount.value === "string" && discount.value === fallbackDiscount.value,
      ) || discounts[index]

    return deepMerge(fallbackDiscount, matched)
  })
}

function normalizeContractCards(incomingCards: unknown, fallbackCards: SiteContent["sections"]["contract"]["cards"]) {
  const cards = Array.isArray(incomingCards) ? incomingCards : []

  return fallbackCards.map((fallbackCard, index) => {
    const matched =
      cards.find(
        (card) =>
          isRecord(card) &&
          ((typeof card.icon === "string" && card.icon === fallbackCard.icon) ||
            (typeof card.title === "string" && card.title === fallbackCard.title)),
      ) || cards[index]

    return deepMerge(fallbackCard, matched)
  })
}

function normalizeLifestyleItems(incomingItems: unknown, fallbackItems: SiteContent["sections"]["lifestyle"]["items"]) {
  const items = Array.isArray(incomingItems) ? incomingItems : []

  return fallbackItems.map((fallbackItem, index) => {
    const matched =
      items.find(
        (item) =>
          isRecord(item) &&
          ((typeof item.title === "string" && item.title === fallbackItem.title) ||
            (typeof item.imageKey === "string" && item.imageKey === fallbackItem.imageKey)),
      ) || items[index]

    return deepMerge(fallbackItem, matched)
  })
}

function normalizeSiteSettings(site: SiteContent["site"], fallbackSite: SiteContent["site"]) {
  const normalized = { ...site }

  if (!normalized.contactPhone || normalized.contactPhone === "+7 (800) 000-00-00") {
    normalized.contactPhone = fallbackSite.contactPhone
  }

  if (!normalized.email || normalized.email === "info@pegas-kitchen.ru") {
    normalized.email = fallbackSite.email
  }

  if (!normalized.address || normalized.address === "Москва, Россия") {
    normalized.address = fallbackSite.address
  }

  if (!normalized.footerCopyrightOwner) {
    normalized.footerCopyrightOwner = fallbackSite.footerCopyrightOwner
  }

  return normalized
}

function normalizeContent(merged: SiteContent) {
  const canonical = cloneFallback()
  merged.site = normalizeSiteSettings(merged.site, canonical.site)

  merged.navigation.headerLinks = merged.navigation.headerLinks.length
    ? merged.navigation.headerLinks
    : canonical.navigation.headerLinks
  merged.navigation.footerLinks = merged.navigation.footerLinks.length
    ? merged.navigation.footerLinks
    : canonical.navigation.footerLinks
  merged.navigation.headerCta = merged.navigation.headerCta || canonical.navigation.headerCta

  merged.sections.hero = deepMerge(canonical.sections.hero, merged.sections.hero)
  merged.sections.configurator = deepMerge(canonical.sections.configurator, merged.sections.configurator)
  merged.sections.portfolio = deepMerge(canonical.sections.portfolio, merged.sections.portfolio)
  merged.sections.contract = deepMerge(canonical.sections.contract, merged.sections.contract)
  merged.sections.lifestyle = deepMerge(canonical.sections.lifestyle, merged.sections.lifestyle)
  merged.sections.footer = deepMerge(canonical.sections.footer, merged.sections.footer)

  merged.sections.portfolio.items = normalizePortfolioItems(merged.sections.portfolio.items, canonical.sections.portfolio.items)
  merged.sections.configurator.steps = normalizeConfiguratorSteps(
    merged.sections.configurator.steps,
    canonical.sections.configurator.steps,
  )
  merged.sections.configurator.discountOptions = normalizeDiscountOptions(
    merged.sections.configurator.discountOptions,
    canonical.sections.configurator.discountOptions,
  )
  merged.sections.contract.cards = normalizeContractCards(merged.sections.contract.cards, canonical.sections.contract.cards)
  merged.sections.lifestyle.items = normalizeLifestyleItems(
    merged.sections.lifestyle.items,
    canonical.sections.lifestyle.items,
  )

  return merged
}

function normalizeAssets(assetRows: Array<{ asset_key: string; public_url: string; alt: string }> = []) {
  const normalized: Record<string, CmsAsset> = {}
  for (const row of assetRows) {
    if (!row?.asset_key || !row?.public_url) {
      continue
    }
    normalized[row.asset_key] = {
      assetKey: row.asset_key,
      publicUrl: row.public_url,
      alt: row.alt || fallbackSiteContent.assets[row.asset_key]?.alt || row.asset_key,
    }
  }
  return normalized
}

function buildNavigation(rows: Array<{ area: string; label: string; href: string }> = []) {
  return {
    headerLinks: rows
      .filter((item) => item.area === "header")
      .map(({ label, href }) => ({ label, href })),
    footerLinks: rows
      .filter((item) => item.area === "footer")
      .map(({ label, href }) => ({ label, href })),
    headerCta:
      rows
        .filter((item) => item.area === "header_cta")
        .map(({ label, href }) => ({ label, href, eventName: "start_quiz" as const }))[0] || null,
  }
}

async function fetchCmsRows<T>(path: string) {
  const { url, publishableKey } = getSupabasePublicEnv()

  if (!url || !publishableKey) {
    return {
      data: null as T | null,
      error: { message: "Supabase CMS is not configured" },
    }
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${publishableKey}`,
      accept: "application/json",
    },
    cache: "no-store",
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    return {
      data: null as T | null,
      error: { message: `${response.status} ${response.statusText}` },
    }
  }

  return {
    data: (await response.json()) as T,
    error: null as { message: string } | null,
  }
}

export async function loadSiteContent(): Promise<SiteContent> {
  noStore()
  const fallback = cloneFallback()

  if (!isSupabaseCmsConfigured()) {
    return fallback
  }

  const [siteResult, pageResult, sectionResult, navigationResult, assetResult] = await Promise.all([
    fetchCmsRows<Array<{ id: string; settings: unknown }>>("cms_sites?select=id,settings&id=eq.main&limit=1"),
    fetchCmsRows<Array<{ slug: string; meta: unknown; published: boolean }>>(
      "cms_pages?select=slug,meta,published&slug=eq.home&published=eq.true&limit=1",
    ),
    fetchCmsRows<Array<{ section_key: string; content: unknown; is_enabled: boolean }>>(
      "cms_sections?select=section_key,content,is_enabled&site_id=eq.main&page_slug=eq.home&variant_key=eq.default&is_enabled=eq.true&order=sort_order.asc",
    ),
    fetchCmsRows<Array<{ area: string; label: string; href: string }>>(
      "cms_navigation?select=area,label,href&site_id=eq.main&is_enabled=eq.true&order=sort_order.asc",
    ),
    fetchCmsRows<Array<{ asset_key: string; public_url: string; alt: string }>>(
      "cms_assets?select=asset_key,public_url,alt&site_id=eq.main",
    ),
  ])

  const siteData = siteResult.data?.[0] || null
  const pageData = pageResult.data?.[0] || null
  const sectionData = sectionResult.data || []
  const navigationData = navigationResult.data || []
  const assetData = assetResult.data || []

  const errors = [
    siteResult.error?.message,
    pageResult.error?.message,
    sectionResult.error?.message,
    navigationResult.error?.message,
    assetResult.error?.message,
  ].filter(Boolean) as string[]

  const merged = cloneFallback()
  merged.cmsEnabled = true
  merged.source = errors.length === 0 ? "supabase" : "local_fallback"
  merged.diagnostics = {
    siteSource: siteData ? "supabase" : "local_fallback",
    pageSource: pageData ? "supabase" : "local_fallback",
    sectionSource: sectionData.length ? "supabase" : "local_fallback",
    navigationSource: navigationData.length ? "supabase" : "local_fallback",
    assetSource: assetData.length ? "supabase" : "local_fallback",
    errors,
  }

  if (siteData?.settings) {
    merged.site = deepMerge(merged.site, siteData.settings)
  }

  if (pageData?.meta) {
    merged.page = deepMerge(merged.page, {
      slug: pageData.slug,
      ...pageData.meta,
    })
  }

  if (sectionData.length) {
    for (const row of sectionData) {
      if (!row.section_key || !isRecord(row.content)) {
        continue
      }
      switch (row.section_key) {
        case "hero":
          merged.sections.hero = deepMerge(merged.sections.hero, row.content)
          break
        case "configurator":
          merged.sections.configurator = deepMerge(merged.sections.configurator, row.content)
          break
        case "portfolio":
          merged.sections.portfolio = deepMerge(merged.sections.portfolio, row.content)
          break
        case "contract":
          merged.sections.contract = deepMerge(merged.sections.contract, row.content)
          break
        case "lifestyle":
          merged.sections.lifestyle = deepMerge(merged.sections.lifestyle, row.content)
          break
        case "footer":
          merged.sections.footer = deepMerge(merged.sections.footer, row.content)
          break
        default:
          break
      }
    }
  }

  if (navigationData.length) {
    const normalizedNavigation = buildNavigation(navigationData)
    if (normalizedNavigation.headerLinks.length) {
      merged.navigation.headerLinks = normalizedNavigation.headerLinks
    }
    if (normalizedNavigation.footerLinks.length) {
      merged.navigation.footerLinks = normalizedNavigation.footerLinks
    }
    if (normalizedNavigation.headerCta) {
      merged.navigation.headerCta = normalizedNavigation.headerCta
    }
  }

  if (assetData.length) {
    merged.assets = deepMerge(merged.assets, normalizeAssets(assetData))
  }

  return normalizeContent(merged)
}

export async function getCmsBootstrap() {
  const content = await loadSiteContent()
  return {
    ok: true,
    cms_enabled: isSupabaseCmsConfigured(),
    source: content.source,
    diagnostics: content.diagnostics,
    page_slug: content.page.slug,
    settings_source: content.diagnostics.siteSource,
    page_source: content.diagnostics.pageSource,
    navigation_source: content.diagnostics.navigationSource,
    section_source: content.diagnostics.sectionSource,
    asset_source: content.diagnostics.assetSource,
    content,
  }
}
