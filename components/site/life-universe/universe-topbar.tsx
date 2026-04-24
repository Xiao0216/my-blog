import { Filter, Moon, Search, Sparkles, Sun } from "lucide-react"

import { MobileBrandMark } from "@/components/site/life-universe/universe-sidebar"
import type { NullSpaceTheme } from "@/components/site/life-universe/types"

export function UniverseTopbar({
  theme,
  onToggleTheme,
}: {
  readonly theme: NullSpaceTheme
  readonly onToggleTheme: () => void
}) {
  return (
    <header className="pointer-events-auto absolute top-5 right-5 left-5 z-20 flex items-center justify-between gap-4 md:left-24">
      <div className="flex items-center gap-3">
        <MobileBrandMark />
        <div className="null-space-brand-orb grid h-8 w-8 place-items-center rounded-full max-md:hidden">
          <span className="h-3 w-3 rounded-full bg-[var(--ns-accent-primary)] shadow-[0_0_16px_var(--ns-accent-primary)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ns-text-primary)]">
            Null Space
          </p>
          <p className="text-[0.68rem] text-[var(--ns-text-tertiary)]">
            A Thoughtful Blog
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="搜索空间"
          className="null-space-control hidden h-8 items-center gap-2 px-3 text-xs outline-none transition hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)] sm:inline-flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>⌘ K</span>
        </button>
        <button
          type="button"
          aria-label={theme === "dark" ? "切换白天模式" : "切换黑夜模式"}
          onClick={onToggleTheme}
          className="null-space-control grid h-8 w-8 place-items-center outline-none transition hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label="筛选空间"
          className="null-space-control grid h-8 w-8 place-items-center outline-none transition hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="null-space-control inline-flex h-8 items-center gap-2 px-4 text-xs font-medium outline-none transition hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--ns-accent-primary)]" />
          New
        </button>
      </div>
    </header>
  )
}
