"use client"

// Purpose: browser Supabase client for password login/logout inside the admin panel.

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let cachedBrowserClient: SupabaseClient | null = null

function getBrowserSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }

  return { url, publishableKey }
}

export function getSupabaseBrowserClient() {
  if (!cachedBrowserClient) {
    const { url, publishableKey } = getBrowserSupabaseEnv()
    cachedBrowserClient = createBrowserClient(url, publishableKey)
  }

  return cachedBrowserClient
}
