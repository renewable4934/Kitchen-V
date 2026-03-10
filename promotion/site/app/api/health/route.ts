import { NextResponse } from "next/server"

import { getHealthStatus } from "@/lib/api"

export async function GET() {
  return NextResponse.json(getHealthStatus())
}
