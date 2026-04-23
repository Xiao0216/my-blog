import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="space-y-1">
          <div className="font-heading text-2xl leading-none text-foreground">
            {profile.name}
          </div>
          <div className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
            {profile.roleLine}
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
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
