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
    <div className="null-space-panel pointer-events-auto absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
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
        className="min-w-14 rounded-xl border border-[var(--ns-glass-border)] bg-[var(--ns-control-bg)] px-3 py-2 text-center font-mono text-xs text-[var(--ns-text-secondary)]"
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
      className="grid h-9 w-9 place-items-center rounded-xl text-[var(--ns-text-tertiary)] outline-none transition hover:bg-[var(--ns-control-bg)] hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden="true" className="h-5 w-px bg-[var(--ns-glass-border)]" />
}
