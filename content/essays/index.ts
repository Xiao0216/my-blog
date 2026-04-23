import type { ComponentType } from "react"

import { essaySummaries } from "@/data/essays"
import type { EssaySummary } from "@/data/essays"

type EssayModule = {
  default: ComponentType
}

type EssayDocumentEntry = {
  meta: EssaySummary
  load: () => Promise<EssayModule>
}

function getEssaySummaryOrThrow(slug: EssaySummary["slug"]): EssaySummary {
  const summary = essaySummaries.find((essay) => essay.slug === slug)

  if (!summary) {
    throw new Error(`Missing essay summary for slug "${slug}" in data/essays.ts`)
  }

  return summary
}

function createEssayDocument(
  slug: EssaySummary["slug"],
  load: () => Promise<EssayModule>
): EssayDocumentEntry {
  return {
    meta: getEssaySummaryOrThrow(slug),
    load,
  }
}

export const essayDocumentSlugs = [
  "making-space-for-thought",
  "quiet-loops-at-night",
] as const satisfies ReadonlyArray<EssaySummary["slug"]>

export type EssayDocumentSlug = (typeof essayDocumentSlugs)[number]

export function isEssayDocumentSlug(slug: string): slug is EssayDocumentSlug {
  return essayDocumentSlugs.some((essaySlug) => essaySlug === slug)
}

export const essayDocuments = {
  "making-space-for-thought": createEssayDocument(
    "making-space-for-thought",
    () => import("./making-space-for-thought.mdx")
  ),
  "quiet-loops-at-night": createEssayDocument(
    "quiet-loops-at-night",
    () => import("./quiet-loops-at-night.mdx")
  ),
} satisfies Record<EssayDocumentSlug, EssayDocumentEntry>
