import { NextResponse } from "next/server"

import { getCmsBootstrap } from "@/lib/cms"

export async function GET() {
  const bootstrap = await getCmsBootstrap()
  return NextResponse.json(bootstrap)
}
