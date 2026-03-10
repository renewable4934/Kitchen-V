import { NextResponse } from "next/server"

import { storeLead } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await storeLead(body, request)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid request body" },
      { status: 500 },
    )
  }
}
