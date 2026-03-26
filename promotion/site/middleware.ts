import { NextResponse, type NextRequest } from "next/server"

import { createMiddlewareSupabaseClient } from "@/lib/supabase-server"
import { normalizeAdminRole } from "@/lib/admin-auth"

function isBanned(bannedUntil?: string) {
  return Boolean(bannedUntil && new Date(bannedUntil).getTime() > Date.now())
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, getResponse } = createMiddlewareSupabaseClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = normalizeAdminRole(user?.app_metadata)
  const hasAdminAccess = Boolean(user && role && !isBanned(user.banned_until))

  if (pathname.startsWith("/api/admin")) {
    if (!hasAdminAccess) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    return getResponse()
  }

  if (pathname === "/admin/login") {
    if (hasAdminAccess) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return getResponse()
  }

  if (pathname.startsWith("/admin") && !hasAdminAccess) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return getResponse()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
