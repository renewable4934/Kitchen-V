// Purpose: loads the landing content from Supabase CMS tables and safely falls back to the exact v0 copy.

import { fallbackSiteContent, type CmsAsset, type SiteContent } from "@/lib/site-content"
import { getSupabaseCmsClient, isSupabaseCmsConfigured } from "@/lib/supabase"

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
          ((typeof item.slug === "string" && item.slug === fallbackItem.slug) ||
            (typeof item.name === "string" && item.name === fallbackItem.name) ||
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

function normalizeContent(merged: SiteContent) {
  merged.sections.portfolio.items = normalizePortfolioItems(
    merged.sections.portfolio.items,
    fallbackSiteContent.sections.portfolio.items,
  )

  merged.sections.configurator.steps = normalizeConfiguratorSteps(
    merged.sections.configurator.steps,
    fallbackSiteContent.sections.configurator.steps,
  )

  merged.sections.configurator.discountOptions = normalizeDiscountOptions(
    merged.sections.configurator.discountOptions,
    fallbackSiteContent.sections.configurator.discountOptions,
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

export async function loadSiteContent(): Promise<SiteContent> {
  const fallback = cloneFallback()
  const client = getSupabaseCmsClient()

  if (!client) {
    return fallback
  }

  const [siteResult, pageResult, sectionResult, navigationResult, assetResult] = await Promise.all([
    client.from("cms_sites").select("id, settings").eq("id", "main").maybeSingle(),
    client.from("cms_pages").select("slug, meta, published").eq("slug", "home").eq("published", true).maybeSingle(),
    client
      .from("cms_sections")
      .select("section_key, content, is_enabled")
      .eq("site_id", "main")
      .eq("page_slug", "home")
      .eq("variant_key", "default")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true }),
    client
      .from("cms_navigation")
      .select("area, label, href")
      .eq("site_id", "main")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true }),
    client.from("cms_assets").select("asset_key, public_url, alt").eq("site_id", "main"),
  ])

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
    siteSource: siteResult.data ? "supabase" : "local_fallback",
    pageSource: pageResult.data ? "supabase" : "local_fallback",
    sectionSource: sectionResult.data?.length ? "supabase" : "local_fallback",
    navigationSource: navigationResult.data?.length ? "supabase" : "local_fallback",
    assetSource: assetResult.data?.length ? "supabase" : "local_fallback",
    errors,
  }

  if (siteResult.data?.settings) {
    merged.site = deepMerge(merged.site, siteResult.data.settings)
  }

  if (pageResult.data?.meta) {
    merged.page = deepMerge(merged.page, {
      slug: pageResult.data.slug,
      ...pageResult.data.meta,
    })
  }

  if (sectionResult.data?.length) {
    for (const row of sectionResult.data) {
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

  if (navigationResult.data?.length) {
    const normalizedNavigation = buildNavigation(navigationResult.data)
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

  if (assetResult.data?.length) {
    merged.assets = deepMerge(merged.assets, normalizeAssets(assetResult.data))
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
