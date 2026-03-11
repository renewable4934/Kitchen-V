// Purpose: reusable Supabase clients for public CMS reads and server-side API writes.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedCmsClient: SupabaseClient | null = null
let cachedWriteClient: SupabaseClient | null = null

function createReusableClient(key: string) {
  return createClient(process.env.SUPABASE_URL!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

export type SupabaseWriteMode = "service_role" | "anon_fallback" | "disabled"

export function isSupabaseCmsConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}

export function getSupabaseWriteMode(): SupabaseWriteMode {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
    cachedCmsClient = createReusableClient(process.env.SUPABASE_ANON_KEY!)
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
      writeMode === "service_role" ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_ANON_KEY!
    cachedWriteClient = createReusableClient(key)
  }

  return cachedWriteClient
}
