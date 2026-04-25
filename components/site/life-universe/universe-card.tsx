"use client"

import type { CSSProperties, KeyboardEvent, MouseEvent } from "react"
import { memo, useEffect, useRef, useState } from "react"
import { MoreHorizontal } from "lucide-react"

import type { UniverseCardModel } from "@/components/site/life-universe/types"

const toneClass = {
  blue: "before:bg-blue-300/70",
  cyan: "before:bg-cyan-200/80",
  emerald: "before:bg-emerald-200/80",
  neutral: "before:bg-zinc-200/70",
  teal: "before:bg-teal-200/80",
  violet: "before:bg-violet-300/80",
} satisfies Record<UniverseCardModel["tone"], string>

const statusLabel = {
  archived: "ARCHIVE",
  growing: "GROWING",
  mature: "MATURE",
  seedling: "SEED",
} satisfies Record<UniverseCardModel["status"], string>

type UniverseCardProps = {
  readonly card: UniverseCardModel
  readonly isEntered?: boolean
  readonly isRelated?: boolean
  readonly isSelected: boolean
  readonly onAskTwin: (cardId: string) => void
  readonly onEnter: (cardId: string) => void
  readonly onSelect: (cardId: string) => void
  readonly onShowRelated: (cardId: string) => void
}

export const UniverseCard = memo(function UniverseCard({
  card,
  isEntered,
  isRelated = true,
  isSelected,
  onAskTwin,
  onEnter,
  onSelect,
  onShowRelated,
}: UniverseCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const isCompact = card.height < 112
  const titleClassName = card.featured
    ? "mt-3 text-[1.18rem] leading-[1.38rem]"
    : isCompact
      ? "mt-1.5 text-[0.72rem] leading-[0.92rem]"
      : "mt-2.5 text-[0.82rem] leading-[1.05rem]"
  const excerptClassName = card.featured
    ? "mt-2 max-w-[17rem] text-[0.78rem] leading-5"
    : isCompact
      ? "mt-1 line-clamp-1 text-[0.58rem] leading-[0.78rem]"
      : "mt-1.5 line-clamp-2 text-[0.68rem] leading-4"
  const dateClassName = isCompact
    ? "mt-auto block pt-1.5 font-mono text-[0.56rem] text-[var(--ns-text-muted)]"
    : "mt-auto block pt-3 font-mono text-[0.62rem] text-[var(--ns-text-muted)]"

  useEffect(() => {
    if (!isSelected) {
      setIsMenuOpen(false)
    }
  }, [isSelected])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        cardRef.current?.contains(event.target)
      ) {
        return
      }

      setIsMenuOpen(false)
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMenuOpen])

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width || card.width
    const height = rect.height || card.height
    const localX = rect.width ? event.clientX - rect.left : 0
    const localY = rect.height ? event.clientY - rect.top : 0
    const rotateX = ((localY - height / 2) / (height / 2)) * -8
    const rotateY = ((localX - width / 2) / (width / 2)) * 8

    setTilt({
      x: clampTilt(rotateX),
      y: clampTilt(rotateY),
    })
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    onSelect(card.id)
  }

  function runMenuAction(action: (cardId: string) => void) {
    setIsMenuOpen(false)
    action(card.id)
  }

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`聚焦 ${card.title}`}
      data-testid="universe-card"
      data-compact={isCompact ? "true" : "false"}
      data-kind={card.kind}
      data-layout-x={card.x}
      data-layout-y={card.y}
      data-layout-width={card.width}
      data-layout-height={card.height}
      data-layout-status={card.layoutStatus}
      data-ring={card.ring}
      data-entered={isEntered ? "true" : "false"}
      data-related={isRelated ? "true" : "false"}
      data-status={card.status}
      data-selected={isSelected ? "true" : "false"}
      onClick={() => onSelect(card.id)}
      onDoubleClick={() => onEnter(card.id)}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={`null-space-card group absolute hidden text-left outline-none before:absolute before:right-7 before:bottom-6 before:h-2 before:w-2 before:rounded-full before:shadow-[0_0_24px_currentColor] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)] md:block ${
        toneClass[card.tone]
      } ${card.featured ? "z-20" : "z-10"}`}
      style={{
        "--card-rotate-x": `${card.posture.rotateX}deg`,
        "--card-rotate-y": `${card.posture.rotateY}deg`,
        "--card-rotate-z": `${card.posture.rotateZ}deg`,
        "--card-depth": `${card.posture.translateZ}px`,
        "--hover-tilt-x": `${tilt.x}deg`,
        "--hover-tilt-y": `${tilt.y}deg`,
        "--selected-scale": isSelected ? "1.06" : "1",
        "--tilt-x": `${tilt.x}deg`,
        "--tilt-y": `${tilt.y}deg`,
        height: card.height,
        left: card.x,
        top: card.y,
        transform:
          "perspective(1100px) translateZ(var(--card-depth)) rotateX(calc(var(--card-rotate-x) + var(--hover-tilt-x))) rotateY(calc(var(--card-rotate-y) + var(--hover-tilt-y))) rotateZ(var(--card-rotate-z)) scale(var(--selected-scale))",
        width: card.width,
      } as CSSProperties}
    >
      <span className="null-space-card-content">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0 truncate pr-2 font-mono text-[0.58rem] text-[var(--ns-text-tertiary)]">
            {card.category}
          </span>
          <span
            data-testid="universe-card-status"
            className="shrink-0 rounded-full border border-[var(--ns-glass-border)] px-1.5 py-0.5 font-mono text-[0.5rem] leading-none text-[var(--ns-text-muted)]"
          >
            {statusLabel[card.status]}
          </span>
        </span>
        <span
          className={`block font-semibold leading-tight text-[var(--ns-text-primary)] ${
            titleClassName
          }`}
        >
          {card.title}
        </span>
        <span
          className={`block min-h-0 text-[var(--ns-text-tertiary)] ${excerptClassName}`}
        >
          {card.excerpt}
        </span>
        <span
          data-testid="universe-card-date"
          className={dateClassName}
        >
          {card.date}
        </span>
      </span>

      {isSelected ? (
        <button
          type="button"
          data-universe-card-menu="true"
          aria-expanded={isMenuOpen ? "true" : "false"}
          aria-haspopup="menu"
          aria-label={`打开 ${card.title} 操作菜单`}
          className="null-space-card-menu-trigger"
          onClick={(event) => {
            event.stopPropagation()
            setIsMenuOpen((current) => !current)
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      {isSelected && isMenuOpen ? (
        <div
          role="menu"
          aria-label={`${card.title} 操作`}
          data-universe-card-menu="true"
          className="null-space-card-menu"
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            aria-label={`进入 ${card.title}`}
            onClick={() => runMenuAction(onEnter)}
          >
            进入
          </button>
          <button
            type="button"
            role="menuitem"
            aria-label={`询问 ${card.title}`}
            onClick={() => runMenuAction(onAskTwin)}
          >
            问 AI
          </button>
          <button
            type="button"
            role="menuitem"
            aria-label={`查看 ${card.title} 关联`}
            onClick={() => runMenuAction(onShowRelated)}
          >
            关联
          </button>
        </div>
      ) : null}
    </div>
  )
})

function clampTilt(value: number) {
  return Math.max(-8, Math.min(8, value))
}
