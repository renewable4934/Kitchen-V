// Purpose: reusable Supabase clients for public CMS reads, browser auth and server-side admin writes.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedCmsClient: SupabaseClient | null = null
let cachedWriteClient: SupabaseClient | null = null
let cachedAdminClient: SupabaseClient | null = null

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

function getSupabaseServerAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  )
}

export function getSupabasePublicEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || getSupabaseUrl(),
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  }
}

function createReusableClient(key: string) {
  return createClient(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      // Next.js may cache server-side fetch requests unless explicitly disabled.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  })
}

export type SupabaseWriteMode = "service_role" | "anon_fallback" | "disabled"

export function isSupabaseCmsConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServerAnonKey())
}

export function getSupabaseWriteMode(): SupabaseWriteMode {
  if (getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "service_role"
  }

  if (isSupabaseCmsConfigured()) {
    return "anon_fallback"
  }

  return "disabled"
}

export function isSupabaseConfigured() {
  return isSupabaseCmsConfigured()
}

export function getSupabaseClient() {
  if (!isSupabaseCmsConfigured()) {
    return null
  }

  if (!cachedCmsClient) {
    cachedCmsClient = createReusableClient(getSupabaseServerAnonKey())
  }

  return cachedCmsClient
}

export function getSupabaseCmsClient() {
  return getSupabaseClient()
}

export function isSupabaseWriteConfigured() {
  return getSupabaseWriteMode() !== "disabled"
}

export function getSupabaseWriteClient() {
  const writeMode = getSupabaseWriteMode()
  if (writeMode === "disabled") {
    return null
  }

  if (!cachedWriteClient) {
    const key =
      writeMode === "service_role" ? process.env.SUPABASE_SERVICE_ROLE_KEY! : getSupabaseServerAnonKey()
    cachedWriteClient = createReusableClient(key)
  }

  return cachedWriteClient
}

export function isSupabaseAdminConfigured() {
  return Boolean(getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createReusableClient(process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }

  return cachedAdminClient
}
