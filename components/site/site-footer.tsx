import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

function hasProtocol(href: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(href)
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href)
}

function isDirectHref(href: string) {
  return /^(mailto:|tel:)/i.test(href)
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050608] text-zinc-50">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-10 sm:px-6 md:grid-cols-[1.4fr_.6fr]">
        <div className="space-y-3">
          <p className="font-mono text-sm font-medium text-zinc-50">
            {profile.name}
          </p>
          <p className="max-w-xl text-sm leading-7 text-zinc-500">
            一个把技术、文字和生活观察放在同一本私人刊物里的空间。
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-zinc-500">
          {siteConfig.footerLinks.map((item) => {
            const className =
              "transition-colors hover:text-teal-100"

            if (isExternalHref(item.href)) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={className}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              )
            }

            if (isDirectHref(item.href)) {
              return (
                <a key={item.href} href={item.href} className={className}>
                  {item.label}
                </a>
              )
            }

            if (hasProtocol(item.href)) {
              return (
                <span key={item.href} className={className}>
                  {item.label}
                </span>
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
