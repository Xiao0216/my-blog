import type { StoredMemory, StoredPlanet } from "@/lib/content"

import type {
  PlanetOrbitModel,
  PlanetPreviewModel,
  PlanetRenderLevel,
  PlanetRotationModel,
  PlanetUniverseBodyModel,
  PlanetUniverseModel,
} from "@/components/site/life-universe/types"

type BuildPlanetUniverseModelInput = {
  readonly memories: ReadonlyArray<StoredMemory>
  readonly planets: ReadonlyArray<StoredPlanet>
}

type PlanetRenderLevelInput = {
  readonly distanceFromFocus: number
  readonly isFocused: boolean
  readonly isHovered: boolean
  readonly totalPlanets: number
}

const toneByTheme: Record<string, PlanetUniverseBodyModel["tone"]> = {
  blue: "blue",
  cyan: "cyan",
  emerald: "emerald",
  teal: "teal",
  violet: "violet",
}

export function buildPlanetUniverseModel({
  memories,
  planets,
}: BuildPlanetUniverseModelInput): PlanetUniverseModel {
  return {
    planets: planets.map((planet) => buildPlanetUniverseBodyModel(planet, memories)),
  }
}

export function buildPlanetPreview(
  planet: PlanetUniverseBodyModel
): PlanetPreviewModel {
  return {
    hint: "双击进入行星",
    meta: formatPlanetMeta(planet.publicMemoryCount, planet.assistantMemoryCount),
    summary: planet.summary,
    title: planet.name,
  }
}

export function getPlanetRenderLevel({
  distanceFromFocus,
  isFocused,
  isHovered,
  totalPlanets,
}: PlanetRenderLevelInput): PlanetRenderLevel {
  if (isFocused || isHovered) {
    return "full"
  }

  const isDistant = distanceFromFocus > 760
  const isCrowded = totalPlanets > 30

  if (isDistant && isCrowded) {
    return "point"
  }

  if (isDistant || isCrowded) {
    return "simple"
  }

  return "full"
}

function buildPlanetUniverseBodyModel(
  planet: StoredPlanet,
  memories: ReadonlyArray<StoredMemory>
): PlanetUniverseBodyModel {
  const publicMemoryCount = countPlanetMemories(planet.id, memories, "public")
  const assistantMemoryCount = countPlanetMemories(planet.id, memories, "assistant")
  const size = resolvePlanetSize(planet.size)

  return {
    assistantMemoryCount,
    description: planet.description,
    id: `planet-${planet.id}`,
    level: 0,
    name: planet.name,
    orbit: buildOrbitModel(planet, publicMemoryCount, assistantMemoryCount),
    planetId: planet.id,
    publicMemoryCount,
    rotation: buildRotationModel(planet, publicMemoryCount, assistantMemoryCount),
    size,
    slug: planet.slug,
    summary: planet.summary,
    tone: toneByTheme[planet.theme] ? toneByTheme[planet.theme] : "violet",
  }
}

function buildOrbitModel(
  planet: StoredPlanet,
  publicMemoryCount: number,
  assistantMemoryCount: number
): PlanetOrbitModel {
  const seed = hashPlanetSeed(planet.slug, planet.id)
  const size = resolvePlanetSize(planet.size)
  const memoryLoad = publicMemoryCount * 7 + assistantMemoryCount * 5

  return {
    delaySeconds: roundToTwo(((seed % 19) - 9) / 10),
    durationSeconds: roundToTwo(
      24 + size / 18 + memoryLoad / 10 + (seed % 11) / 10
    ),
    radius: roundToTwo(
      Math.max(168, 170 + size + memoryLoad * 2 + (seed % 29))
    ),
    startAngle: seed % 360,
  }
}

function buildRotationModel(
  planet: StoredPlanet,
  publicMemoryCount: number,
  assistantMemoryCount: number
): PlanetRotationModel {
  const seed = hashPlanetSeed(planet.slug, planet.id)

  return {
    durationSeconds: roundToTwo(
      12 + resolvePlanetSize(planet.size) / 22 + (publicMemoryCount + assistantMemoryCount) * 0.35 + (seed % 7) / 10
    ),
  }
}

function countPlanetMemories(
  planetId: number,
  memories: ReadonlyArray<StoredMemory>,
  visibility: StoredMemory["visibility"]
) {
  return memories.filter(
    (memory) => memory.planetId === planetId && memory.visibility === visibility
  ).length
}

function formatPlanetMeta(publicCount: number, assistantCount: number) {
  return `${publicCount} 条公开记忆 · ${assistantCount} 条助手记忆`
}

function resolvePlanetSize(size: StoredPlanet["size"]) {
  if (size === "large") {
    return 86
  }

  if (size === "medium") {
    return 68
  }

  return 48
}

function hashPlanetSeed(slug: string, id: number) {
  let hash = id * 31

  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 33 + slug.charCodeAt(index)) % 1000
  }

  return hash
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100
}
