"use client"

import { useMemo } from "react"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"

function flattenConnectionPoints(points: ReadonlyArray<readonly [number, number, number]>) {
  const positions = new Float32Array(points.length * 3)

  points.forEach((point, index) => {
    const offset = index * 3

    positions[offset] = point[0]
    positions[offset + 1] = point[1]
    positions[offset + 2] = point[2]
  })

  return positions
}

export function MinimalConnections({
  activePlanetId,
  bodies,
}: {
  readonly activePlanetId?: string
  readonly bodies: ReadonlyArray<MinimalThreeBody>
}) {
  const connections = useMemo(() => {
    if (!activePlanetId) {
      return []
    }

    const activeBody = bodies.find((body) => body.id === activePlanetId)

    if (!activeBody) {
      return []
    }

    return bodies
      .filter((body) => body.id !== activePlanetId)
      .slice(0, 3)
      .map((body) =>
        flattenConnectionPoints([
          activeBody.position,
          body.position,
        ])
      )
  }, [activePlanetId, bodies])

  return (
    <group data-testid="minimal-connections">
      {connections.map((positions, index) => (
        <line key={`${activePlanetId ?? "none"}-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              args={[positions, 3]}
              attach="attributes-position"
              count={positions.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#9f8f76" opacity={0.12} transparent />
        </line>
      ))}
    </group>
  )
}
