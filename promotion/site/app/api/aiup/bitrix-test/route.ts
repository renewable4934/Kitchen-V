import { NextResponse, type NextRequest } from "next/server"

import { processAiupBitrixGatewayRequest, processAiupNativeWebhookRequest } from "@/lib/aiup-bitrix-gateway"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const dryRunOnly = request.nextUrl.searchParams.get("dry_run") === "1"
    if (Array.isArray(body["Контакты"])) {
      const result = await processAiupNativeWebhookRequest(body, {
        performWrite: !dryRunOnly,
        nativeRequestToken: request.nextUrl.searchParams.get("approval_token") || "",
      })
      return NextResponse.json(result.body, { status: result.status })
    }
    const result = await processAiupBitrixGatewayRequest(body, { performWrite: !dryRunOnly })
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid request body",
      },
      { status: 500 },
    )
  }
}
