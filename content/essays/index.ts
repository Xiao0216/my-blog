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
  "healthcare-frontend-engineering",
  "large-data-frontend-performance",
] as const satisfies ReadonlyArray<EssaySummary["slug"]>

export type EssayDocumentSlug = (typeof essayDocumentSlugs)[number]

export function isEssayDocumentSlug(slug: string): slug is EssayDocumentSlug {
  return essayDocumentSlugs.some((essaySlug) => essaySlug === slug)
}

export const essayDocuments = {
  "healthcare-frontend-engineering": createEssayDocument(
    "healthcare-frontend-engineering",
    () => import("./healthcare-frontend-engineering.mdx")
  ),
  "large-data-frontend-performance": createEssayDocument(
    "large-data-frontend-performance",
    () => import("./large-data-frontend-performance.mdx")
  ),
} satisfies Record<EssayDocumentSlug, EssayDocumentEntry>
