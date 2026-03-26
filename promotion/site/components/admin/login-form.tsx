"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  return (
    <Card className="w-full border-none bg-transparent shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Вход в CMS</CardTitle>
        <CardDescription>
          Используйте выданные email и пароль. Подтверждение почты для этой версии не требуется.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-0">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="owner@pegas.ru"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Пароль</Label>
          <Input
            id="admin-password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>
        {errorMessage ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="px-0">
        <Button
          type="button"
          className="w-full"
          disabled={isPending}
          onClick={() => {
            setErrorMessage("")

            startTransition(async () => {
              try {
                const supabase = getSupabaseBrowserClient()
                const { error } = await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password,
                })

                if (error) {
                  setErrorMessage(error.message)
                  return
                }

                router.replace("/admin")
                router.refresh()
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "Не удалось выполнить вход")
              }
            })
          }}
        >
          {isPending ? "Входим..." : "Войти"}
        </Button>
      </CardFooter>
    </Card>
  )
}
