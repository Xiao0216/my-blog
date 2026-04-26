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

export function buildPlanetUniverseModel({
  memories,
  planets,
}: BuildPlanetUniverseModelInput): PlanetUniverseModel {
  return {
    planets: planets.map((planet, index) =>
      buildPlanetUniverseBodyModel(planet, memories, index)
    ),
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

  if (distanceFromFocus >= 720 || totalPlanets >= 36) {
    return "point"
  }

  if (distanceFromFocus >= 320 || totalPlanets >= 16) {
    return "simple"
  }

  return "full"
}

function buildPlanetUniverseBodyModel(
  planet: StoredPlanet,
  memories: ReadonlyArray<StoredMemory>,
  level: number
): PlanetUniverseBodyModel {
  const publicMemoryCount = countPlanetMemories(planet.id, memories, "public")
  const assistantMemoryCount = countPlanetMemories(planet.id, memories, "assistant")
  const size = resolvePlanetSize(planet.size)

  return {
    assistantMemoryCount,
    description: planet.description,
    id: `planet-${planet.id}`,
    level,
    name: planet.name,
    orbit: buildOrbitModel(planet, level, publicMemoryCount, assistantMemoryCount),
    planetId: planet.id,
    publicMemoryCount,
    rotation: buildRotationModel(planet, publicMemoryCount, assistantMemoryCount),
    size,
    slug: planet.slug,
    summary: planet.summary,
    tone: planet.theme,
  }
}

function buildOrbitModel(
  planet: StoredPlanet,
  level: number,
  publicMemoryCount: number,
  assistantMemoryCount: number
): PlanetOrbitModel {
  const seed = hashPlanetSeed(planet.slug, planet.id)
  const size = resolvePlanetSize(planet.size)
  const memoryLoad = publicMemoryCount * 7 + assistantMemoryCount * 5

  return {
    delaySeconds: roundToTwo((level * 0.65 + (seed % 17) / 20) % 6),
    durationSeconds: roundToTwo(
      24 + level * 1.5 + size / 18 + memoryLoad / 10 + (seed % 11) / 10
    ),
    radius: roundToTwo(
      Math.max(168, 170 + level * 42 + size + memoryLoad * 2 + (seed % 29))
    ),
    startAngle: roundToTwo(((seed % 360) * Math.PI) / 180),
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
  const segments: string[] = [`${publicCount} 条公开记忆`]

  if (assistantCount > 0) {
    segments.push(`${assistantCount} 条助手记忆`)
  }

  return segments.join(" · ")
}

function resolvePlanetSize(size: StoredPlanet["size"]) {
  if (size === "large") {
    return 168
  }

  if (size === "medium") {
    return 132
  }

  return 104
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
