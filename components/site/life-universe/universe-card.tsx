"use client"

import type { CSSProperties, MouseEvent } from "react"
import { memo, useState } from "react"

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
  readonly isSelected: boolean
  readonly onEnter: (cardId: string) => void
  readonly onSelect: (cardId: string) => void
}

export const UniverseCard = memo(function UniverseCard({
  card,
  isEntered,
  isSelected,
  onEnter,
  onSelect,
}: UniverseCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function handleMouseMove(event: MouseEvent<HTMLButtonElement>) {
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

  return (
    <button
      type="button"
      aria-label={`聚焦 ${card.title}`}
      data-testid="universe-card"
      data-kind={card.kind}
      data-layout-x={card.x}
      data-layout-y={card.y}
      data-layout-width={card.width}
      data-layout-height={card.height}
      data-layout-status={card.layoutStatus}
      data-ring={card.ring}
      data-entered={isEntered ? "true" : "false"}
      data-status={card.status}
      data-selected={isSelected ? "true" : "false"}
      onClick={() => onSelect(card.id)}
      onDoubleClick={() => onEnter(card.id)}
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
      <span className="font-mono text-[0.66rem] text-[var(--ns-text-tertiary)]">
        {card.category}
      </span>
      <span
        className={`mt-4 block font-semibold leading-tight text-[var(--ns-text-primary)] ${
          card.featured ? "text-3xl" : "text-base"
        }`}
      >
        {card.title}
      </span>
      <span
        className={`mt-3 block text-[var(--ns-text-tertiary)] ${
          card.featured ? "max-w-[17rem] text-sm leading-7" : "line-clamp-2 text-xs leading-5"
        }`}
      >
        {card.excerpt}
      </span>
      <span className="absolute bottom-5 left-5 font-mono text-[0.66rem] text-[var(--ns-text-muted)]">
        {card.date}
      </span>
      <span className="absolute top-4 right-5 rounded-full border border-[var(--ns-glass-border)] px-2 py-1 font-mono text-[0.56rem] text-[var(--ns-text-muted)]">
        {statusLabel[card.status]}
      </span>
    </button>
  )
})

function clampTilt(value: number) {
  return Math.max(-8, Math.min(8, value))
}
