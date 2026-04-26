import {
  BookOpen,
  Box,
  CircleDot,
  Heart,
  Home,
  PenLine,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"
import type { ReactNode } from "react"

export function UniverseSidebar() {
  return (
    <aside className="null-space-panel pointer-events-auto absolute top-5 bottom-5 left-4 z-30 hidden w-12 flex-col items-center justify-between py-4 md:flex">
      <button
        type="button"
        aria-label="关闭空间"
        className="grid h-7 w-7 place-items-center rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-badge-bg)] text-[var(--ns-accent-secondary)] shadow-[0_0_24px_var(--ns-particle-glow)] outline-none transition hover:bg-[var(--ns-control-bg)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-secondary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <nav aria-label="空境导航" className="grid gap-4">
        <RailIcon label="首页">
          <Home className="h-4 w-4" />
        </RailIcon>
        <RailIcon label="轨道">
          <CircleDot className="h-4 w-4" />
        </RailIcon>
        <RailIcon label="记录">
          <PenLine className="h-4 w-4" />
        </RailIcon>
        <RailIcon label="作品">
          <Box className="h-4 w-4" />
        </RailIcon>
        <RailIcon label="偏好">
          <Heart className="h-4 w-4" />
        </RailIcon>
        <RailIcon label="文章">
          <BookOpen className="h-4 w-4" />
        </RailIcon>
        <RailIcon label="关于">
          <UserRound className="h-4 w-4" />
        </RailIcon>
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

function RailIcon({
  label,
  children,
}: {
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded-md text-[var(--ns-text-tertiary)] outline-none transition hover:bg-[var(--ns-control-bg)] hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
    >
      {children}
    </button>
  )
}

export function MobileBrandMark() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-control-bg)] text-[var(--ns-accent-primary)] md:hidden">
      <Sparkles className="h-4 w-4" />
    </div>
  )
}
