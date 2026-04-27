"use client"

import { memo, useEffect, useMemo, useRef } from "react"

import { useFrame } from "@react-three/fiber"
import { CanvasTexture, Color, SRGBColorSpace, type Texture } from "three"

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
  full: [64, 48],
  point: [18, 14],
  simple: [40, 32],
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

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function seededNoise(seed: number) {
  let state = seed || 1

  return () => {
    state = Math.imul(1664525, state) + 1013904223
    return ((state >>> 0) % 10000) / 10000
  }
}

function colorMix(color: string, target: string, amount: number) {
  return new Color(color).lerp(new Color(target), amount).getStyle()
}

function createPlanetCanvasTexture({
  colors,
  kind,
  renderLevel,
  seed,
}: {
  readonly colors: (typeof COLOR_SCHEMES)[keyof typeof COLOR_SCHEMES]
  readonly kind: "surface" | "bump"
  readonly renderLevel: PlanetRenderLevel
  readonly seed: number
}): Texture | null {
  if (typeof document === "undefined") {
    return null
  }

  const size = renderLevel === "full" ? 512 : renderLevel === "simple" ? 320 : 160
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d")

  if (!context) {
    return null
  }

  const random = seededNoise(seed)
  const base = kind === "bump" ? "#777777" : colors.surface
  const shadow = kind === "bump" ? "#4f4f4f" : colorMix(colors.surface, "#111827", 0.34)
  const highlight = kind === "bump" ? "#c4c4c4" : colorMix(colors.atmosphere, "#fff7ed", 0.28)
  const mid = kind === "bump" ? "#929292" : colorMix(colors.surface, colors.atmosphere, 0.38)

  const background = context.createLinearGradient(0, 0, size, size)
  background.addColorStop(0, highlight)
  background.addColorStop(0.46, base)
  background.addColorStop(1, shadow)
  context.fillStyle = background
  context.fillRect(0, 0, size, size)

  const bandCount = renderLevel === "point" ? 8 : 15

  for (let index = 0; index < bandCount; index += 1) {
    const y = random() * size
    const thickness = (0.018 + random() * 0.055) * size
    const wave = (random() - 0.5) * size * 0.18
    const alpha = kind === "bump" ? 0.16 + random() * 0.18 : 0.08 + random() * 0.14

    context.beginPath()
    context.moveTo(0, y)

    for (let x = 0; x <= size; x += size / 8) {
      const curveY = y + Math.sin((x / size) * Math.PI * 2 + random() * 2) * wave
      context.lineTo(x, curveY)
    }

    context.lineTo(size, y + thickness)
    context.lineTo(0, y + thickness * (0.65 + random() * 0.7))
    context.closePath()
    context.fillStyle = kind === "bump" ? `rgba(255,255,255,${alpha})` : colorMix(mid, highlight, random() * 0.5)
    context.globalAlpha = alpha
    context.fill()
    context.globalAlpha = 1
  }

  const markCount = renderLevel === "full" ? 190 : renderLevel === "simple" ? 90 : 28

  for (let index = 0; index < markCount; index += 1) {
    const x = random() * size
    const y = random() * size
    const radius = (0.004 + random() * 0.022) * size
    const crater = context.createRadialGradient(x, y, 0, x, y, radius)
    const alpha = 0.05 + random() * 0.16

    crater.addColorStop(0, kind === "bump" ? `rgba(255,255,255,${alpha})` : colorMix(highlight, base, random() * 0.35))
    crater.addColorStop(0.62, kind === "bump" ? `rgba(108,108,108,${alpha})` : colorMix(base, shadow, random() * 0.24))
    crater.addColorStop(1, "rgba(0,0,0,0)")
    context.fillStyle = crater
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  const terminator = context.createLinearGradient(0, 0, size, 0)
  terminator.addColorStop(0, "rgba(255,255,255,0.22)")
  terminator.addColorStop(0.5, "rgba(255,255,255,0)")
  terminator.addColorStop(1, "rgba(0,0,0,0.2)")
  context.fillStyle = terminator
  context.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true

  return texture
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
  const textureSeed = useMemo(() => hashString(`${body.id}:${body.colorScheme}:${body.size}`), [body])
  const surfaceMap = useMemo(
    () =>
      createPlanetCanvasTexture({
        colors,
        kind: "surface",
        renderLevel: body.renderLevel,
        seed: textureSeed,
      }),
    [body.renderLevel, colors, textureSeed]
  )
  const bumpMap = useMemo(
    () =>
      createPlanetCanvasTexture({
        colors,
        kind: "bump",
        renderLevel: body.renderLevel,
        seed: textureSeed + 97,
      }),
    [body.renderLevel, colors, textureSeed]
  )
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

  useEffect(
    () => () => {
      surfaceMap?.dispose()
      bumpMap?.dispose()
    },
    [bumpMap, surfaceMap]
  )

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
      onPointerLeave={() => onLeavePlanet(body.id)}
      onPointerMove={(event: { clientX?: number; clientY?: number; nativeEvent?: { clientX?: number; clientY?: number }; sourceEvent?: { clientX?: number; clientY?: number } }) =>
        onHoverPlanet(body.id, resolvePointerPoint(event))
      }
    >
      <group ref={bodyRef}>
        <mesh ref={sphereRef} castShadow receiveShadow>
          <sphereGeometry args={[radius, widthSegments, heightSegments]} />
          <meshPhysicalMaterial
            color={colors.surface}
            emissive={isActive ? colors.atmosphere : "#05070a"}
            emissiveIntensity={isActive ? 0.12 : isDimmed ? 0.005 : 0.015}
            map={surfaceMap ?? undefined}
            bumpMap={bumpMap ?? undefined}
            bumpScale={body.renderLevel === "full" ? radius * 0.06 : radius * 0.035}
            clearcoat={0.08}
            clearcoatRoughness={0.72}
            metalness={0.02}
            opacity={isDimmed ? 0.58 : 1}
            transparent={isDimmed}
            roughness={0.78}
          />
        </mesh>
        {body.renderLevel !== "point" ? (
          <mesh scale={1.035}>
            <sphereGeometry args={[radius, widthSegments, heightSegments]} />
            <meshBasicMaterial
              color={colors.atmosphere}
              opacity={isDimmed ? 0.035 : isActive ? 0.12 : 0.07}
              transparent
              side={1}
            />
          </mesh>
        ) : null}
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
