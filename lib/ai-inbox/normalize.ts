import type { MemoryType } from "@/lib/cms/schema"

import {
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
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
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

function findPlanetId(
  candidate: NormalizeAiInboxInput["candidate"],
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
  return planets.find((planet) => planet.slug === "stardust")?.id ?? planets[0]?.id ?? 0
}

function fallbackMemory(
  input: NormalizeAiInboxInput,
  reason: string,
): NormalizedAiInboxRecord {
  const title = stringValue(input.candidate.title) || "未命名记录"
  const body = stringValue(input.candidate.body) || input.sourceText
  const summary = stringValue(input.candidate.summary) || input.sourceText.slice(0, 120)
  const reasoning = stringValue(input.candidate.reasoning) || reason

  return {
    sourceText: input.sourceText,
    targetType: "memory",
    title,
    body,
    summary,
    tags: stringArray(input.candidate.tags),
    galaxySlug: stringValue(input.candidate.galaxySlug) || "diary",
    planetId: stardustPlanetId(input.planets),
    occurredAt: isValidDate(stringValue(input.candidate.occurredAt))
      ? stringValue(input.candidate.occurredAt)
      : input.today,
    visibility: "assistant",
    status: null,
    confidence: clampConfidence(input.candidate.confidence),
    aiReasoning: `${reasoning} 降级为星尘记忆。`,
    memoryType: "diary",
    importance: 5,
  }
}

export function normalizeAiInboxCandidate(
  input: NormalizeAiInboxInput,
): NormalizedAiInboxRecord {
  const candidateTargetType = stringValue(input.candidate.targetType)
  const hasValidTargetType = isRecordTargetType(candidateTargetType)
  const targetType = hasValidTargetType ? candidateTargetType : "memory"
  const confidence = clampConfidence(input.candidate.confidence)
  const title = stringValue(input.candidate.title)
  const body = stringValue(input.candidate.body)

  if (
    confidence < LOW_CONFIDENCE_THRESHOLD ||
    title.length === 0 ||
    body.length === 0 ||
    !hasValidTargetType
  ) {
    return fallbackMemory(input, "AI 分类置信度不足或字段不完整")
  }

  const occurredAt = stringValue(input.candidate.occurredAt)
  const memoryType = stringValue(input.candidate.memoryType)
  const normalized: NormalizedAiInboxRecord = {
    sourceText: input.sourceText,
    targetType,
    title,
    body,
    summary: stringValue(input.candidate.summary) || body.slice(0, 160),
    tags: stringArray(input.candidate.tags),
    galaxySlug: stringValue(input.candidate.galaxySlug) || "diary",
    planetId: findPlanetId(input.candidate, input.planets),
    occurredAt: isValidDate(occurredAt) ? occurredAt : input.today,
    visibility: targetType === "memory" ? "assistant" : null,
    status:
      targetType === "note" || targetType === "essay" || targetType === "project"
        ? "draft"
        : null,
    confidence,
    aiReasoning: stringValue(input.candidate.reasoning) || "AI 自动分类。",
    memoryType: isMemoryType(memoryType) ? memoryType : "diary",
    importance: clampImportance(input.candidate.importance),
    readingTime: stringValue(input.candidate.readingTime) || "1 min read",
    stack: stringArray(input.candidate.stack),
    href: stringValue(input.candidate.href) || "/projects",
  }

  if (targetType === "memory" && normalized.planetId === null) {
    return fallbackMemory(input, "记忆缺少有效星球")
  }

  return normalized
}
