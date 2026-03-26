"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const supabase = getSupabaseBrowserClient()
          await supabase.auth.signOut()
          router.replace("/admin/login")
          router.refresh()
        })
      }}
    >
      {isPending ? "Выходим..." : "Выйти"}
    </Button>
  )
}
