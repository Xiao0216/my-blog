import type { MemoryType } from "@/lib/cms/schema"

import {
  type AiInboxRawCandidate,
  type NormalizeAiInboxInput,
  type NormalizedAiInboxRecord,
  isRecordTargetType,
} from "@/lib/ai-inbox/types"

const LOW_CONFIDENCE_THRESHOLD = 70

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function stringArray(value: unknown): ReadonlyArray<string> {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function numberValue(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.trim())

    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function clampConfidence(value: unknown): number {
  const normalized = numberValue(value, 0)

  return Math.min(100, Math.max(0, normalized))
}

function clampImportance(value: unknown): number {
  const normalized = numberValue(value, 5)

  return Math.min(10, Math.max(1, normalized))
}

function isMemoryType(value: string): value is MemoryType {
  return (
    value === "diary" ||
    value === "behavior" ||
    value === "opinion" ||
    value === "project" ||
    value === "habit" ||
    value === "preference" ||
    value === "milestone" ||
    value === "bio"
  )
}

function candidateObject(value: unknown): AiInboxRawCandidate {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as AiInboxRawCandidate
  }

  return {}
}

function findPlanetId(
  candidate: AiInboxRawCandidate,
  planets: NormalizeAiInboxInput["planets"],
): number | null {
  const candidatePlanetId = numberValue(candidate.planetId, NaN)

  if (Number.isFinite(candidatePlanetId)) {
    const matchedPlanet = planets.find((planet) => planet.id === candidatePlanetId)

    if (matchedPlanet) {
      return matchedPlanet.id
    }
  }

  const candidatePlanetSlug = stringValue(candidate.planetSlug)

  if (candidatePlanetSlug.length === 0) {
    return null
  }

  return planets.find((planet) => planet.slug === candidatePlanetSlug)?.id ?? null
}

function stardustPlanetId(planets: NormalizeAiInboxInput["planets"]): number {
  const stardustPlanet = planets.find((planet) => planet.slug === "stardust")

  if (!stardustPlanet) {
    throw new Error(
      "A stardust planet is required for fallback AI inbox memory normalization.",
    )
  }

  return stardustPlanet.id
}

function shouldResolvePlanetId(targetType: NormalizedAiInboxRecord["targetType"]): boolean {
  return (
    targetType === "memory" ||
    targetType === "note" ||
    targetType === "essay" ||
    targetType === "project"
  )
}

function fallbackMemory(
  input: NormalizeAiInboxInput,
  candidate: AiInboxRawCandidate,
  reason: string,
): NormalizedAiInboxRecord {
  const title = stringValue(candidate.title) || "未命名记录"
  const body = stringValue(candidate.body) || input.sourceText
  const summary = stringValue(candidate.summary) || input.sourceText.slice(0, 120)
  const reasoning = stringValue(candidate.reasoning) || reason

  return {
    sourceText: input.sourceText,
    targetType: "memory",
    title,
    body,
    summary,
    tags: stringArray(candidate.tags),
    galaxySlug: stringValue(candidate.galaxySlug) || "diary",
    planetId: stardustPlanetId(input.planets),
    occurredAt: isValidDate(stringValue(candidate.occurredAt))
      ? stringValue(candidate.occurredAt)
      : input.today,
    visibility: "assistant",
    status: null,
    confidence: clampConfidence(candidate.confidence),
    aiReasoning: `${reasoning} 降级为星尘记忆。`,
    memoryType: "diary",
    importance: 5,
  }
}

export function normalizeAiInboxCandidate(
  input: NormalizeAiInboxInput,
): NormalizedAiInboxRecord {
  const candidate = candidateObject(input.candidate)
  const candidateTargetType = stringValue(candidate.targetType)
  const hasValidTargetType = isRecordTargetType(candidateTargetType)
  const targetType = hasValidTargetType ? candidateTargetType : "memory"
  const confidence = clampConfidence(candidate.confidence)
  const title = stringValue(candidate.title)
  const body = stringValue(candidate.body)

  if (
    confidence < LOW_CONFIDENCE_THRESHOLD ||
    title.length === 0 ||
    body.length === 0 ||
    !hasValidTargetType
  ) {
    return fallbackMemory(input, candidate, "AI 分类置信度不足或字段不完整")
  }

  const occurredAt = stringValue(candidate.occurredAt)
  const memoryType = stringValue(candidate.memoryType)
  const normalized: NormalizedAiInboxRecord = {
    sourceText: input.sourceText,
    targetType,
    title,
    body,
    summary: stringValue(candidate.summary) || body.slice(0, 160),
    tags: stringArray(candidate.tags),
    galaxySlug: stringValue(candidate.galaxySlug) || "diary",
    planetId: shouldResolvePlanetId(targetType)
      ? findPlanetId(candidate, input.planets)
      : null,
    occurredAt: isValidDate(occurredAt) ? occurredAt : input.today,
    visibility: targetType === "memory" ? "assistant" : null,
    status:
      targetType === "note" || targetType === "essay" || targetType === "project"
        ? "draft"
        : null,
    confidence,
    aiReasoning: stringValue(candidate.reasoning) || "AI 自动分类。",
    memoryType: isMemoryType(memoryType) ? memoryType : "diary",
    importance: clampImportance(candidate.importance),
    readingTime: stringValue(candidate.readingTime) || "1 min read",
    stack: stringArray(candidate.stack),
    href: stringValue(candidate.href) || "/projects",
  }

  if (targetType === "memory" && normalized.planetId === null) {
    return fallbackMemory(input, candidate, "记忆缺少有效星球")
  }

  return normalized
}
