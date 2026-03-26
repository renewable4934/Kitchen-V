"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AssetFieldProps = {
  defaultAssetKey?: string
  defaultAlt?: string
  onUploaded?: (asset: { assetKey: string; publicUrl: string; alt: string }) => void
}

export function AssetField({ defaultAssetKey = "", defaultAlt = "", onUploaded }: AssetFieldProps) {
  const [assetKey, setAssetKey] = useState(defaultAssetKey)
  const [alt, setAlt] = useState(defaultAlt)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState("")
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="asset-key">Asset key</Label>
          <Input
            id="asset-key"
            value={assetKey}
            onChange={(event) => setAssetKey(event.target.value)}
            placeholder="hero-kitchen"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="asset-alt">Alt-текст</Label>
          <Input
            id="asset-alt"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Современная кухня в тёплом свете"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="asset-file">Файл</Label>
          <Input
            id="asset-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              if (!file) {
                setStatus("Выберите файл")
                return
              }

              const formData = new FormData()
              formData.set("file", file)
              formData.set("assetKey", assetKey)
              formData.set("alt", alt)

              const response = await fetch("/api/admin/assets", {
                method: "POST",
                body: formData,
              })

              const payload = await response.json()
              if (!response.ok || !payload.ok) {
                setStatus(payload.error || "Не удалось загрузить изображение")
                return
              }

              setStatus(`Загружено: ${payload.asset.publicUrl}`)
              onUploaded?.(payload.asset)
            })
          }}
        >
          {isPending ? "Загрузка..." : "Загрузить"}
        </Button>
      </div>
      {status ? <p className="mt-3 text-sm text-muted-foreground">{status}</p> : null}
    </div>
  )
}
