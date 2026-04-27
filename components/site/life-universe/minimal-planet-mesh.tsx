"use client"

import { memo, useEffect, useMemo, useRef } from "react"

import { useFrame, useLoader } from "@react-three/fiber"
import { SRGBColorSpace, TextureLoader } from "three"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"
import {
  getMinimalOrbitAngularSpeed,
  getMinimalOrbitPosition,
  getMinimalOrbitSeed,
  getMinimalRotationAngularSpeed,
} from "@/components/site/life-universe/minimal-three-orbit"

const ACTIVE_GLOW_COLOR = "#fff1c8"

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
    return Math.max(11, baseRadius * 0.58)
  }

  if (body.renderLevel === "simple") {
    return Math.max(18, baseRadius * 0.82)
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
  const ringRef = useRef<{ rotation: { z: number } } | null>(null)
  const currentOrbitAngleRef = useRef(getMinimalOrbitSeed(body))
  const currentRotationAngleRef = useRef(0)
  const currentRingRotationAngleRef = useRef(0)

  const radius = useMemo(() => getPlanetRadius(body), [body])
  const illustrationMap = useLoader(TextureLoader, body.illustration)
  illustrationMap.colorSpace = SRGBColorSpace
  const visualHeight = radius * 2.35
  const visualWidth = visualHeight * body.illustrationAspectRatio
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
    if (!orbitRef.current || !bodyRef.current) {
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

    if (ringRef.current) {
      ringRef.current.rotation.z = currentRingRotationAngleRef.current
    }
  })

  return (
    <group
      ref={orbitRef}
      {...testProps}
      onDoubleClick={() => onEnterPlanet(body.id)}
      onPointerLeave={() => onLeavePlanet(body.id)}
      onPointerMove={(event: { clientX?: number; clientY?: number; nativeEvent?: { clientX?: number; clientY?: number }; sourceEvent?: { clientX?: number; clientY?: number } }) =>
        onHoverPlanet(body.id, resolvePointerPoint(event))
      }
    >
      <group ref={bodyRef}>
        <mesh>
          <planeGeometry args={[visualWidth, visualHeight]} />
          <meshBasicMaterial
            alphaTest={0.04}
            map={illustrationMap}
            opacity={isDimmed ? 0.5 : 1}
            transparent
          />
        </mesh>
        {isActive ? (
          <mesh scale={1.08}>
            <planeGeometry args={[visualWidth, visualHeight]} />
            <meshBasicMaterial color={ACTIVE_GLOW_COLOR} opacity={0.12} transparent />
          </mesh>
        ) : null}
      </group>
    </group>
  )
})
