import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/85 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/85">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          {profile.name}
        </Link>

        <nav
          aria-label="Primary"
          className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500 md:order-2 md:w-auto md:justify-center md:gap-5 dark:text-zinc-400"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 inline-flex items-center gap-2 rounded-md border border-zinc-200/70 px-2.5 py-1.5 text-xs font-medium text-zinc-500 md:order-3 dark:border-zinc-800/70 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50" />
          <span>Open for work</span>
        </div>
      </div>
    </header>
  )
}
