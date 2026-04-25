import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-ui"

export default function ProtectedAdminLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
