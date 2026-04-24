import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let tempDir = ""

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/twin/chat/route")
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-twin-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_MODEL
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_MODEL
  rmSync(tempDir, { recursive: true, force: true })
  vi.resetModules()
})

describe("POST /api/twin/chat", () => {
  it("returns fallback answer and references without model credentials", async () => {
    const { POST } = await loadRoute()
    const response = await POST(
      new Request("https://example.test/api/twin/chat", {
        method: "POST",
        body: JSON.stringify({ message: "你怎么看前端工程化?" }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mode).toBe("fallback")
    expect(data.answer).toContain("离线模式")
    expect(data.references.length).toBeGreaterThan(0)
  })

  it("rejects empty messages", async () => {
    const { POST } = await loadRoute()
    const response = await POST(
      new Request("https://example.test/api/twin/chat", {
        method: "POST",
        body: JSON.stringify({ message: " " }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Message is required")
  })
})
