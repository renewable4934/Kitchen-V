// Purpose: server-side CMS read/write helpers for the protected admin panel.

import { revalidatePath } from "next/cache"

import { loadSiteContent } from "@/lib/cms"
import { getSupabaseAdminClient } from "@/lib/supabase"
import type { FooterContent, HeroContent, SiteContent, SiteSettings } from "@/lib/site-content"

const SITE_ID = "main"
const PAGE_SLUG = "home"

const SECTION_SORT_ORDER: Record<string, number> = {
  hero: 10,
  configurator: 20,
  portfolio: 30,
  contract: 40,
  lifestyle: 50,
  footer: 60,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function getAdminClientOrThrow() {
  const client = getSupabaseAdminClient()
  if (!client) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin CMS actions")
  }

  return client
}

export async function getAdminCmsState() {
  const content = await loadSiteContent()

  return {
    content,
    assets: Object.values(content.assets).sort((left, right) => left.assetKey.localeCompare(right.assetKey)),
  }
}

async function upsertSection(sectionKey: string, content: unknown) {
  const client = getAdminClientOrThrow()
  const { error } = await client.from("cms_sections").upsert(
    {
      site_id: SITE_ID,
      page_slug: PAGE_SLUG,
      section_key: sectionKey,
      sort_order: SECTION_SORT_ORDER[sectionKey] || 100,
      variant_key: "default",
      is_enabled: true,
      content,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "site_id,page_slug,section_key,variant_key",
    },
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function saveSettingsBundle(input: {
  site: SiteSettings
  page: SiteContent["page"]
  footer: FooterContent
}) {
  const client = getAdminClientOrThrow()

  const [siteResult, pageResult] = await Promise.all([
    client.from("cms_sites").upsert(
      {
        id: SITE_ID,
        settings: input.site,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    ),
    client.from("cms_pages").upsert(
      {
        slug: PAGE_SLUG,
        site_id: SITE_ID,
        meta: {
          title: input.page.title,
          description: input.page.description,
        },
        published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    ),
  ])

  if (siteResult.error) {
    throw new Error(siteResult.error.message)
  }

  if (pageResult.error) {
    throw new Error(pageResult.error.message)
  }

  await upsertSection("footer", input.footer)
  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function saveHeroSection(content: HeroContent) {
  await upsertSection("hero", content)
  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function saveJsonSection(sectionKey: "configurator" | "portfolio" | "contract" | "lifestyle", content: unknown) {
  if (!isRecord(content)) {
    throw new Error("Section content must be a JSON object")
  }

  await upsertSection(sectionKey, content)
  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function saveNavigation(input: {
  headerLinks: SiteContent["navigation"]["headerLinks"]
  footerLinks: SiteContent["navigation"]["footerLinks"]
  headerCta: SiteContent["navigation"]["headerCta"]
}) {
  const client = getAdminClientOrThrow()
  const deleteResult = await client
    .from("cms_navigation")
    .delete()
    .eq("site_id", SITE_ID)
    .in("area", ["header", "footer", "header_cta"])

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message)
  }

  const payload = [
    ...input.headerLinks.map((link, index) => ({
      site_id: SITE_ID,
      area: "header",
      label: link.label,
      href: link.href,
      sort_order: index + 1,
      is_enabled: true,
      updated_at: new Date().toISOString(),
    })),
    ...input.footerLinks.map((link, index) => ({
      site_id: SITE_ID,
      area: "footer",
      label: link.label,
      href: link.href,
      sort_order: index + 1,
      is_enabled: true,
      updated_at: new Date().toISOString(),
    })),
    {
      site_id: SITE_ID,
      area: "header_cta",
      label: input.headerCta.label,
      href: input.headerCta.href,
      sort_order: 1,
      is_enabled: true,
      updated_at: new Date().toISOString(),
    },
  ]

  const insertResult = await client.from("cms_navigation").insert(payload)
  if (insertResult.error) {
    throw new Error(insertResult.error.message)
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}
