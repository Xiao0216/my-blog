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
    <aside className="pointer-events-auto absolute top-5 bottom-5 left-4 z-30 hidden w-12 flex-col items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] py-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:flex">
      <button
        type="button"
        aria-label="关闭空间"
        className="grid h-7 w-7 place-items-center rounded-full border border-violet-200/20 bg-violet-300/20 text-violet-100 shadow-[0_0_24px_rgba(167,139,250,0.45)] outline-none transition hover:bg-violet-300/30 focus-visible:ring-2 focus-visible:ring-violet-100/60"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <nav aria-label="Null Space navigation" className="grid gap-4">
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
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(207,250,254,0.9)]" />
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
      className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 outline-none transition hover:bg-white/10 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-teal-100/60"
    >
      {children}
    </button>
  )
}

export function MobileBrandMark() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full border border-teal-100/20 bg-teal-200/10 text-teal-100 md:hidden">
      <Sparkles className="h-4 w-4" />
    </div>
  )
}
