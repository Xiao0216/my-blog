import type { ReactNode } from "react"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

type SiteShellProps = {
  children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="null-page-shell relative isolate min-h-screen overflow-hidden text-[var(--ns-text-primary)]">
      <div className="null-page-grid absolute inset-0" aria-hidden="true" />
      <div className="null-page-noise absolute inset-0" aria-hidden="true" />
      <div className="null-page-vignette absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
