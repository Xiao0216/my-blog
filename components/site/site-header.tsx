import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050608]/88 text-zinc-50 backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium text-zinc-50"
        >
          {profile.name}
        </Link>

        <nav
          aria-label="主导航"
          className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400 md:order-2 md:w-auto md:justify-center md:gap-5"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-teal-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-400 md:order-3">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-200 shadow-[0_0_14px_rgba(153,246,228,0.8)]" />
          <span>开放合作</span>
        </div>
      </div>
    </header>
  )
}
