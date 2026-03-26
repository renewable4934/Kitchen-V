import { NextResponse } from "next/server"

import { requireAdminApiUser } from "@/lib/admin-auth"
import { saveHeroSection, saveJsonSection, saveNavigation, saveSettingsBundle } from "@/lib/admin-cms"

export async function POST(request: Request) {
  const authResult = await requireAdminApiUser()
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const body = await request.json()

    switch (body?.kind) {
      case "settings":
        await saveSettingsBundle(body.data)
        break
      case "hero":
        await saveHeroSection(body.data)
        break
      case "configurator":
      case "portfolio":
      case "contract":
      case "lifestyle":
        await saveJsonSection(body.kind, body.data)
        break
      case "navigation":
        await saveNavigation(body.data)
        break
      default:
        return NextResponse.json({ ok: false, error: "Unknown content payload" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save content",
      },
      { status: 500 },
    )
  }
}
