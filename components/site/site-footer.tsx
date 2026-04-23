import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

function isProtocolHref(href: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(href)
}

function isHttpHref(href: string) {
  return /^https?:\/\//i.test(href)
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-12 md:grid-cols-[1.4fr_.6fr]">
        <div className="space-y-3">
          <p className="font-heading text-3xl text-foreground">
            {profile.name}
          </p>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            一个把技术、文字和生活观察放在同一本私人刊物里的空间。
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          {siteConfig.footerLinks.map((item) => {
            const className = "transition-colors hover:text-foreground"

            if (isProtocolHref(item.href)) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={className}
                  rel={isHttpHref(item.href) ? "noreferrer" : undefined}
                  target={isHttpHref(item.href) ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              )
            }

            return (
              <Link key={item.href} href={item.href} className={className}>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
