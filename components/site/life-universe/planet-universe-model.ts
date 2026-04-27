import type { StoredMemory, StoredPlanet } from "@/lib/content"

import type {
  AmbientPreviewKind,
  AmbientPreviewModel,
  HomePageViewProps,
  PlanetOrbitModel,
  PlanetPreviewModel,
  PlanetRenderLevel,
  PlanetRotationModel,
  PlanetUniverseBodyModel,
  PlanetUniverseModel,
  UniverseContentNodeModel,
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

export function buildAmbientPreview({
  node,
  targetPlanet,
}: {
  readonly node: UniverseContentNodeModel
  readonly targetPlanet: PlanetUniverseBodyModel
}): AmbientPreviewModel {
  const isFragment = node.kind === "fragment"
  const contentLabel = formatContentType(node.contentType)

  return {
    hint: node.href ? "点击查看内容" : "点击进入关联行星",
    kind: node.kind,
    meta: isFragment ? `${contentLabel}碎片 · 所属 ${targetPlanet.name}` : `${contentLabel}星星 · 所属 ${targetPlanet.name}`,
    summary: node.summary,
    targetPlanetId: targetPlanet.id,
    targetTitle: targetPlanet.name,
    title: node.title,
  }
}

export function buildUniverseContentNodes({
  essays,
  memories,
  notes,
  planets,
  projects,
}: HomePageViewProps): ReadonlyArray<UniverseContentNodeModel> {
  const publishedPlanets = planets.filter((planet) => planet.status === "published")
  const fallbackPlanet = publishedPlanets[0]

  if (!fallbackPlanet) {
    return []
  }

  return [
    ...essays.map((essay, index) => {
      const planet = pickPlanetForContent({ fallbackPlanet, index, planets: publishedPlanets, text: `${essay.title} ${essay.description}` })
      return {
        contentType: "essay" as const,
        href: `/essays/${essay.slug}`,
        id: `essay-${essay.slug}`,
        importance: 8,
        kind: "star" as const,
        summary: essay.description,
        targetPlanetId: `planet-${planet.id}`,
        title: essay.title,
      }
    }),
    ...projects.map((project, index) => {
      const planet = pickPlanetForContent({ fallbackPlanet, index: index + essays.length, planets: publishedPlanets, text: `${project.title} ${project.description} ${project.note}` })
      return {
        contentType: "project" as const,
        href: "/projects",
        id: `project-${project.slug}`,
        importance: 9,
        kind: "star" as const,
        summary: project.description,
        targetPlanetId: `planet-${planet.id}`,
        title: project.title,
      }
    }),
    ...notes.map((note, index) => {
      const planet = pickPlanetForContent({ fallbackPlanet, index: index + essays.length + projects.length, planets: publishedPlanets, text: `${note.title} ${note.body}` })
      return {
        contentType: "note" as const,
        href: "/notes",
        id: `note-${note.slug}`,
        importance: 6,
        kind: "star" as const,
        summary: note.body,
        targetPlanetId: `planet-${planet.id}`,
        title: note.title,
      }
    }),
    ...memories
      .filter((memory) => memory.visibility !== "private")
      .map((memory) => ({
        contentType: "memory" as const,
        id: `memory-${memory.id}`,
        importance: memory.importance,
        kind: memory.visibility === "public" && memory.importance >= 7 ? "star" as const : "fragment" as const,
        summary: memory.content,
        targetPlanetId: `planet-${memory.planetId}`,
        title: memory.title,
      })),
  ]
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

function pickPlanetForContent({
  fallbackPlanet,
  index,
  planets,
  text,
}: {
  readonly fallbackPlanet: StoredPlanet
  readonly index: number
  readonly planets: ReadonlyArray<StoredPlanet>
  readonly text: string
}) {
  const textLower = text.toLowerCase()
  const matchedPlanet = planets.find((planet) => {
    const haystack = `${planet.name} ${planet.slug} ${planet.summary} ${planet.description}`.toLowerCase()
    return haystack.split(/\s+|，|、|。|与|和/).some((token) => token.length > 1 && textLower.includes(token))
  })

  return matchedPlanet ?? planets[index % planets.length] ?? fallbackPlanet
}

function formatContentType(contentType: UniverseContentNodeModel["contentType"]) {
  if (contentType === "essay") return "文章"
  if (contentType === "project") return "项目"
  if (contentType === "note") return "笔记"
  return "记忆"
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
