// Purpose: reusable server-side Supabase client for CMS reads and API writes.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedClient: SupabaseClient | null = null

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!cachedClient) {
    cachedClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  }

  return cachedClient
}
