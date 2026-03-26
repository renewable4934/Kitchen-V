"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminRole } from "@/lib/admin-auth"
import type { AdminUserRecord } from "@/lib/admin-users"

type UserManagementProps = {
  initialUsers: AdminUserRecord[]
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    role: "editor" as AdminRole,
    displayName: "",
  })
  const [status, setStatus] = useState("")
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(44,65,76,0.08)]">
        <CardHeader>
          <CardTitle>Создать пользователя</CardTitle>
          <CardDescription>
            Письма не отправляются. Новый пользователь сразу получает рабочий email + пароль.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-display-name">Имя</Label>
              <Input
                id="create-display-name"
                value={createForm.displayName}
                onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })}
                placeholder="Василий"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
                placeholder="editor@pegas.ru"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Пароль</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
                placeholder="Не короче 8 символов"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Роль</Label>
              <select
                id="create-role"
                value={createForm.role}
                onChange={(event) => setCreateForm({ ...createForm, role: event.target.value as AdminRole })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="editor">editor</option>
                <option value="owner">owner</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{status}</p>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => {
                setStatus("")

                startTransition(async () => {
                  const response = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(createForm),
                  })

                  const payload = await response.json()
                  if (!response.ok || !payload.ok) {
                    setStatus(payload.error || "Не удалось создать пользователя")
                    return
                  }

                  setUsers([payload.user, ...users])
                  setCreateForm({
                    email: "",
                    password: "",
                    role: "editor",
                    displayName: "",
                  })
                  setStatus(`Пользователь ${payload.user.email} создан`)
                })
              }}
            >
              {isPending ? "Создаём..." : "Создать пользователя"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(44,65,76,0.08)]">
        <CardHeader>
          <CardTitle>Текущие пользователи</CardTitle>
          <CardDescription>
            Здесь можно поменять роль, обновить пароль или временно отключить доступ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Новый пароль</TableHead>
                <TableHead>Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <EditableUserRow
                  key={user.id}
                  user={user}
                  onUpdated={(updatedUser) => {
                    setUsers((currentUsers) =>
                      currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
                    )
                    setStatus(`Пользователь ${updatedUser.email} обновлён`)
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function EditableUserRow({
  user,
  onUpdated,
}: {
  user: AdminUserRecord
  onUpdated: (user: AdminUserRecord) => void
}) {
  const [draft, setDraft] = useState({
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,
    password: "",
  })
  const [rowStatus, setRowStatus] = useState("")
  const [isPending, startTransition] = useTransition()

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <Input
          value={draft.displayName}
          onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
          placeholder="Имя"
        />
      </TableCell>
      <TableCell className="whitespace-normal">{user.email}</TableCell>
      <TableCell>
        <select
          value={draft.role}
          onChange={(event) => setDraft({ ...draft, role: event.target.value as AdminRole })}
          className="flex h-10 min-w-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="editor">editor</option>
          <option value="owner">owner</option>
        </select>
      </TableCell>
      <TableCell>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
          />
          {draft.isActive ? "Активен" : "Отключён"}
        </label>
      </TableCell>
      <TableCell className="whitespace-normal">
        <Input
          type="password"
          value={draft.password}
          onChange={(event) => setDraft({ ...draft, password: event.target.value })}
          placeholder="Оставьте пустым"
        />
        {rowStatus ? <p className="mt-2 text-xs text-muted-foreground">{rowStatus}</p> : null}
      </TableCell>
      <TableCell>
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setRowStatus("")

            startTransition(async () => {
              const response = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(draft),
              })

              const payload = await response.json()
              if (!response.ok || !payload.ok) {
                setRowStatus(payload.error || "Ошибка обновления")
                return
              }

              setDraft({ ...draft, password: "" })
              setRowStatus("Сохранено")
              onUpdated(payload.user)
            })
          }}
        >
          {isPending ? "..." : "Сохранить"}
        </Button>
      </TableCell>
    </TableRow>
  )
}
