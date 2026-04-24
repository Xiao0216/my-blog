import type { ReactNode } from "react"

import { SiteShell } from "@/components/site/site-shell"

export default function SiteLayout({ children }: { readonly children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
