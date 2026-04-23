import * as essayContent from "@/content/essays"
import {
  getAllEssaySlugs,
  getEssayDocumentBySlug,
  getEssaySummaries,
} from "@/lib/content"
import { describe, expect, it } from "vitest"

describe("essay documents", () => {
  it("uses the essay registry as the source of truth for detail slugs", () => {
    expect(essayContent.essayDocumentSlugs).toEqual(getAllEssaySlugs())
  })

  it("returns a document for every registered essay slug", () => {
    expect(essayContent.essayDocumentSlugs.length).toBeGreaterThan(0)

    for (const slug of essayContent.essayDocumentSlugs) {
      const document = getEssayDocumentBySlug(slug)

      expect(document).not.toBeNull()
      expect(document?.meta.slug).toBe(slug)
    }
  })

  it("keeps essay list slugs aligned with the document registry", () => {
    expect(new Set(getEssaySummaries().map((essay) => essay.slug))).toEqual(
      new Set(essayContent.essayDocumentSlugs)
    )
  })

  it("returns null for an unknown essay slug", () => {
    expect(getEssayDocumentBySlug("missing-slug")).toBeNull()
  })
})
