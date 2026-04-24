import { Hand, Maximize2, Minus, Network, Plus, Search } from "lucide-react"
import type { ReactNode } from "react"

export function UniverseToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  readonly zoom: number
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onReset: () => void
}) {
  return (
    <div className="pointer-events-auto absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <ToolbarButton label="抓手模式">
        <Hand className="h-4 w-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="画布搜索">
        <Search className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="缩小画布" onClick={onZoomOut}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <span
        data-testid="zoom-value"
        className="min-w-14 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center font-mono text-xs text-zinc-300"
      >
        {zoom}%
      </span>
      <ToolbarButton label="放大画布" onClick={onZoomIn}>
        <Plus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="重置画布视角" onClick={onReset}>
        <Maximize2 className="h-4 w-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="连接视图">
        <Network className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  readonly label: string
  readonly onClick?: () => void
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 outline-none transition hover:bg-white/10 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-teal-100/60"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden="true" className="h-5 w-px bg-white/10" />
}
