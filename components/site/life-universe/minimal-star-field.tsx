"use client"

import { useMemo } from "react"

import type { MinimalStarPoint } from "@/components/site/life-universe/minimal-three-scene-model"

export function MinimalStarField({
  stars,
}: {
  readonly stars: ReadonlyArray<MinimalStarPoint>
}) {
  const testProps =
    process.env.NODE_ENV === "test"
      ? {
          "data-star-count": stars.length,
          "data-testid": "minimal-star-field",
        }
      : {}
  const { colors, positions, sizes } = useMemo(() => {
    const nextPositions = new Float32Array(stars.length * 3)
    const nextColors = new Float32Array(stars.length * 3)
    const nextSizes = new Float32Array(stars.length)

    stars.forEach((star, index) => {
      const offset = index * 3
      const warmth = star.kind === "background" ? 0.58 + star.intensity * 0.1 : 0.72 + star.intensity * 0.14

      nextPositions[offset] = star.position[0]
      nextPositions[offset + 1] = star.position[1]
      nextPositions[offset + 2] = star.position[2]

      nextColors[offset] = warmth
      nextColors[offset + 1] = warmth * 0.9
      nextColors[offset + 2] = warmth * 0.78

      nextSizes[index] = star.kind === "background" ? star.size * 0.75 : star.size
    })

    return {
      colors: nextColors,
      positions: nextPositions,
      sizes: nextSizes,
    }
  }, [stars])

  return (
    <points {...testProps}>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
          count={positions.length / 3}
        />
        <bufferAttribute
          args={[colors, 3]}
          attach="attributes-color"
          count={colors.length / 3}
        />
        <bufferAttribute
          args={[sizes, 1]}
          attach="attributes-size"
          count={sizes.length}
        />
      </bufferGeometry>
      <pointsMaterial color="#f1ddc0" opacity={0.72} size={2.2} sizeAttenuation transparent vertexColors />
    </points>
  )
}
