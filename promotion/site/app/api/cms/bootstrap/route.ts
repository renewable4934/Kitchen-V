import { NextResponse } from "next/server"

import { getCmsBootstrap } from "@/lib/cms"

export const dynamic = "force-dynamic"

export async function GET() {
  const bootstrap = await getCmsBootstrap()
  return NextResponse.json(bootstrap)
}
