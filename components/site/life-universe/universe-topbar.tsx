import { Filter, Search, Sparkles } from "lucide-react"

import { MobileBrandMark } from "@/components/site/life-universe/universe-sidebar"

export function UniverseTopbar() {
  return (
    <header className="pointer-events-auto absolute top-5 right-5 left-5 z-20 flex items-center justify-between gap-4 md:left-24">
      <div className="flex items-center gap-3">
        <MobileBrandMark />
        <div className="grid h-8 w-8 place-items-center rounded-full border border-violet-200/25 bg-violet-300/10 shadow-[0_0_26px_rgba(167,139,250,0.35)] max-md:hidden">
          <span className="h-3 w-3 rounded-full bg-teal-200 shadow-[0_0_16px_rgba(153,246,228,0.9)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Null Space</p>
          <p className="text-[0.68rem] text-zinc-500">A Thoughtful Blog</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="搜索空间"
          className="hidden h-8 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs text-zinc-500 shadow-xl shadow-black/20 outline-none backdrop-blur-xl transition hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-teal-100/60 sm:inline-flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>⌘ K</span>
        </button>
        <button
          type="button"
          aria-label="筛选空间"
          className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-zinc-500 shadow-xl shadow-black/20 outline-none backdrop-blur-xl transition hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-teal-100/60"
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 text-xs font-medium text-zinc-200 shadow-xl shadow-black/20 outline-none backdrop-blur-xl transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-100/60"
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-200" />
          New
        </button>
      </div>
    </header>
  )
}
