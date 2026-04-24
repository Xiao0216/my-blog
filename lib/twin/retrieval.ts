import type { StoredMemory, StoredPlanet } from "@/lib/cms/schema"
import type {
  RetrievedTwinContext,
  TwinReference,
  TwinRetrievalInput,
} from "@/lib/twin/types"

function tokenize(value: string): ReadonlyArray<string> {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
}

function textScore(text: string, tokens: ReadonlyArray<string>): number {
  const normalized = text.toLowerCase()
  return tokens.reduce(
    (score, token) => score + (normalized.includes(token) ? 3 : 0),
    0
  )
}

function excerpt(value: string): string {
  return value.length > 140 ? `${value.slice(0, 137)}...` : value
}

function scorePlanet(
  planet: StoredPlanet,
  tokens: ReadonlyArray<string>,
  focusedPlanetId?: number
): number {
  const focusBoost = focusedPlanetId === planet.id ? 12 : 0
  return (
    focusBoost +
    planet.weight +
    textScore(`${planet.name} ${planet.summary} ${planet.description}`, tokens)
  )
}

function scoreMemory(
  memory: StoredMemory,
  tokens: ReadonlyArray<string>,
  focusedPlanetId?: number
): number {
  if (memory.visibility === "private") {
    return -1
  }

  const focusBoost = focusedPlanetId === memory.planetId ? 8 : 0
  const recencyBoost = memory.occurredAt >= "2026-01-01" ? 2 : 0
  const memoryBoost = 4
  return (
    focusBoost +
    recencyBoost +
    memoryBoost +
    memory.importance +
    textScore(
      `${memory.title} ${memory.content} ${memory.type} ${memory.tags.join(" ")} ${memory.planetName}`,
      tokens
    )
  )
}

export function retrieveTwinContext(
  input: TwinRetrievalInput
): RetrievedTwinContext {
  const tokens = tokenize(input.message)
  const limit = input.limit ?? 5
  const planetMatches = input.planets
    .map((planet) => ({
      score: scorePlanet(planet, tokens, input.focusedPlanetId),
      reference: {
        kind: "planet" as const,
        id: `planet-${planet.id}`,
        title: planet.name,
        excerpt: excerpt(planet.summary),
      },
      context: `Planet: ${planet.name}\nSummary: ${planet.summary}\nDescription: ${planet.description}`,
    }))
    .filter((item) => item.score > 0)

  const memoryMatches = input.memories
    .map((memory) => ({
      score: scoreMemory(memory, tokens, input.focusedPlanetId),
      reference: {
        kind: "memory" as const,
        id: `memory-${memory.id}`,
        title: memory.title,
        excerpt: excerpt(memory.content),
      },
      context: `Memory: ${memory.title}\nPlanet: ${memory.planetName}\nType: ${memory.type}\nDate: ${memory.occurredAt}\nContent: ${memory.content}`,
    }))
    .filter((item) => item.score > 0)

  const matches = [...memoryMatches, ...planetMatches]
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)

  return {
    contextText: matches.map((match) => match.context).join("\n\n---\n\n"),
    references: matches.map((match): TwinReference => match.reference),
  }
}
