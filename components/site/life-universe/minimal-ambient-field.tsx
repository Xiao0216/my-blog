"use client"

import { useMemo } from "react"

import type { MinimalStarPoint } from "@/components/site/life-universe/minimal-three-scene-model"

function resolvePointerPoint(event: {
  readonly clientX?: number
  readonly clientY?: number
  readonly nativeEvent?: {
    readonly clientX?: number
    readonly clientY?: number
  }
  readonly sourceEvent?: {
    readonly clientX?: number
    readonly clientY?: number
  }
}) {
  const source = event.sourceEvent ?? event.nativeEvent ?? event

  return {
    x: source.clientX ?? 0,
    y: source.clientY ?? 0,
  }
}

export function MinimalAmbientField({
  stars,
  onEnterPlanet,
  onHoverPlanet,
  onLeavePlanet,
}: {
  readonly stars: ReadonlyArray<MinimalStarPoint>
  readonly onEnterPlanet: (planetId: string) => void
  readonly onHoverPlanet: (planetId: string, point: { x: number; y: number }) => void
  readonly onLeavePlanet: (planetId: string) => void
}) {
  const interactiveStars = useMemo(
    () => stars.filter((star) => Boolean(star.targetPlanetId)),
    [stars]
  )
  const testProps =
    process.env.NODE_ENV === "test"
      ? {
          "data-ambient-count": interactiveStars.length,
          "data-testid": "minimal-ambient-field",
        }
      : {}

  return (
    <group {...testProps}>
      {interactiveStars.map((star) => {
        const targetPlanetId = star.targetPlanetId

        if (!targetPlanetId) {
          return null
        }

        const radius = star.kind === "fragment" ? star.size * 4.8 + 3.8 : star.size * 3.4 + 2.8
        const hitRadius = Math.max(12, radius * 2.4)
        const opacity = star.kind === "fragment" ? 0.34 : 0.24

        return (
          <group
            key={star.id}
            position={star.position}
            onClick={() => onEnterPlanet(targetPlanetId)}
            onDoubleClick={() => onEnterPlanet(targetPlanetId)}
            onPointerLeave={() => onLeavePlanet(targetPlanetId)}
            onPointerMove={(event: {
              clientX?: number
              clientY?: number
              nativeEvent?: { clientX?: number; clientY?: number }
              sourceEvent?: { clientX?: number; clientY?: number }
            }) => onHoverPlanet(targetPlanetId, resolvePointerPoint(event))}
          >
            {star.kind === "fragment" ? (
              <mesh rotation={[0.45, 0.2, 0.78]}>
                <dodecahedronGeometry args={[radius, 0]} />
                <meshStandardMaterial color="#c6aa84" emissive="#3f3326" emissiveIntensity={0.18} opacity={opacity} roughness={0.86} transparent />
              </mesh>
            ) : (
              <mesh>
                <sphereGeometry args={[radius, 12, 10]} />
                <meshBasicMaterial color="#f1ddc0" opacity={opacity} transparent />
              </mesh>
            )}
            <mesh visible={false}>
              <sphereGeometry args={[hitRadius, 12, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
