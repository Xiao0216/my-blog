import type {
  PlanetUniverseBodyModel,
  PlanetRenderLevel,
  UniverseContentNodeModel,
} from "@/components/site/life-universe/types"

export type MinimalColorScheme = "sage" | "warm" | "mist" | "slate" | "rose"

export type MinimalThreePlanetAsset = {
  readonly cloudTexture?: string
  readonly emissive?: boolean
  readonly ringTexture?: string
  readonly texture: string
}

export type MinimalThreeBody = PlanetUniverseBodyModel & {
  readonly colorScheme: MinimalColorScheme
  readonly hasRing: boolean
  readonly illustration: string
  readonly illustrationAspectRatio: number
  readonly illustrationScale: number
  readonly planetAsset: MinimalThreePlanetAsset
  readonly position: readonly [number, number, number]
  readonly renderLevel: PlanetRenderLevel
}

export type MinimalStarPoint = {
  readonly contentType?: UniverseContentNodeModel["contentType"]
  readonly href?: string
  readonly id: string
  readonly intensity: number
  readonly kind: "background" | "fragment" | "star"
  readonly position: readonly [number, number, number]
  readonly size: number
  readonly summary?: string
  readonly targetPlanetId?: string
  readonly title?: string
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

const CONTENT_FIELD_BOUNDS = {
  x: 430,
  y: 250,
  z: 160,
} as const

const BACKGROUND_FIELD_BOUNDS = {
  x: 520,
  y: 300,
  z: 260,
} as const

const PLANET_ILLUSTRATIONS = [
  { aspectRatio: 822 / 637, path: "/planets/svg/beige-saturn.svg", scale: 2.55 },
  { aspectRatio: 1, path: "/planets/svg/pink-ring.svg", scale: 2.35 },
  { aspectRatio: 1, path: "/planets/svg/purple-sphere.svg", scale: 2.2 },
  { aspectRatio: 1, path: "/planets/svg/small-pink.svg", scale: 2.05 },
  { aspectRatio: 948 / 675, path: "/planets/svg/orange-ring.svg", scale: 2.5 },
  { aspectRatio: 1, path: "/planets/svg/mint-sphere.svg", scale: 2.2 },
  { aspectRatio: 1, path: "/planets/svg/small-bluegreen.svg", scale: 2.05 },
  { aspectRatio: 1, path: "/planets/svg/small-red.svg", scale: 2.05 },
  { aspectRatio: 1, path: "/planets/svg/dark-texture.svg", scale: 2.2 },
] as const

const THREEX_PLANET_ASSETS: Record<string, MinimalThreePlanetAsset> = {
  earth: { texture: "/planets/threex/earthmap1k.jpg" },
  earthcloud: {
    cloudTexture: "/planets/threex/earthcloudmaptrans.jpg",
    texture: "/planets/threex/earthmap1k.jpg",
  },
  jupiter: { texture: "/planets/threex/jupitermap.jpg" },
  mars: { texture: "/planets/threex/marsmap1k.jpg" },
  mercury: { texture: "/planets/threex/mercurymap.jpg" },
  moon: { texture: "/planets/threex/moonmap1k.jpg" },
  neptune: { texture: "/planets/threex/neptunemap.jpg" },
  pluto: { texture: "/planets/threex/plutomap1k.jpg" },
  saturn: {
    ringTexture: "/planets/threex/saturnringcolor.jpg",
    texture: "/planets/threex/saturnmap.jpg",
  },
  saturnring: {
    ringTexture: "/planets/threex/saturnringcolor.jpg",
    texture: "/planets/threex/saturnmap.jpg",
  },
  sun: { emissive: true, texture: "/planets/threex/sunmap.jpg" },
  uranus: { texture: "/planets/threex/uranusmap.jpg" },
  uranusring: {
    ringTexture: "/planets/threex/uranusringcolour.jpg",
    texture: "/planets/threex/uranusmap.jpg",
  },
  venus: { texture: "/planets/threex/venusmap.jpg" },
}

const FALLBACK_PLANET_ASSET = THREEX_PLANET_ASSETS.earth

export function getMinimalColorScheme({
  tone,
  index,
}: MinimalColorSchemeInput): MinimalColorScheme {
  const palette = tonePalettes[tone]
  return palette[index % palette.length]
}

export function buildMinimalThreeScene(
  planets: ReadonlyArray<PlanetUniverseBodyModel>,
  contentNodes: ReadonlyArray<UniverseContentNodeModel> = []
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
    stars: buildMinimalStarField(bodySeed, planets, contentNodes),
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
  const zOffset = orbitRadius <= 0 ? 0 : roundToTwo((normalizedSize - 0.5) * 64 + planet.orbit.delaySeconds * 6)

  const illustration = PLANET_ILLUSTRATIONS[index % PLANET_ILLUSTRATIONS.length]

  return {
    ...planet,
    colorScheme: getMinimalColorScheme({ tone: planet.tone, index }),
    hasRing: normalizedSize >= 0.5 || planet.publicMemoryCount + planet.assistantMemoryCount > 0,
    illustration: illustration.path,
    illustrationAspectRatio: illustration.aspectRatio,
    illustrationScale: illustration.scale,
    planetAsset: THREEX_PLANET_ASSETS[planet.slug.toLowerCase()] ?? FALLBACK_PLANET_ASSET,
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
  planets: ReadonlyArray<PlanetUniverseBodyModel>,
  contentNodes: ReadonlyArray<UniverseContentNodeModel>
): ReadonlyArray<MinimalStarPoint> {
  const backgroundStarCount = Math.max(18, Math.min(44, 18 + Math.round(planets.length * 1.2)))
  const stars: MinimalStarPoint[] = []
  const occupied: Array<{ readonly x: number; readonly y: number; readonly radius: number }> = planets.map((planet) => {
    const angleRadians = degreesToRadians(planet.orbit.startAngle)
    return {
      radius: Math.max(72, planet.size * 0.8),
      x: roundToTwo(Math.cos(angleRadians) * planet.orbit.radius),
      y: roundToTwo(Math.sin(angleRadians) * planet.orbit.radius * 0.72),
    }
  })

  for (const node of contentNodes) {
    const nodeSeed = fnv1a(seed, node.id)
    const position = resolveContentNodePosition(nodeSeed, node.kind, occupied)
    const visualRadius = node.kind === "fragment" ? 30 : 40

    occupied.push({ radius: visualRadius, x: position[0], y: position[1] })
    stars.push({
      contentType: node.contentType,
      href: node.href,
      id: node.id,
      intensity: roundToTwo(0.62 + Math.min(0.32, node.importance / 30)),
      kind: node.kind,
      position,
      size: roundToTwo(node.kind === "fragment" ? 0.92 + node.importance / 90 : 1.05 + node.importance / 70),
      summary: node.summary,
      targetPlanetId: node.targetPlanetId,
      title: node.title,
    })
  }

  for (let index = 0; index < backgroundStarCount; index += 1) {
    const value = mixSeed(seed, index)
    const x = roundToTwo(normalizeSigned((value >>> 0) % 997, 998) * BACKGROUND_FIELD_BOUNDS.x)
    const y = roundToTwo(normalizeSigned((value >>> 10) % 991, 992) * BACKGROUND_FIELD_BOUNDS.y)
    const z = roundToTwo(normalizeSigned((value >>> 20) % 983, 984) * BACKGROUND_FIELD_BOUNDS.z)

    stars.push({
      id: `background-${index + 1}`,
      intensity: roundToTwo(0.32 + ((value >>> 2) % 45) / 100),
      kind: "background",
      position: [x, y, z],
      size: roundToTwo(0.55 + ((value >>> 7) % 32) / 100),
    })
  }

  return stars
}

function resolveContentNodePosition(
  seed: number,
  kind: UniverseContentNodeModel["kind"],
  occupied: ReadonlyArray<{ readonly x: number; readonly y: number; readonly radius: number }>
): readonly [number, number, number] {
  const minDistance = kind === "fragment" ? 38 : 52
  let fallback: readonly [number, number, number] = [0, 0, 0]

  for (let attempt = 0; attempt < 28; attempt += 1) {
    const value = mixSeed(seed, attempt)
    const x = roundToTwo(normalizeSigned((value >>> 0) % 997, 998) * CONTENT_FIELD_BOUNDS.x)
    const y = roundToTwo(normalizeSigned((value >>> 10) % 991, 992) * CONTENT_FIELD_BOUNDS.y)
    const z = roundToTwo(normalizeSigned((value >>> 20) % 983, 984) * CONTENT_FIELD_BOUNDS.z)
    const point: readonly [number, number, number] = [x, y, z]

    fallback = point

    const hasCollision = occupied.some((item) => {
      const dx = item.x - x
      const dy = item.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < item.radius + minDistance
    })

    if (!hasCollision) {
      return point
    }
  }

  return fallback
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
