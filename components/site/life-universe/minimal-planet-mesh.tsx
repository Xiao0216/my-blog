"use client"

import { memo, useEffect, useMemo, useRef } from "react"

import { useFrame } from "@react-three/fiber"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"
import {
  getMinimalOrbitAngularSpeed,
  getMinimalOrbitPosition,
  getMinimalOrbitSeed,
  getMinimalRotationAngularSpeed,
} from "@/components/site/life-universe/minimal-three-orbit"
import type { PlanetRenderLevel } from "@/components/site/life-universe/types"

const COLOR_SCHEMES = {
  mist: {
    atmosphere: "#c2b5d8",
    ring: "#9f91bd",
    surface: "#8f7db0",
  },
  rose: {
    atmosphere: "#d6abb2",
    ring: "#bd8f98",
    surface: "#a87882",
  },
  sage: {
    atmosphere: "#a9c0b8",
    ring: "#83a196",
    surface: "#6f968b",
  },
  slate: {
    atmosphere: "#a9c3d8",
    ring: "#83a5bd",
    surface: "#6d91aa",
  },
  warm: {
    atmosphere: "#d7c0aa",
    ring: "#bca08b",
    surface: "#a88772",
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

export const MinimalPlanetMesh = memo(function MinimalPlanetMesh({
  body,
  isDimmed,
  isFocused,
  isHovered,
  isMotionPaused,
  isReducedMotion,
  onEnterPlanet,
  onHoverPlanet,
  onLeavePlanet,
}: {
  readonly body: MinimalThreeBody
  readonly isDimmed: boolean
  readonly isFocused: boolean
  readonly isHovered: boolean
  readonly isMotionPaused: boolean
  readonly isReducedMotion: boolean
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
  const currentOrbitAngleRef = useRef(getMinimalOrbitSeed(body))
  const currentRotationAngleRef = useRef(0)
  const currentRingRotationAngleRef = useRef(0)

  const colors = COLOR_SCHEMES[body.colorScheme]
  const radius = useMemo(() => getPlanetRadius(body), [body])
  const [widthSegments, heightSegments] = SEGMENTS_BY_LEVEL[body.renderLevel]
  const orbitTilt = useMemo(() => (12 * Math.PI) / 180, [])
  const orbitSeed = useMemo(() => getMinimalOrbitSeed(body), [body])
  const isActive = isHovered || isFocused
  const isAnimationFrozen = isMotionPaused || isReducedMotion
  const testProps =
    process.env.NODE_ENV === "test"
      ? {
          "data-focused": isFocused ? "true" : "false",
          "data-hovered": isHovered ? "true" : "false",
          "data-testid": `minimal-planet-mesh-${body.id}`,
        }
      : {}

  useEffect(() => {
    currentOrbitAngleRef.current = orbitSeed
    currentRotationAngleRef.current = 0
    currentRingRotationAngleRef.current = 0
  }, [body.id, orbitSeed])

  useFrame((_, delta = 0) => {
    if (!orbitRef.current || !bodyRef.current || !sphereRef.current) {
      return
    }

    const quietScale = isActive ? 1.08 : isDimmed ? 0.9 : 1
    const safeDelta = Math.max(0, delta)
    const orbitSpeed = getMinimalOrbitAngularSpeed(body)
    const rotationSpeed = getMinimalRotationAngularSpeed(body)

    if (!isAnimationFrozen) {
      currentOrbitAngleRef.current += safeDelta * orbitSpeed
      currentRotationAngleRef.current += safeDelta * rotationSpeed
      currentRingRotationAngleRef.current += safeDelta * rotationSpeed * 0.35
    }

    const orbitAngle = currentOrbitAngleRef.current
    const [x, y, z] = getMinimalOrbitPosition(body, orbitAngle)

    orbitRef.current.position.x = x
    orbitRef.current.position.y = y
    orbitRef.current.position.z = z
    orbitRef.current.rotation.z = orbitTilt

    bodyRef.current.scale.setScalar(quietScale)

    sphereRef.current.rotation.y = currentRotationAngleRef.current
    sphereRef.current.rotation.z = orbitTilt * 0.4

    if (ringRef.current) {
      ringRef.current.rotation.z = currentRingRotationAngleRef.current
    }
  })

  return (
    <group
      ref={orbitRef}
      {...testProps}
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
            emissiveIntensity={isActive ? 0.18 : isDimmed ? 0.025 : 0.05}
            metalness={0.04}
            opacity={isDimmed ? 0.6 : 1}
            transparent={isDimmed}
            roughness={0.9}
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
