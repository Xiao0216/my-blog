import type { EssaySummary } from "@/data/essays"
import type { NoteEntry } from "@/data/notes"
import type { ProjectEntry } from "@/data/projects"
import type { ProfileData } from "@/data/site"

export type ContentStatus = "published" | "draft"

export type StoredProfile = ProfileData & {
  readonly email: string
  readonly skills: ReadonlyArray<string>
  readonly certifications: ReadonlyArray<string>
}

export type StoredEssay = EssaySummary & {
  readonly content: string
  readonly status: ContentStatus
}

export type StoredProject = ProjectEntry & {
  readonly sortOrder: number
  readonly status: ContentStatus
}

export type StoredNote = NoteEntry & {
  readonly status: ContentStatus
}

export type EssayInput = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly content: string
  readonly publishedAt: string
  readonly readingTime: string
  readonly tags: ReadonlyArray<string>
  readonly status: ContentStatus
}

export type ProjectInput = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly note: string
  readonly stack: ReadonlyArray<string>
  readonly href: string
  readonly sortOrder: number
  readonly status: ContentStatus
}

export type NoteInput = {
  readonly slug: string
  readonly title: string
  readonly body: string
  readonly publishedAt: string
  readonly status: ContentStatus
}

export type ProfileInput = {
  readonly name: string
  readonly roleLine: string
  readonly email: string
  readonly heroTitle: string
  readonly heroIntro: string
  readonly aboutSummary: string
  readonly longBio: ReadonlyArray<string>
  readonly skills: ReadonlyArray<string>
  readonly certifications: ReadonlyArray<string>
}

export function stringifyArray(values: ReadonlyArray<string>): string {
  return JSON.stringify([...values])
}

export function parseStringArray(value: unknown): ReadonlyArray<string> {
  if (typeof value !== "string") {
    return []
  }

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export function parseStatus(value: unknown): ContentStatus {
  return value === "draft" ? "draft" : "published"
}
