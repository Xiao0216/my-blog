import Link from "next/link"

import { BookOpen, Box, Home, PenLine, Sparkles, UserRound } from "lucide-react"
import type { ReactNode } from "react"

const railLinks = [
  {
    href: "/",
    label: "首页",
    icon: <Home className="h-4 w-4" />,
  },
  {
    href: "/notes",
    label: "记录",
    icon: <PenLine className="h-4 w-4" />,
  },
  {
    href: "/projects",
    label: "作品",
    icon: <Box className="h-4 w-4" />,
  },
  {
    href: "/essays",
    label: "文章",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    href: "/about",
    label: "关于",
    icon: <UserRound className="h-4 w-4" />,
  },
] as const

export function UniverseSidebar() {
  return (
    <aside className="null-space-panel pointer-events-auto absolute top-5 bottom-5 left-4 z-30 hidden w-12 flex-col items-center justify-between py-4 md:flex">
      <div className="grid h-7 w-7 place-items-center rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-badge-bg)] text-[var(--ns-accent-secondary)] shadow-[0_0_24px_var(--ns-particle-glow)]">
        <Sparkles className="h-3.5 w-3.5" />
      </div>

      <nav aria-label="空境导航" className="grid gap-4">
        {railLinks.map((item) => (
          <RailLink key={item.href} href={item.href} label={item.label}>
            {item.icon}
          </RailLink>
        ))}
      </nav>

      <div className="grid gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--ns-accent-primary)] shadow-[0_0_18px_var(--ns-accent-primary)]" />
      </div>
      <div
        aria-hidden="true"
        className="null-space-orbit absolute -bottom-28 left-5 h-24 w-24 opacity-80"
      />
    </aside>
  )
}

function RailLink({
  href,
  label,
  children,
}: {
  readonly href: string
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded-md text-[var(--ns-text-tertiary)] outline-none transition hover:bg-[var(--ns-control-bg)] hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
    >
      {children}
    </Link>
  )
}

export function MobileBrandMark() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-control-bg)] text-[var(--ns-accent-primary)] md:hidden">
      <Sparkles className="h-4 w-4" />
    </div>
  )
}
