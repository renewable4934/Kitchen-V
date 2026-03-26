import path from "node:path"

import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { requireAdminApiUser } from "@/lib/admin-auth"
import { getSupabaseAdminClient } from "@/lib/supabase"

const BUCKET_NAME = "cms-media"
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

function sanitizeAssetKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(request: Request) {
  const authResult = await requireAdminApiUser()
  if (!authResult.ok) {
    return authResult.response
  }

  const client = getSupabaseAdminClient()
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is required for asset uploads" },
      { status: 500 },
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const rawAssetKey = String(formData.get("assetKey") || "")
    const alt = String(formData.get("alt") || "")

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Файл не найден" }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ ok: false, error: "Допустимы JPG, PNG, WebP и AVIF" }, { status: 400 })
    }

    const assetKey = sanitizeAssetKey(rawAssetKey)
    if (!assetKey) {
      return NextResponse.json({ ok: false, error: "Укажите asset key" }, { status: 400 })
    }

    const extension = path.extname(file.name || "").toLowerCase() || ".webp"
    const storagePath = `assets/${assetKey}${extension}`

    const uploadResult = await client.storage.from(BUCKET_NAME).upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
    })

    if (uploadResult.error) {
      throw new Error(uploadResult.error.message)
    }

    const { data: publicData } = client.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

    const assetResult = await client.from("cms_assets").upsert(
      {
        asset_key: assetKey,
        site_id: "main",
        public_url: publicData.publicUrl,
        alt,
        metadata: {
          bucket: BUCKET_NAME,
          path: storagePath,
          uploaded_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "asset_key" },
    )

    if (assetResult.error) {
      throw new Error(assetResult.error.message)
    }

    revalidatePath("/")
    revalidatePath("/admin")

    return NextResponse.json({
      ok: true,
      asset: {
        assetKey,
        publicUrl: publicData.publicUrl,
        alt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось загрузить файл",
      },
      { status: 500 },
    )
  }
}
