// Purpose: owner-only user management for the CMS admin area using Supabase Auth admin APIs.

import type { AdminUserAttributes } from "@supabase/auth-js"

import { normalizeAdminRole, type AdminRole } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase"

const USER_BAN_DURATION = "876000h"

export type AdminUserRecord = {
  id: string
  email: string
  displayName: string
  role: AdminRole
  isActive: boolean
  createdAt: string
  lastSignInAt: string | null
}

function getAdminClientOrThrow() {
  const client = getSupabaseAdminClient()
  if (!client) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for user management")
  }

  return client
}

function mapAuthUser(user: {
  id: string
  email?: string
  created_at: string
  last_sign_in_at?: string
  banned_until?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}) {
  const role = normalizeAdminRole(user.app_metadata) || "editor"
  const displayName =
    typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name.trim()
      : user.email || "Без имени"

  return {
    id: user.id,
    email: user.email || "",
    displayName,
    role,
    isActive: !user.banned_until || new Date(user.banned_until).getTime() <= Date.now(),
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
  } satisfies AdminUserRecord
}

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email)
}

function validatePassword(password: string) {
  return password.length >= 8
}

export async function listAdminUsers() {
  const client = getAdminClientOrThrow()
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 200 })

  if (error) {
    throw new Error(error.message)
  }

  return data.users
    .map(mapAuthUser)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export async function createAdminUser(input: {
  email: string
  password: string
  role: AdminRole
  displayName: string
}) {
  if (!validateEmail(input.email)) {
    throw new Error("Некорректный email")
  }

  if (!validatePassword(input.password)) {
    throw new Error("Пароль должен быть не короче 8 символов")
  }

  const client = getAdminClientOrThrow()
  const { data, error } = await client.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    app_metadata: {
      role: input.role,
    },
    user_metadata: {
      display_name: input.displayName.trim(),
    },
  })

  if (error || !data.user) {
    throw new Error(error?.message || "Не удалось создать пользователя")
  }

  return mapAuthUser(data.user)
}

export async function updateAdminUser(input: {
  userId: string
  role: AdminRole
  displayName: string
  isActive: boolean
  password?: string
}) {
  if (input.password && !validatePassword(input.password)) {
    throw new Error("Пароль должен быть не короче 8 символов")
  }

  const attributes: AdminUserAttributes = {
    app_metadata: {
      role: input.role,
    },
    user_metadata: {
      display_name: input.displayName.trim(),
    },
    ban_duration: input.isActive ? "none" : USER_BAN_DURATION,
    email_confirm: true,
  }

  if (input.password) {
    attributes.password = input.password
  }

  const client = getAdminClientOrThrow()
  const { data, error } = await client.auth.admin.updateUserById(input.userId, attributes)

  if (error || !data.user) {
    throw new Error(error?.message || "Не удалось обновить пользователя")
  }

  return mapAuthUser(data.user)
}
