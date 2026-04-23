import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="space-y-1">
          <div className="font-heading text-2xl leading-none text-foreground">
            {profile.name}
          </div>
          <div className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
            {profile.roleLine}
          </div>
        </Link>

        <nav
          aria-label="Primary"
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground md:justify-end md:gap-6"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
