"use client"

import { memo, useMemo, useRef } from "react"

import { useFrame } from "@react-three/fiber"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"
import type { PlanetRenderLevel } from "@/components/site/life-universe/types"

const COLOR_SCHEMES = {
  mist: {
    atmosphere: "#9d9aa8",
    ring: "#7d7884",
    surface: "#64606d",
  },
  rose: {
    atmosphere: "#a68f8a",
    ring: "#8d7470",
    surface: "#6f5955",
  },
  sage: {
    atmosphere: "#9aa68e",
    ring: "#7f8a75",
    surface: "#5f6a58",
  },
  slate: {
    atmosphere: "#8a97a5",
    ring: "#6f7a86",
    surface: "#55606c",
  },
  warm: {
    atmosphere: "#b39f87",
    ring: "#95816b",
    surface: "#746352",
  },
} as const

const SEGMENTS_BY_LEVEL: Record<PlanetRenderLevel, readonly [number, number]> = {
  full: [28, 28],
  point: [10, 10],
  simple: [18, 18],
}

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

function getPlanetRadius(body: MinimalThreeBody) {
  const baseRadius = 10 + body.size * 20

  if (body.renderLevel === "point") {
    return Math.max(3, baseRadius * 0.33)
  }

  if (body.renderLevel === "simple") {
    return baseRadius * 0.72
  }

  return baseRadius
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

export const MinimalPlanetMesh = memo(function MinimalPlanetMesh({
  body,
  isDimmed,
  isFocused,
  isHovered,
  isMotionPaused,
  onEnterPlanet,
  onHoverPlanet,
  onLeavePlanet,
}: {
  readonly body: MinimalThreeBody
  readonly isDimmed: boolean
  readonly isFocused: boolean
  readonly isHovered: boolean
  readonly isMotionPaused: boolean
  readonly onEnterPlanet: (planetId: string) => void
  readonly onHoverPlanet: (planetId: string, point: { x: number; y: number }) => void
  readonly onLeavePlanet: (planetId: string) => void
}) {
  const orbitRef = useRef<{
    position: { x: number; y: number; z: number }
    rotation: { z: number }
  } | null>(null)
  const bodyRef = useRef<{ scale: { setScalar: (value: number) => void } } | null>(null)
  const sphereRef = useRef<{ rotation: { y: number; z: number } } | null>(null)
  const ringRef = useRef<{ rotation: { z: number } } | null>(null)

  const colors = COLOR_SCHEMES[body.colorScheme]
  const radius = useMemo(() => getPlanetRadius(body), [body])
  const [widthSegments, heightSegments] = SEGMENTS_BY_LEVEL[body.renderLevel]
  const orbitTilt = useMemo(() => degreesToRadians(12), [])
  const orbitStart = useMemo(
    () => degreesToRadians(body.orbit.startAngle),
    [body.orbit.startAngle]
  )
  const orbitOffset = useMemo(() => body.orbit.delaySeconds * 0.15, [body.orbit.delaySeconds])
  const zOffset = body.position[2]
  const isActive = isHovered || isFocused

  useFrame(({ clock }) => {
    if (!orbitRef.current || !bodyRef.current || !sphereRef.current) {
      return
    }

    const orbitAngle = isMotionPaused
      ? orbitStart
      : orbitStart +
        orbitOffset +
        (clock.getElapsedTime() / Math.max(body.orbit.durationSeconds, 0.001)) * Math.PI * 2
    const quietScale = isActive ? 1.08 : isDimmed ? 0.9 : 1
    const rotationSpeed = body.rotation.durationSeconds <= 0 ? 0 : 1 / body.rotation.durationSeconds

    orbitRef.current.position.x = Math.cos(orbitAngle) * body.orbit.radius
    orbitRef.current.position.y = Math.sin(orbitAngle) * body.orbit.radius * 0.72
    orbitRef.current.position.z = zOffset
    orbitRef.current.rotation.z = orbitTilt

    bodyRef.current.scale.setScalar(quietScale)

    if (!isMotionPaused) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed * Math.PI * 2
      sphereRef.current.rotation.z = orbitTilt * 0.4

      if (ringRef.current) {
        ringRef.current.rotation.z = clock.getElapsedTime() * rotationSpeed * 0.35
      }
    }
  })

  return (
    <group
      ref={orbitRef}
      data-focused={isFocused ? "true" : "false"}
      data-hovered={isHovered ? "true" : "false"}
      data-testid={`minimal-planet-mesh-${body.id}`}
      onDoubleClick={() => onEnterPlanet(body.id)}
      onFocus={() => onHoverPlanet(body.id, { x: 0, y: 0 })}
      onPointerLeave={() => onLeavePlanet(body.id)}
      onPointerMove={(event: { clientX?: number; clientY?: number; nativeEvent?: { clientX?: number; clientY?: number }; sourceEvent?: { clientX?: number; clientY?: number } }) =>
        onHoverPlanet(body.id, resolvePointerPoint(event))
      }
    >
      <group ref={bodyRef}>
        <mesh ref={sphereRef} castShadow receiveShadow>
          <sphereGeometry args={[radius, widthSegments, heightSegments]} />
          <meshStandardMaterial
            color={colors.surface}
            emissive={isActive ? colors.atmosphere : colors.surface}
            emissiveIntensity={isActive ? 0.12 : isDimmed ? 0.015 : 0.03}
            metalness={0.08}
            opacity={isDimmed ? 0.72 : 1}
            transparent={isDimmed}
            roughness={0.94}
          />
        </mesh>
        <mesh position={[-radius * 0.2, radius * 0.12, radius * 0.5]}>
          <sphereGeometry args={[radius * 1.01, widthSegments, heightSegments]} />
          <meshBasicMaterial
            color={colors.atmosphere}
            opacity={isDimmed ? 0.04 : body.renderLevel === "point" ? 0.14 : 0.08}
            transparent
          />
        </mesh>
        {body.hasRing && body.renderLevel !== "point" ? (
          <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, Math.PI / 5]}>
            <ringGeometry args={[radius * 1.35, radius * 1.72, 48]} />
            <meshBasicMaterial
              color={colors.ring}
              opacity={isDimmed ? 0.08 : body.renderLevel === "simple" ? 0.16 : 0.22}
              side={2}
              transparent
            />
          </mesh>
        ) : null}
      </group>
    </group>
  )
})
