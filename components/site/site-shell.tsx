import type { ReactNode } from "react"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

type SiteShellProps = {
  children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="content">{children}</main>
      <SiteFooter />
    </div>
  )
}
