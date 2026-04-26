"use client"

import { useMemo } from "react"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"

function buildOrbitPoints(radius: number, zOffset: number) {
  const segments = 96
  const points = new Float32Array((segments + 1) * 3)

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2
    const offset = index * 3

    points[offset] = Math.cos(angle) * radius
    points[offset + 1] = Math.sin(angle) * radius * 0.72
    points[offset + 2] = zOffset
  }

  return points
}

export function MinimalOrbitPaths({
  bodies,
}: {
  readonly bodies: ReadonlyArray<MinimalThreeBody>
}) {
  const orbitPoints = useMemo(
    () => bodies.map((body) => buildOrbitPoints(body.orbit.radius, body.position[2])),
    [bodies]
  )

  return (
    <group data-orbit-count={bodies.length} data-testid="minimal-orbit-paths">
      {orbitPoints.map((points, index) => (
        <line key={bodies[index].id}>
          <bufferGeometry>
            <bufferAttribute
              args={[points, 3]}
              attach="attributes-position"
              count={points.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#6f7379" opacity={0.18} transparent />
        </line>
      ))}
    </group>
  )
}
