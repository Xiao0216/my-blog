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

  it("seeds public life planets, assistant memories, and twin identity", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    expect(db.getPublicPlanets().map((planet) => planet.slug)).toEqual([
      "work",
      "technology",
      "writing",
      "diary",
      "relationships",
      "life",
      "interests",
    ])
    expect(db.getPublicPlanets().map((planet) => planet.name)).toEqual([
      "工作与职业",
      "技术与学习",
      "写作与表达",
      "日记与自我",
      "关系与情感",
      "生活与体验",
      "兴趣与娱乐",
    ])
    expect(db.getPublicMemories()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Front-end engineer focused on maintainable delivery",
          visibility: "public",
        }),
      ])
    )
    expect(db.getTwinIdentity()).toMatchObject({
      displayName: "縉紳 AI",
      subtitle: "记忆驱动的数字分身",
    })
  })

  it("persists planets, memories, and hides private memories from public readers", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "reading",
      name: "Reading",
      summary: "Books and notes",
      description: "Reading records and long-term ideas",
      x: 300,
      y: -120,
      size: "small",
      theme: "violet",
      status: "published",
      sortOrder: 20,
      weight: 4,
    })
    const readingPlanet = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "reading")

    expect(readingPlanet).toMatchObject({
      name: "Reading",
      x: 300,
      y: -120,
    })

    db.saveMemory({
      planetId: readingPlanet?.id ?? 0,
      title: "Private reading note",
      content: "This should not be visible publicly.",
      type: "diary",
      occurredAt: "2026-04-24",
      visibility: "private",
      importance: 7,
      tags: ["private"],
      source: "manual",
    })

    expect(db.getPublicMemories().map((memory) => memory.title)).not.toContain(
      "Private reading note"
    )
    expect(
      db.getAssistantMemories().map((memory) => memory.title)
    ).not.toContain("Private reading note")
    expect(db.getAdminMemories().map((memory) => memory.title)).toContain(
      "Private reading note"
    )
  })

  it("saves twin identity settings", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.saveTwinIdentity({
      displayName: "Custom Twin",
      subtitle: "Custom subtitle",
      avatarDescription: "Custom avatar",
      firstPersonStyle: "Use first person when supported.",
      thirdPersonStyle: "Use proxy voice when uncertain.",
      values: ["Clarity"],
      communicationRules: ["Be concise"],
      privacyRules: ["Hide private memories"],
      uncertaintyRules: ["State uncertainty"],
    })

    expect(db.getTwinIdentity()).toEqual({
      displayName: "Custom Twin",
      subtitle: "Custom subtitle",
      avatarDescription: "Custom avatar",
      firstPersonStyle: "Use first person when supported.",
      thirdPersonStyle: "Use proxy voice when uncertain.",
      values: ["Clarity"],
      communicationRules: ["Be concise"],
      privacyRules: ["Hide private memories"],
      uncertaintyRules: ["State uncertainty"],
    })
  })

  it("does not duplicate seeded memories across module reloads", async () => {
    let db = await loadDb()

    db.initializeCmsDatabase()
    const firstCount = db.getAdminMemories().length

    db = await loadDb()
    db.initializeCmsDatabase()

    expect(db.getAdminMemories()).toHaveLength(firstCount)
  })

  it("retires the untouched legacy health seed planet during initialization", async () => {
    let db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "health",
      name: "Health",
      summary: "Energy, habits, body signals, and sustainable pace.",
      description:
        "The health planet tracks routines and constraints that affect long-term output.",
      x: -500,
      y: -160,
      size: "medium",
      theme: "emerald",
      status: "published",
      sortOrder: 5,
      weight: 5,
    })

    expect(db.getPublicPlanets().map((planet) => planet.slug)).toContain(
      "health"
    )

    db = await loadDb()
    db.initializeCmsDatabase()

    expect(db.getPublicPlanets().map((planet) => planet.slug)).not.toContain(
      "health"
    )
    expect(
      db.getAdminPlanets().find((planet) => planet.slug === "health")
    ).toMatchObject({
      status: "draft",
    })
  })

  it("preserves partially edited legacy health planets during initialization", async () => {
    let db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "health",
      name: "Health Edited",
      summary: "Energy, habits, body signals, and sustainable pace.",
      description:
        "The health planet tracks routines and constraints that affect long-term output.",
      x: -500,
      y: -160,
      size: "medium",
      theme: "emerald",
      status: "published",
      sortOrder: 5,
      weight: 6,
    })

    db = await loadDb()
    db.initializeCmsDatabase()

    expect(
      db.getAdminPlanets().find((planet) => planet.slug === "health")
    ).toMatchObject({
      name: "Health Edited",
      status: "published",
      weight: 6,
    })
  })

  it("keeps data-bearing legacy health planets published during initialization", async () => {
    let db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "health",
      name: "Health",
      summary: "Energy, habits, body signals, and sustainable pace.",
      description:
        "The health planet tracks routines and constraints that affect long-term output.",
      x: -500,
      y: -160,
      size: "medium",
      theme: "emerald",
      status: "published",
      sortOrder: 5,
      weight: 5,
    })
    const healthPlanet = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "health")

    db.saveMemory({
      planetId: healthPlanet?.id ?? 0,
      title: "Public health memory",
      content: "This health memory should remain public.",
      type: "diary",
      occurredAt: "2026-04-24",
      visibility: "public",
      importance: 6,
      tags: ["health"],
      source: "manual",
    })

    db = await loadDb()
    db.initializeCmsDatabase()

    expect(
      db.getAdminPlanets().find((planet) => planet.slug === "health")
    ).toMatchObject({
      status: "published",
    })
    expect(db.getPublicMemories().map((memory) => memory.title)).toContain(
      "Public health memory"
    )
  })
})
