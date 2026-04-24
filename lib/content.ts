import type { EssaySummary } from "@/data/essays"
import type { NoteEntry } from "@/data/notes"
import type { ProjectEntry } from "@/data/projects"
import type { ProfileData } from "@/data/site"
import {
  getAllEssaySlugs as getDatabaseEssaySlugs,
  getEssayBySlug,
  getPublicEssays,
  getPublicNotes,
  getPublicProfile,
  getPublicProjects,
} from "@/lib/cms/db"

export type { EssaySummary, NoteEntry, ProjectEntry, ProfileData }
export type EssayDocument = {
  readonly meta: EssaySummary
  readonly content: string
}

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
  return cloneProfileData(getPublicProfile())
}

export function getEssaySummaries(): ReadonlyArray<EssaySummary> {
  return getPublicEssays().map(cloneEssaySummary)
}

export function getAllEssaySlugs(): ReadonlyArray<string> {
  return [...getDatabaseEssaySlugs()]
}

export function getEssayDocumentBySlug(slug: string): EssayDocument | null {
  const essay = getEssayBySlug(slug)

  if (!essay) {
    return null
  }

  return {
    meta: cloneEssaySummary({
      slug: essay.slug,
      title: essay.title,
      description: essay.description,
      publishedAt: essay.publishedAt,
      readingTime: essay.readingTime,
      tags: essay.tags,
    }),
    content: essay.content,
  }
}

export function getFeaturedNotes(limit = 3): ReadonlyArray<NoteEntry> {
  return getAllNotes().slice(0, limit)
}

export function getAllNotes(): ReadonlyArray<NoteEntry> {
  return getPublicNotes().map(cloneNoteEntry)
}

export function getProjects(): ReadonlyArray<ProjectEntry> {
  return getPublicProjects().map(cloneProjectEntry)
}
