"use client"

import { useMemo } from "react"

import { useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"

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
  const starMap = useLoader(TextureLoader, "/planets/svg/content-star.svg")
  const fragmentMap = useLoader(TextureLoader, "/planets/svg/content-fragment.svg")
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

        const radius = star.kind === "fragment" ? star.size * 5.8 + 4.8 : star.size * 6.2 + 5.4
        const hitRadius = Math.max(22, radius * 2.8)
        const opacity = star.kind === "fragment" ? 0.82 : 0.92
        const visualSize = radius * (star.kind === "fragment" ? 2.15 : 2.35)
        const texture = star.kind === "fragment" ? fragmentMap : starMap

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
            <mesh>
              <planeGeometry args={[visualSize, visualSize]} />
              <meshBasicMaterial alphaTest={0.04} map={texture} opacity={opacity} transparent />
            </mesh>
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
