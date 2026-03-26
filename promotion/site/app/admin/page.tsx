import { AdminShell } from "@/components/admin/admin-shell"
import { ContentEditor } from "@/components/admin/content-editor"
import { requireAdminPageUser } from "@/lib/admin-auth"
import { getAdminCmsState } from "@/lib/admin-cms"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const adminUser = await requireAdminPageUser()
  const cmsState = await getAdminCmsState()

  return (
    <AdminShell adminUser={adminUser} currentPath="/admin">
      <ContentEditor content={cmsState.content} assets={cmsState.assets} adminRole={adminUser.role} />
    </AdminShell>
  )
}
