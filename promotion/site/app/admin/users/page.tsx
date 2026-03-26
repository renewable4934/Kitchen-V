import { AdminShell } from "@/components/admin/admin-shell"
import { UserManagement } from "@/components/admin/user-management"
import { requireOwnerPageUser } from "@/lib/admin-auth"
import { listAdminUsers } from "@/lib/admin-users"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const adminUser = await requireOwnerPageUser()
  const users = await listAdminUsers()

  return (
    <AdminShell adminUser={adminUser} currentPath="/admin/users">
      <UserManagement initialUsers={users} />
    </AdminShell>
  )
}
