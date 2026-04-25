import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let tempDir = ""

async function loadCapture() {
  vi.resetModules()
  return import("@/lib/ai-inbox/capture")
}

async function loadDb() {
  return import("@/lib/cms/db")
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-ai-inbox-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  rmSync(tempDir, { recursive: true, force: true })
  vi.doUnmock("@/lib/ai-inbox/model")
  vi.resetModules()
  vi.restoreAllMocks()
})

describe("AI inbox capture", () => {
  it("classifies normalizes and saves projected records", async () => {
    const classifyAiInboxText = vi.fn(async () => ({
      targetType: "note",
      title: "Captured note",
      body: "Captured body",
      summary: "Captured summary",
      tags: ["capture"],
      galaxySlug: "writing",
      occurredAt: "2026-04-25",
      confidence: 90,
      reasoning: "Short note.",
    }))
    vi.doMock("@/lib/ai-inbox/model", () => ({
      classifyAiInboxText,
    }))
    const { captureAiInboxText } = await loadCapture()
    const db = await loadDb()

    const result = await captureAiInboxText("raw text")

    expect(result).toMatchObject({
      targetType: "note",
      title: "Captured note",
      projectionStatus: "projected",
    })
    expect(db.getAdminNotes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Captured note", status: "draft" }),
      ])
    )
    expect(classifyAiInboxText).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceText: "raw text",
        instructions: expect.stringContaining("Return JSON only"),
      })
    )
  })

  it("does not write records when classification fails", async () => {
    vi.doMock("@/lib/ai-inbox/model", () => ({
      classifyAiInboxText: vi.fn(async () => {
        throw new Error("model down")
      }),
    }))
    const { captureAiInboxText } = await loadCapture()
    const db = await loadDb()

    await expect(captureAiInboxText("raw text")).rejects.toThrow("model down")
    expect(db.getRecentRecords(10)).toHaveLength(0)
  })

  it("rejects blank input without classifying or writing records", async () => {
    const classifyAiInboxText = vi.fn()

    vi.doMock("@/lib/ai-inbox/model", () => ({
      classifyAiInboxText,
    }))
    const { captureAiInboxText } = await loadCapture()
    const db = await loadDb()

    await expect(captureAiInboxText(" \n\t ")).rejects.toThrow(
      "请输入要保存的文本"
    )
    expect(classifyAiInboxText).not.toHaveBeenCalled()
    expect(db.getRecentRecords(10)).toHaveLength(0)
  })
})
