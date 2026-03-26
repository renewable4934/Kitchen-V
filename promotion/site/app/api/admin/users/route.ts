import { NextResponse } from "next/server"

import { requireAdminApiUser } from "@/lib/admin-auth"
import { createAdminUser, listAdminUsers } from "@/lib/admin-users"

export async function GET() {
  const authResult = await requireAdminApiUser({ ownerOnly: true })
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const users = await listAdminUsers()
    return NextResponse.json({ ok: true, users })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Не удалось загрузить пользователей" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdminApiUser({ ownerOnly: true })
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const user = await createAdminUser(body)
    return NextResponse.json({ ok: true, user })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Не удалось создать пользователя" },
      { status: 500 },
    )
  }
}
