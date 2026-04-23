import {
  getAllEssaySlugs,
  getEssayDocumentBySlug,
  getEssaySummaries,
} from "@/lib/content"
import { describe, expect, it } from "vitest"

describe("essay documents", () => {
  it("exposes the same slugs for list and detail routes", () => {
    expect(getAllEssaySlugs()).toEqual(
      getEssaySummaries().map((essay) => essay.slug)
    )
  })

  it("returns null for an unknown essay slug", () => {
    expect(getEssayDocumentBySlug("missing-slug")).toBeNull()
  })
})
