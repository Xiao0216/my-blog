import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"

export default async function ProtectedAdminLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  await requireAdminSession()

  return <AdminShell>{children}</AdminShell>
}
