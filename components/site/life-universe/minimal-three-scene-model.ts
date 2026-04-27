import type { PlanetUniverseBodyModel, PlanetRenderLevel } from "@/components/site/life-universe/types"

export type MinimalColorScheme = "sage" | "warm" | "mist" | "slate" | "rose"

export type MinimalThreeBody = PlanetUniverseBodyModel & {
  readonly colorScheme: MinimalColorScheme
  readonly hasRing: boolean
  readonly position: readonly [number, number, number]
  readonly renderLevel: PlanetRenderLevel
}

export type MinimalStarPoint = {
  readonly id: string
  readonly intensity: number
  readonly kind: "fragment" | "star"
  readonly position: readonly [number, number, number]
  readonly size: number
  readonly targetPlanetId?: string
}

export type MinimalThreeScene = {
  readonly bodies: ReadonlyArray<MinimalThreeBody>
  readonly stars: ReadonlyArray<MinimalStarPoint>
}

type MinimalColorSchemeInput = {
  readonly index: number
  readonly tone: PlanetUniverseBodyModel["tone"]
}

const tonePalettes: Record<PlanetUniverseBodyModel["tone"], ReadonlyArray<MinimalColorScheme>> = {
  blue: ["slate"],
  cyan: ["sage", "warm"],
  emerald: ["sage", "warm"],
  neutral: ["rose"],
  teal: ["sage", "slate"],
  violet: ["mist"],
}

export function getMinimalColorScheme({
  tone,
  index,
}: MinimalColorSchemeInput): MinimalColorScheme {
  const palette = tonePalettes[tone]
  return palette[index % palette.length]
}

export function buildMinimalThreeScene(
  planets: ReadonlyArray<PlanetUniverseBodyModel>
): MinimalThreeScene {
  const minSize = planets.reduce(
    (lowest, planet) => Math.min(lowest, planet.size),
    Number.POSITIVE_INFINITY
  )
  const maxSize = planets.reduce(
    (highest, planet) => Math.max(highest, planet.size),
    Number.NEGATIVE_INFINITY
  )
  const bodySeed = hashSceneSeed(planets)

  return {
    bodies: planets.map((planet, index) =>
      buildMinimalThreeBody(planet, index, planets.length, minSize, maxSize)
    ),
    stars: buildMinimalStarField(bodySeed, planets),
  }
}

function buildMinimalThreeBody(
  planet: PlanetUniverseBodyModel,
  index: number,
  totalPlanets: number,
  minSize: number,
  maxSize: number
): MinimalThreeBody {
  const normalizedSize = normalizeSize(planet.size, minSize, maxSize)
  const angleRadians = degreesToRadians(planet.orbit.startAngle + index * 11)
  const orbitRadius = planet.orbit.radius
  const zOffset = roundToTwo((normalizedSize - 0.5) * 64 + planet.orbit.delaySeconds * 6)

  return {
    ...planet,
    colorScheme: getMinimalColorScheme({ tone: planet.tone, index }),
    hasRing: normalizedSize >= 0.5 || planet.publicMemoryCount + planet.assistantMemoryCount > 0,
    position: [
      roundToTwo(Math.cos(angleRadians) * orbitRadius),
      roundToTwo(Math.sin(angleRadians) * orbitRadius * 0.72),
      roundToTwo(zOffset),
    ],
    renderLevel: resolveRenderLevel(index, totalPlanets),
    size: normalizedSize,
  }
}

function resolveRenderLevel(
  index: number,
  totalPlanets: number
): PlanetRenderLevel {
  if (totalPlanets > 16 && index >= 16) {
    return "point"
  }

  if (totalPlanets > 8 && index >= 8) {
    return "simple"
  }

  return "full"
}

function buildMinimalStarField(
  seed: number,
  planets: ReadonlyArray<PlanetUniverseBodyModel>
): ReadonlyArray<MinimalStarPoint> {
  const starCount = Math.max(25, Math.min(60, 24 + Math.round(planets.length * 1.7)))
  const stars: MinimalStarPoint[] = []

  for (let index = 0; index < starCount; index += 1) {
    const value = mixSeed(seed, index)
    const x = roundToTwo(normalizeSigned((value >>> 0) % 997, 998) * 900)
    const y = roundToTwo(normalizeSigned((value >>> 10) % 991, 992) * 640)
    const z = roundToTwo(normalizeSigned((value >>> 20) % 983, 984) * 700)
    const targetPlanet = planets.length > 0 ? planets[index % planets.length] : undefined

    stars.push({
      id: `ambient-${index + 1}`,
      intensity: roundToTwo(0.4 + ((value >>> 2) % 60) / 100),
      kind: index % 5 === 0 ? "fragment" : "star",
      position: [x, y, z],
      size: roundToTwo(0.8 + ((value >>> 7) % 44) / 100),
      targetPlanetId: targetPlanet?.id,
    })
  }

  return stars
}

function hashSceneSeed(planets: ReadonlyArray<PlanetUniverseBodyModel>) {
  let hash = 2166136261

  for (const planet of planets) {
    hash = fnv1a(hash, planet.id)
    hash = fnv1a(hash, planet.slug)
    hash = fnv1a(hash, planet.name)
    hash = fnv1a(hash, String(planet.size))
    hash = fnv1a(hash, String(planet.orbit.delaySeconds))
    hash = fnv1a(hash, String(planet.orbit.durationSeconds))
    hash = fnv1a(hash, String(planet.orbit.radius))
    hash = fnv1a(hash, String(planet.orbit.startAngle))
  }

  return hash
}

function fnv1a(seed: number, value: string) {
  let hash = seed

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function mixSeed(seed: number, index: number) {
  let value = seed ^ Math.imul(index + 1, 374761393)
  value ^= value >>> 13
  value = Math.imul(value, 1274126177)
  value ^= value >>> 16
  return value >>> 0
}

function normalizeSize(size: number, minSize: number, maxSize: number) {
  if (!Number.isFinite(minSize) || !Number.isFinite(maxSize) || maxSize <= minSize) {
    return 0.5
  }

  return roundToTwo((size - minSize) / (maxSize - minSize))
}

function normalizeSigned(value: number, modulus: number) {
  return (value / modulus) * 2 - 1
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100
}
