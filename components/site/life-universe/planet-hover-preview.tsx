"use client"

import type { CSSProperties } from "react"

import type { PlanetPreviewModel } from "@/components/site/life-universe/types"

type PlanetHoverPreviewProps = {
  readonly anchor: {
    readonly x: number
    readonly y: number
  }
  readonly preview: PlanetPreviewModel
  readonly onEnter: () => void
}

const PREVIEW_WIDTH = 280
const PREVIEW_HEIGHT = 220
const PREVIEW_MARGIN = 16
const FALLBACK_VIEWPORT = {
  width: 1024,
  height: 768,
}

export function PlanetHoverPreview({
  anchor,
  preview,
  onEnter,
}: PlanetHoverPreviewProps) {
  const viewport = getViewportSize()
  const left = clamp(
    anchor.x,
    PREVIEW_MARGIN,
    viewport.width - PREVIEW_WIDTH - PREVIEW_MARGIN
  )
  const top = clamp(
    anchor.y,
    PREVIEW_MARGIN,
    viewport.height - PREVIEW_HEIGHT - PREVIEW_MARGIN
  )

  return (
    <div
      role="dialog"
      aria-label={`${preview.title} 预览`}
      className="planet-hover-preview"
      style={
        {
          position: "fixed",
          left,
          top,
          width: `${PREVIEW_WIDTH}px`,
          maxWidth: `calc(100vw - ${PREVIEW_MARGIN * 2}px)`,
        } as CSSProperties
      }
    >
      <div>{preview.meta}</div>
      <div>{preview.title}</div>
      <div>{preview.summary}</div>
      <div>{preview.hint}</div>
      <button
        type="button"
        aria-label={`进入 ${preview.title}`}
        onClick={() => onEnter()}
      >
        进入 {preview.title}
      </button>
    </div>
  )
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return FALLBACK_VIEWPORT
  }

  return {
    width: window.innerWidth || FALLBACK_VIEWPORT.width,
    height: window.innerHeight || FALLBACK_VIEWPORT.height,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}
