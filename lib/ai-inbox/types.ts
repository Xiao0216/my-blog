import type { AiInboxRecordInput, RecordTargetType } from "@/lib/cms/schema"

export type AiInboxRawCandidate = {
  readonly targetType?: unknown
  readonly title?: unknown
  readonly body?: unknown
  readonly summary?: unknown
  readonly tags?: unknown
  readonly galaxySlug?: unknown
  readonly planetSlug?: unknown
  readonly planetId?: unknown
  readonly occurredAt?: unknown
  readonly confidence?: unknown
  readonly reasoning?: unknown
  readonly memoryType?: unknown
  readonly importance?: unknown
  readonly readingTime?: unknown
  readonly stack?: unknown
  readonly href?: unknown
}

export type NormalizeAiInboxInput = {
  readonly candidate: unknown
  readonly planets: ReadonlyArray<{
    readonly id: number
    readonly slug: string
  }>
  readonly sourceText: string
  readonly today: string
}

export type NormalizedAiInboxRecord = AiInboxRecordInput

export function isRecordTargetType(value: string): value is RecordTargetType {
  return (
    value === "memory" ||
    value === "note" ||
    value === "essay" ||
    value === "project" ||
    value === "photo" ||
    value === "list"
  )
}
