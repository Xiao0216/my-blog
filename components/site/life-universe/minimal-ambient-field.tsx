"use client"

import { useMemo } from "react"

import type { MinimalStarPoint } from "@/components/site/life-universe/minimal-three-scene-model"
import type { AmbientPreviewKind } from "@/components/site/life-universe/types"

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
  onHoverAmbient,
  onLeaveAmbient,
}: {
  readonly stars: ReadonlyArray<MinimalStarPoint>
  readonly onEnterPlanet: (planetId: string) => void
  readonly onHoverAmbient: (ambient: {
    readonly id: string
    readonly kind: AmbientPreviewKind
    readonly point: { x: number; y: number }
    readonly targetPlanetId: string
  }) => void
  readonly onLeaveAmbient: (ambientId: string) => void
}) {
  const interactiveStars = useMemo(
    () => stars.filter((star) => star.kind !== "background" && Boolean(star.targetPlanetId)),
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

        const radius = star.kind === "fragment" ? star.size * 5.8 + 4.8 : star.size * 5.2 + 4.2
        const hitRadius = Math.max(16, radius * 2.4)
        const opacity = star.kind === "fragment" ? 0.72 : 0.82

        return (
          <group
            key={star.id}
            position={star.position}
            onClick={() => {
              if (star.href && typeof window !== "undefined") {
                window.location.href = star.href
                return
              }

              onEnterPlanet(targetPlanetId)
            }}
            onDoubleClick={() => {
              if (star.href && typeof window !== "undefined") {
                window.location.href = star.href
                return
              }

              onEnterPlanet(targetPlanetId)
            }}
            onPointerLeave={() => onLeaveAmbient(star.id)}
            onPointerMove={(event: {
              clientX?: number
              clientY?: number
              nativeEvent?: { clientX?: number; clientY?: number }
              sourceEvent?: { clientX?: number; clientY?: number }
            }) =>
              onHoverAmbient({
                id: star.id,
                kind: star.kind === "fragment" ? "fragment" : "star",
                point: resolvePointerPoint(event),
                targetPlanetId,
              })
            }
          >
            {star.kind === "fragment" ? (
              <mesh rotation={[0.45, 0.2, 0.78]}>
                <dodecahedronGeometry args={[radius, 0]} />
                <meshStandardMaterial color="#d7b98f" emissive="#9b6f3f" emissiveIntensity={0.42} opacity={opacity} roughness={0.82} transparent />
              </mesh>
            ) : (
              <mesh>
                <sphereGeometry args={[radius, 12, 10]} />
                <meshBasicMaterial color="#fff2cf" opacity={opacity} transparent />
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
