import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import type { AdminSessionUser } from "@/lib/admin-auth"

import { SignOutButton } from "./sign-out-button"

type AdminShellProps = {
  adminUser: AdminSessionUser
  currentPath: "/admin" | "/admin/users"
  children: React.ReactNode
}

const navigation = [
  { href: "/admin" as const, label: "Контент" },
  { href: "/admin/users" as const, label: "Пользователи", ownerOnly: true },
]

export function AdminShell({ adminUser, currentPath, children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f5f8fa_0%,_#edf3f6_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(44,65,76,0.09)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Pegas CMS</p>
              <h1 className="mt-3 font-serif text-3xl text-[#243742]">Управление сайтом</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Изменения сохраняются сразу в Supabase. Код сайта остаётся в `promotion/site`, контентом управляет CMS.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-border bg-secondary/55 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{adminUser.displayName}</p>
                <p className="text-muted-foreground">{adminUser.email}</p>
              </div>
              <Badge className="h-9 rounded-full px-4 text-sm capitalize">{adminUser.role}</Badge>
              <SignOutButton />
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {navigation
              .filter((item) => !item.ownerOnly || adminUser.role === "owner")
              .map((item) => {
                const active = item.href === currentPath

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-[#2f4954] text-white" : "bg-secondary text-foreground hover:bg-[#dfe9ee]"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
          </nav>
        </header>

        <section className="mt-6 flex-1">{children}</section>
      </div>
    </main>
  )
}
