import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { DatabaseSync } from "node:sqlite"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let tempDir = ""

async function loadDb() {
  vi.resetModules()
  return import("@/lib/cms/db")
}

function openRawDatabase() {
  const databasePath = process.env.BLOG_DATABASE_PATH

  if (!databasePath) {
    throw new Error("BLOG_DATABASE_PATH must be set for raw DB access")
  }

  return new DatabaseSync(databasePath)
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

  it("rejects records with inconsistent projection state", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const database = openRawDatabase()

    expect(() =>
      database
        .prepare(
          `INSERT INTO records (
            source_text, target_type, title, body, summary, tags_json,
            galaxy_slug, planet_id, occurred_at, visibility, status, confidence,
            ai_reasoning, projection_status, projection_table, projection_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          "Source text",
          "memory",
          "Invalid projected record",
          "Body",
          "Summary",
          "[]",
          "work",
          null,
          "2026-04-25",
          "assistant",
          null,
          50,
          "Reasoning",
          "projected",
          null,
          null,
          "2026-04-25T00:00:00.000Z",
          "2026-04-25T00:00:00.000Z"
        )
    ).toThrow(/CHECK constraint failed/)

    database.close()
  })

  it("rejects records with target-specific visibility and status mismatches", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const database = openRawDatabase()

    expect(() =>
      database
        .prepare(
          `INSERT INTO records (
            source_text, target_type, title, body, summary, tags_json,
            galaxy_slug, planet_id, occurred_at, visibility, status, confidence,
            ai_reasoning, projection_status, projection_table, projection_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          "Source text",
          "memory",
          "Invalid memory record",
          "Body",
          "Summary",
          "[]",
          "work",
          null,
          "2026-04-25",
          "assistant",
          "draft",
          50,
          "Reasoning",
          "pending_projection",
          null,
          null,
          "2026-04-25T00:00:00.000Z",
          "2026-04-25T00:00:00.000Z"
        )
    ).toThrow(/CHECK constraint failed/)

    expect(() =>
      database
        .prepare(
          `INSERT INTO records (
            source_text, target_type, title, body, summary, tags_json,
            galaxy_slug, planet_id, occurred_at, visibility, status, confidence,
            ai_reasoning, projection_status, projection_table, projection_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          "Source text",
          "essay",
          "Invalid essay record",
          "Body",
          "Summary",
          "[]",
          "writing",
          null,
          "2026-04-25",
          "public",
          "draft",
          50,
          "Reasoning",
          "pending_projection",
          null,
          null,
          "2026-04-25T00:00:00.000Z",
          "2026-04-25T00:00:00.000Z"
        )
    ).toThrow(/CHECK constraint failed/)

    database.close()
  })

  it("seeds a draft stardust capture planet outside public homepage planets", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    expect(db.getPublicPlanets().map((planet) => planet.slug)).not.toContain(
      "stardust"
    )
    expect(db.getAdminPlanets()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stardust",
          name: "星尘",
          status: "draft",
        }),
      ])
    )
  })

  it("allows assistant retrieval from the stardust capture planet", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const stardust = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "stardust")
    const stardustId = stardust?.id

    expect(stardust).toBeDefined()
    expect(stardustId).toBeTypeOf("number")

    db.saveMemory({
      planetId: stardustId ?? 0,
      title: "Unclassified assistant memory",
      content: "A low confidence record can still support the twin.",
      type: "diary",
      occurredAt: "2026-04-25",
      visibility: "assistant",
      importance: 5,
      tags: ["inbox"],
      source: "ai-inbox",
    })

    expect(
      db.getAssistantMemories().map((memory) => memory.title)
    ).toContain("Unclassified assistant memory")
    expect(db.getPublicMemories().map((memory) => memory.title)).not.toContain(
      "Unclassified assistant memory"
    )
  })

  it("saves memory records and projects them atomically", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const stardust = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "stardust")

    expect(stardust).toBeDefined()

    const record = db.saveAiInboxRecord({
      sourceText: "今天记录一个想法。",
      targetType: "memory",
      title: "Inbox memory",
      body: "A projected memory body.",
      summary: "Memory summary",
      tags: ["inbox", "memory"],
      galaxySlug: "diary",
      planetId: stardust?.id ?? null,
      occurredAt: "2026-04-25",
      visibility: "assistant",
      status: null,
      confidence: 82,
      aiReasoning: "Looks like a personal memory.",
      memoryType: "diary",
      importance: 5,
    })

    expect(record).toMatchObject({
      targetType: "memory",
      projectionStatus: "projected",
      projectionTable: "memories",
    })
    expect(db.getAdminMemories()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Inbox memory",
          visibility: "assistant",
          source: "ai-inbox",
        }),
      ])
    )
    expect(db.getRecentRecords(5)[0]).toMatchObject({
      title: "Inbox memory",
      projectionTable: "memories",
    })
  })

  it("normalizes memory records to assistant defaults before projection", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const stardust = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "stardust")

    expect(stardust).toBeDefined()

    const record = db.saveAiInboxRecord({
      sourceText: "A public-looking memory from the inbox",
      targetType: "memory",
      title: "Unsafe memory visibility",
      body: "This should stay assistant-only.",
      summary: "Memory safety summary",
      tags: ["inbox", "memory"],
      galaxySlug: "diary",
      planetId: stardust?.id ?? null,
      occurredAt: "2026-04-25",
      visibility: "public",
      status: null,
      confidence: 75,
      aiReasoning: "Looks like a personal memory.",
    })

    expect(record).toMatchObject({
      visibility: "assistant",
      status: null,
      projectionStatus: "projected",
      projectionTable: "memories",
    })
    expect(db.getAdminMemories()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Unsafe memory visibility",
          type: "diary",
          visibility: "assistant",
          importance: 5,
          source: "ai-inbox",
        }),
      ])
    )
  })

  it("normalizes note essay and project records to drafts", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    const noteRecord = db.saveAiInboxRecord({
      sourceText: "A note from the inbox",
      targetType: "note",
      title: "Inbox note",
      body: "Note body",
      summary: "Note summary",
      tags: ["inbox", "note"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 80,
      aiReasoning: "Looks like a note.",
    })
    const essayRecord = db.saveAiInboxRecord({
      sourceText: "An essay from the inbox",
      targetType: "essay",
      title: "Inbox essay",
      body: "Essay body",
      summary: "Essay summary",
      tags: ["inbox", "essay"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 81,
      aiReasoning: "Looks like an essay.",
      readingTime: "1 min read",
    })
    const projectRecord = db.saveAiInboxRecord({
      sourceText: "A project from the inbox",
      targetType: "project",
      title: "Inbox project",
      body: "Project body",
      summary: "Project summary",
      tags: ["inbox", "project"],
      galaxySlug: "work",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 83,
      aiReasoning: "Looks like a project.",
      stack: ["Next.js"],
      href: "/projects",
    })

    expect(noteRecord.status).toBe("draft")
    expect(essayRecord.status).toBe("draft")
    expect(projectRecord.status).toBe("draft")

    expect(db.getAdminNotes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Inbox note",
          status: "draft",
        }),
      ])
    )
    expect(db.getAdminEssays()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Inbox essay",
          status: "draft",
          readingTime: "1 min read",
        }),
      ])
    )
    expect(db.getAdminProjects()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Inbox project",
          status: "draft",
          stack: ["Next.js"],
          href: "/projects",
        }),
      ])
    )
  })

  it("marks a projected memory record as failed when the memory is deleted", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const stardust = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "stardust")

    expect(stardust).toBeDefined()

    const record = db.saveAiInboxRecord({
      sourceText: "A memory that will be deleted",
      targetType: "memory",
      title: "Deleted memory",
      body: "Projected memory body.",
      summary: "Memory summary",
      tags: ["inbox", "memory"],
      galaxySlug: "diary",
      planetId: stardust?.id ?? null,
      occurredAt: "2026-04-25",
      visibility: "assistant",
      status: null,
      confidence: 82,
      aiReasoning: "Looks like a personal memory.",
      memoryType: "diary",
      importance: 5,
    })
    const projectionId = record.projectionId ?? -1

    db.deleteMemory(projectionId)

    expect(db.getRecentRecords(5)[0]).toMatchObject({
      title: "Deleted memory",
      projectionStatus: "failed",
      projectionTable: null,
      projectionId: null,
    })

    const rawDatabase = openRawDatabase()
    const deletedMemory = rawDatabase
      .prepare("SELECT COUNT(*) AS count FROM memories WHERE id = ?")
      .get(projectionId) as { count: number }
    rawDatabase.close()

    expect(deletedMemory.count).toBe(0)
  })

  it("marks note essay and project records as failed when their projections are deleted by slug", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    const noteRecord = db.saveAiInboxRecord({
      sourceText: "A note that will be deleted",
      targetType: "note",
      title: "Deleted note",
      body: "Note body",
      summary: "Note summary",
      tags: ["inbox", "note"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 80,
      aiReasoning: "Looks like a note.",
    })
    const essayRecord = db.saveAiInboxRecord({
      sourceText: "An essay that will be deleted",
      targetType: "essay",
      title: "Deleted essay",
      body: "Essay body",
      summary: "Essay summary",
      tags: ["inbox", "essay"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 81,
      aiReasoning: "Looks like an essay.",
      readingTime: "1 min read",
    })
    const projectRecord = db.saveAiInboxRecord({
      sourceText: "A project that will be deleted",
      targetType: "project",
      title: "Deleted project",
      body: "Project body",
      summary: "Project summary",
      tags: ["inbox", "project"],
      galaxySlug: "work",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 83,
      aiReasoning: "Looks like a project.",
      stack: ["Next.js"],
      href: "/projects",
    })
    const noteProjectionId = noteRecord.projectionId ?? -1
    const essayProjectionId = essayRecord.projectionId ?? -1
    const projectProjectionId = projectRecord.projectionId ?? -1

    const rawDatabase = openRawDatabase()
    const noteSlug = rawDatabase
      .prepare("SELECT slug FROM notes WHERE id = ?")
      .get(noteProjectionId) as { slug?: string } | undefined
    const essaySlug = rawDatabase
      .prepare("SELECT slug FROM essays WHERE id = ?")
      .get(essayProjectionId) as { slug?: string } | undefined
    const projectSlug = rawDatabase
      .prepare("SELECT slug FROM projects WHERE id = ?")
      .get(projectProjectionId) as { slug?: string } | undefined
    rawDatabase.close()

    expect(noteSlug?.slug).toBeDefined()
    expect(essaySlug?.slug).toBeDefined()
    expect(projectSlug?.slug).toBeDefined()

    db.deleteNote(noteSlug?.slug ?? "")
    db.deleteEssay(essaySlug?.slug ?? "")
    db.deleteProject(projectSlug?.slug ?? "")

    expect(db.getRecentRecords(10)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Deleted note",
          projectionStatus: "failed",
          projectionTable: null,
          projectionId: null,
        }),
        expect.objectContaining({
          title: "Deleted essay",
          projectionStatus: "failed",
          projectionTable: null,
          projectionId: null,
        }),
        expect.objectContaining({
          title: "Deleted project",
          projectionStatus: "failed",
          projectionTable: null,
          projectionId: null,
        }),
      ])
    )

    const afterDeleteDatabase = openRawDatabase()
    const deletedNote = afterDeleteDatabase
      .prepare("SELECT COUNT(*) AS count FROM notes WHERE id = ?")
      .get(noteProjectionId) as { count: number }
    const deletedEssay = afterDeleteDatabase
      .prepare("SELECT COUNT(*) AS count FROM essays WHERE id = ?")
      .get(essayProjectionId) as { count: number }
    const deletedProject = afterDeleteDatabase
      .prepare("SELECT COUNT(*) AS count FROM projects WHERE id = ?")
      .get(projectProjectionId) as { count: number }
    afterDeleteDatabase.close()

    expect(deletedNote.count).toBe(0)
    expect(deletedEssay.count).toBe(0)
    expect(deletedProject.count).toBe(0)
  })

  it("rolls back record cleanup when projected row deletion fails", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    const record = db.saveAiInboxRecord({
      sourceText: "A note whose delete will fail",
      targetType: "note",
      title: "Delete failure note",
      body: "Note body",
      summary: "Note summary",
      tags: ["inbox", "note"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "published",
      confidence: 80,
      aiReasoning: "Looks like a note.",
    })
    const projectionId = record.projectionId ?? -1
    const rawDatabase = openRawDatabase()
    const noteSlug = rawDatabase
      .prepare("SELECT slug FROM notes WHERE id = ?")
      .get(projectionId) as { slug?: string } | undefined

    rawDatabase.exec(`
      CREATE TRIGGER fail_note_delete
      BEFORE DELETE ON notes
      BEGIN
        SELECT RAISE(ABORT, 'forced delete failure');
      END;
    `)
    rawDatabase.close()

    expect(noteSlug?.slug).toBeDefined()
    expect(() => db.deleteNote(noteSlug?.slug ?? "")).toThrow(
      "forced delete failure"
    )

    expect(db.getRecentRecords(5)[0]).toMatchObject({
      title: "Delete failure note",
      projectionStatus: "projected",
      projectionTable: "notes",
      projectionId,
    })
  })

  it("marks projected memory records as failed when their planet is deleted", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "delete-planet",
      name: "Delete Planet",
      summary: "Temporary inbox planet",
      description: "A temporary planet for delete cascade tests.",
      x: 10,
      y: 20,
      size: "small",
      theme: "cyan",
      status: "draft",
      sortOrder: 99,
      weight: 1,
    })
    const planet = db
      .getAdminPlanets()
      .find((candidate) => candidate.slug === "delete-planet")

    expect(planet).toBeDefined()

    db.saveAiInboxRecord({
      sourceText: "A memory whose planet will be deleted",
      targetType: "memory",
      title: "Deleted planet memory",
      body: "Projected memory body.",
      summary: "Memory summary",
      tags: ["inbox", "memory"],
      galaxySlug: "diary",
      planetId: planet?.id ?? null,
      occurredAt: "2026-04-25",
      visibility: "assistant",
      status: null,
      confidence: 82,
      aiReasoning: "Looks like a personal memory.",
      memoryType: "diary",
      importance: 5,
    })

    db.deletePlanet("delete-planet")

    expect(db.getAdminMemories().map((memory) => memory.title)).not.toContain(
      "Deleted planet memory"
    )
    expect(db.getRecentRecords(5)[0]).toMatchObject({
      title: "Deleted planet memory",
      projectionStatus: "failed",
      projectionTable: null,
      projectionId: null,
      planetId: null,
    })
  })

  it("uses AI inbox projection defaults and fallback slugs", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    db.saveAiInboxRecord({
      sourceText: "First non sluggable note",
      targetType: "note",
      title: "星尘",
      body: "First note body",
      summary: "First note summary",
      tags: ["inbox"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 70,
      aiReasoning: "Looks like a note.",
    })
    db.saveAiInboxRecord({
      sourceText: "Second non sluggable note",
      targetType: "note",
      title: "星尘",
      body: "Second note body",
      summary: "Second note summary",
      tags: ["inbox"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 71,
      aiReasoning: "Looks like a note.",
    })
    db.saveAiInboxRecord({
      sourceText: "First non sluggable essay",
      targetType: "essay",
      title: "星尘",
      body: "First essay body",
      summary: "First essay summary",
      tags: ["inbox"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 72,
      aiReasoning: "Looks like an essay.",
    })
    db.saveAiInboxRecord({
      sourceText: "Second non sluggable essay",
      targetType: "essay",
      title: "星尘",
      body: "Second essay body",
      summary: "Second essay summary",
      tags: ["inbox"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 73,
      aiReasoning: "Looks like an essay.",
    })
    db.saveAiInboxRecord({
      sourceText: "First non sluggable project",
      targetType: "project",
      title: "星尘",
      body: "First project body",
      summary: "First project summary",
      tags: ["inbox"],
      galaxySlug: "work",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 74,
      aiReasoning: "Looks like a project.",
    })
    db.saveAiInboxRecord({
      sourceText: "Second non sluggable project",
      targetType: "project",
      title: "星尘",
      body: "Second project body",
      summary: "Second project summary",
      tags: ["inbox"],
      galaxySlug: "work",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 75,
      aiReasoning: "Looks like a project.",
    })

    const inboxNotes = db
      .getAdminNotes()
      .filter((note) => note.title === "星尘")
      .map((note) => note.slug)
    const inboxEssays = db
      .getAdminEssays()
      .filter((essay) => essay.title === "星尘")
      .map((essay) => ({
        slug: essay.slug,
        readingTime: essay.readingTime,
      }))
    const inboxProjects = db
      .getAdminProjects()
      .filter((project) => project.title === "星尘")
      .map((project) => ({
        slug: project.slug,
        href: project.href,
        sortOrder: project.sortOrder,
      }))

    expect(inboxNotes).toEqual(["ai-note-2", "ai-note"])
    expect(inboxEssays).toEqual([
      { slug: "ai-essay-2", readingTime: "1 min read" },
      { slug: "ai-essay", readingTime: "1 min read" },
    ])
    expect(inboxProjects).toEqual([
      { slug: "ai-project", href: "/projects", sortOrder: 0 },
      { slug: "ai-project-2", href: "/projects", sortOrder: 0 },
    ])
  })

  it("keeps photo and list records pending without projection", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    const photoRecord = db.saveAiInboxRecord({
      sourceText: "A photo record",
      targetType: "photo",
      title: "Inbox photo",
      body: "Photo body",
      summary: "Photo summary",
      tags: ["inbox", "photo"],
      galaxySlug: "life",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 65,
      aiReasoning: "Looks like a photo.",
    })
    const listRecord = db.saveAiInboxRecord({
      sourceText: "A list record",
      targetType: "list",
      title: "Inbox list",
      body: "List body",
      summary: "List summary",
      tags: ["inbox", "list"],
      galaxySlug: "life",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 66,
      aiReasoning: "Looks like a list.",
    })

    expect(photoRecord).toMatchObject({
      projectionStatus: "pending_projection",
      projectionTable: null,
      projectionId: null,
    })
    expect(listRecord).toMatchObject({
      projectionStatus: "pending_projection",
      projectionTable: null,
      projectionId: null,
    })
  })

  it("rolls back the record when projection fails", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const before = db.getRecentRecords(20)

    expect(() =>
      db.saveAiInboxRecord({
        sourceText: "Broken source text",
        targetType: "memory",
        title: "Broken memory",
        body: "Broken body",
        summary: "Broken summary",
        tags: ["broken"],
        galaxySlug: "diary",
        planetId: 999_999,
        occurredAt: "2026-04-25",
        visibility: "assistant",
        status: null,
        confidence: 10,
        aiReasoning: "This should fail because the planet does not exist.",
        memoryType: "diary",
        importance: 5,
      })
    ).toThrow()

    expect(db.getRecentRecords(20)).toHaveLength(before.length)
    expect(db.getAdminMemories().map((memory) => memory.title)).not.toContain(
      "Broken memory"
    )
  })
})
