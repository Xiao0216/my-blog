import {
  essayDocumentSlugs,
  essayDocuments,
  isEssayDocumentSlug,
} from "@/content/essays"
import { essaySummaries } from "@/data/essays"
import type { EssaySummary } from "@/data/essays"
import { notes } from "@/data/notes"
import type { NoteEntry } from "@/data/notes"
import { projects } from "@/data/projects"
import type { ProjectEntry } from "@/data/projects"
import { profile } from "@/data/site"
import type { ProfileData } from "@/data/site"

export type { EssaySummary, NoteEntry, ProjectEntry, ProfileData }
export type EssayDocument = NonNullable<
  ReturnType<typeof getEssayDocumentBySlug>
>

function cloneProfileData(data: ProfileData): ProfileData {
  return {
    ...data,
    longBio: [...data.longBio],
  }
}

function cloneEssaySummary(essay: EssaySummary): EssaySummary {
  return {
    ...essay,
    tags: [...essay.tags],
  }
}

function cloneNoteEntry(note: NoteEntry): NoteEntry {
  return {
    ...note,
  }
}

function cloneProjectEntry(project: ProjectEntry): ProjectEntry {
  return {
    ...project,
    stack: [...project.stack],
  }
}

export function getProfile(): ProfileData {
  return cloneProfileData(profile)
}

export function getEssaySummaries(): ReadonlyArray<EssaySummary> {
  return [...essaySummaries].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt)
  ).map(cloneEssaySummary)
}

export function getAllEssaySlugs(): ReadonlyArray<string> {
  return [...essayDocumentSlugs]
}

export function getEssayDocumentBySlug(slug: string) {
  if (!isEssayDocumentSlug(slug)) {
    return null
  }

  const essay = essayDocuments[slug]

  return {
    meta: cloneEssaySummary(essay.meta),
    load: essay.load,
  }
}

export function getFeaturedNotes(limit = 3): ReadonlyArray<NoteEntry> {
  return getAllNotes().slice(0, limit)
}

export function getAllNotes(): ReadonlyArray<NoteEntry> {
  return [...notes].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt)
  ).map(cloneNoteEntry)
}

export function getProjects(): ReadonlyArray<ProjectEntry> {
  return projects.map(cloneProjectEntry)
}
