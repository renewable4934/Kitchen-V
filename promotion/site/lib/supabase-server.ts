// Purpose: server Supabase clients for authenticated admin pages, route handlers and middleware.

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabasePublicEnv } from "@/lib/supabase"

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

function getServerSupabaseEnv() {
  const { url, publishableKey } = getSupabasePublicEnv()

  if (!url || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured")
  }

  return { url, publishableKey }
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const { url, publishableKey } = getServerSupabaseEnv()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server components may not be allowed to mutate cookies. Middleware handles refreshes.
        }
      },
    },
  })
}

export function createMiddlewareSupabaseClient(request: NextRequest) {
  const { url, publishableKey } = getServerSupabaseEnv()
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return {
    supabase,
    getResponse() {
      return response
    },
  }
}
