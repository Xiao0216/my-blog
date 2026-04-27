import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ns-glass-border)] bg-[color-mix(in_srgb,var(--ns-bg-primary)_78%,transparent)] text-[var(--ns-text-primary)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-sm font-medium">
          <span className="null-space-brand-orb h-2.5 w-2.5 rounded-full" />
          {profile.name}
        </Link>

        <nav
          aria-label="主导航"
          className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--ns-text-tertiary)] md:order-2 md:w-auto md:justify-center md:gap-5"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--ns-accent-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 inline-flex items-center gap-2 rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-control-bg)] px-3 py-1.5 text-xs font-medium text-[var(--ns-text-tertiary)] shadow-[var(--ns-glass-shadow)] md:order-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ns-accent-primary)] shadow-[0_0_14px_var(--ns-particle-color)]" />
          <span>开放合作</span>
        </div>
      </div>
    </header>
  )
}
