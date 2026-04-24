import {
  getAllEssaySlugs,
  getEssayDocumentBySlug,
  getEssaySummaries,
} from "@/lib/content"
import { describe, expect, it } from "vitest"

describe("essay documents", () => {
  it("returns a document for every public essay slug", () => {
    const slugs = getAllEssaySlugs()

    expect(slugs.length).toBeGreaterThan(0)

    for (const slug of slugs) {
      const document = getEssayDocumentBySlug(slug)

      expect(document).not.toBeNull()
      expect(document?.meta.slug).toBe(slug)
      expect(document?.content.length).toBeGreaterThan(0)
    }
  })

  it("keeps essay list slugs aligned with public detail slugs", () => {
    expect(new Set(getEssaySummaries().map((essay) => essay.slug))).toEqual(
      new Set(getAllEssaySlugs())
    )
  })

  it("registers professional technical article slugs", () => {
    expect(getAllEssaySlugs()).toEqual([
      "healthcare-frontend-engineering",
      "large-data-frontend-performance",
    ])
  })

  it("returns null for an unknown essay slug", () => {
    expect(getEssayDocumentBySlug("missing-slug")).toBeNull()
  })
})
