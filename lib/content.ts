import { essaySummaries } from "@/data/essays"
import type { EssaySummary } from "@/data/essays"
import { notes } from "@/data/notes"
import type { NoteEntry } from "@/data/notes"
import { projects } from "@/data/projects"
import type { ProjectEntry } from "@/data/projects"
import { profile } from "@/data/site"
import type { ProfileData } from "@/data/site"

export type { EssaySummary, NoteEntry, ProjectEntry, ProfileData }

export function getProfile(): ProfileData {
  return profile
}

export function getEssaySummaries(): EssaySummary[] {
  return [...essaySummaries].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt)
  )
}

export function getFeaturedNotes(limit = 3): NoteEntry[] {
  return [...notes]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, limit)
}

export function getAllNotes(): NoteEntry[] {
  return [...notes].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt)
  )
}

export function getProjects(): ProjectEntry[] {
  return [...projects]
}
