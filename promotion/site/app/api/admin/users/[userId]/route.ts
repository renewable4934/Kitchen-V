import { NextResponse } from "next/server"

import { requireAdminApiUser } from "@/lib/admin-auth"
import { updateAdminUser } from "@/lib/admin-users"

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      userId: string
    }>
  },
) {
  const authResult = await requireAdminApiUser({ ownerOnly: true })
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { userId } = await context.params
    const user = await updateAdminUser({ ...body, userId })
    return NextResponse.json({ ok: true, user })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Не удалось обновить пользователя" },
      { status: 500 },
    )
  }
}
