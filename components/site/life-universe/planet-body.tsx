"use client"

import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react"

import type {
  PlanetRenderLevel,
  PlanetUniverseBodyModel,
} from "@/components/site/life-universe/types"

export type PlanetPoint = {
  readonly x: number
  readonly y: number
}

type PlanetBodyProps = {
  readonly planet: PlanetUniverseBodyModel
  readonly isFocused: boolean
  readonly isHovered: boolean
  readonly renderLevel: PlanetRenderLevel
  readonly onEnter: (planetId: string) => void
  readonly onHover: (planetId: string, point: PlanetPoint) => void
  readonly onLeave: (planetId: string) => void
  readonly onSelect: (planetId: string, point: PlanetPoint) => void
}

export function PlanetBody({
  planet,
  isFocused,
  isHovered,
  renderLevel,
  onEnter,
  onHover,
  onLeave,
  onSelect,
}: PlanetBodyProps) {
  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    onHover(planet.id, { x: event.clientX, y: event.clientY })
  }

  function handlePointerLeave() {
    onLeave(planet.id)
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onSelect(planet.id, { x: event.clientX, y: event.clientY })
  }

  function handleDoubleClick() {
    onEnter(planet.id)
  }

  function handleFocus() {
    onHover(planet.id, { x: 0, y: 0 })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      onEnter(planet.id)
      return
    }

    if (event.key === " ") {
      event.preventDefault()
      onSelect(planet.id, { x: 0, y: 0 })
    }
  }

  return (
    <button
      type="button"
      aria-label={`${planet.name} 行星`}
      data-testid="planet-body"
      data-focused={isFocused ? "true" : "false"}
      data-hovered={isHovered ? "true" : "false"}
      data-planet-id={planet.id}
      data-render-level={renderLevel}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onBlur={handlePointerLeave}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      className="planet-body"
      style={
        {
          "--planet-orbit-delay": `${planet.orbit.delaySeconds}s`,
          "--planet-orbit-duration": `${planet.orbit.durationSeconds}s`,
          "--planet-orbit-radius": `${planet.orbit.radius}px`,
          "--planet-rotation-duration": `${planet.rotation.durationSeconds}s`,
          "--planet-size": `${planet.size}px`,
          "--planet-start-angle": `${planet.orbit.startAngle}deg`,
        } as CSSProperties
      }
    >
      <span className={`planet-sphere planet-sphere-${planet.tone}`}>
        <span className="planet-shade" aria-hidden="true" />
      </span>
    </button>
  )
}
