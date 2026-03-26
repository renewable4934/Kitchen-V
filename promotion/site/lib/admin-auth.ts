// Purpose: central auth and role guards for the protected CMS admin area.

import { NextResponse } from "next/server"
import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/lib/supabase-server"

export type AdminRole = "owner" | "editor"

export type AdminSessionUser = {
  id: string
  email: string
  displayName: string
  role: AdminRole
  bannedUntil: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function normalizeAdminRole(appMetadata: unknown): AdminRole | null {
  if (!isRecord(appMetadata)) {
    return null
  }

  const role = appMetadata.role
  return role === "owner" || role === "editor" ? role : null
}

function isUserBanned(bannedUntil: string | undefined) {
  if (!bannedUntil) {
    return false
  }

  return new Date(bannedUntil).getTime() > Date.now()
}

function mapAdminSessionUser(user: {
  id: string
  email?: string
  banned_until?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const role = normalizeAdminRole(user.app_metadata)
  if (!role || isUserBanned(user.banned_until)) {
    return null
  }

  const displayName =
    typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name.trim()
      : user.email || "Admin"

  return {
    id: user.id,
    email: user.email || "",
    displayName,
    role,
    bannedUntil: user.banned_until || null,
  } satisfies AdminSessionUser
}

export async function getCurrentAdminUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return mapAdminSessionUser(user)
}

export async function requireAdminPageUser() {
  const adminUser = await getCurrentAdminUser()
  if (!adminUser) {
    redirect("/admin/login")
  }

  return adminUser
}

export async function requireOwnerPageUser() {
  const adminUser = await requireAdminPageUser()
  if (adminUser.role !== "owner") {
    redirect("/admin")
  }

  return adminUser
}

export async function requireAdminApiUser(options?: { ownerOnly?: boolean }) {
  const adminUser = await getCurrentAdminUser()

  if (!adminUser) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (options?.ownerOnly && adminUser.role !== "owner") {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
    }
  }

  return {
    ok: true as const,
    adminUser,
  }
}
