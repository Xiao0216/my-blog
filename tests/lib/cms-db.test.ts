import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let tempDir = ""

async function loadDb() {
  vi.resetModules()
  return import("@/lib/cms/db")
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-cms-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  rmSync(tempDir, { recursive: true, force: true })
  vi.resetModules()
})

describe("cms database", () => {
  it("initializes tables and seeds current public content once", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.initializeCmsDatabase()

    expect(db.getPublicProfile().name).toBe("縉紳")
    expect(db.getPublicEssays().map((essay) => essay.slug)).toEqual([
      "healthcare-frontend-engineering",
      "large-data-frontend-performance",
    ])
    expect(db.getPublicProjects()).toHaveLength(5)
    expect(db.getPublicNotes()).toHaveLength(3)
  })

  it("excludes draft content from public reads", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.saveEssay({
      slug: "draft-essay",
      title: "Draft essay",
      description: "Hidden draft",
      content: "# Draft",
      publishedAt: "2026-04-24",
      readingTime: "1 min read",
      tags: ["Draft"],
      status: "draft",
    })

    expect(db.getPublicEssays().map((essay) => essay.slug)).not.toContain(
      "draft-essay"
    )
    expect(db.getAllEssaySlugs()).not.toContain("draft-essay")
  })

  it("persists edited content immediately", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.saveNote({
      slug: "fresh-note",
      title: "Fresh note",
      body: "Saved from admin",
      publishedAt: "2026-04-24",
      status: "published",
    })

    expect(db.getPublicNotes()[0]).toMatchObject({
      slug: "fresh-note",
      title: "Fresh note",
    })
  })
})
