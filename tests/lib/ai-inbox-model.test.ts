import { afterEach, describe, expect, it, vi } from "vitest"

import { buildAiInboxPrompt } from "@/lib/ai-inbox/prompt"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe("AI inbox model", () => {
  it("builds a classifier prompt with safety defaults", () => {
    const prompt = buildAiInboxPrompt({
      sourceText: "今天想记录一个项目复盘。",
      planets: [{ id: 1, slug: "work", name: "工作与职业" }],
      taxonomy: {
        galaxies: [],
        contentTypes: [],
        specialAreas: [],
      },
    })

    expect(prompt).toContain("Return JSON only")
    expect(prompt).toContain("memory, note, essay, project, photo, list")
    expect(prompt).toContain("Do not choose public or published")
    expect(prompt).toContain("今天想记录一个项目复盘。")
  })

  it("calls the Responses API and parses output_text JSON", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    vi.stubEnv("OPENAI_MODEL", "gpt-test")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          output_text: JSON.stringify({
            targetType: "note",
            title: "Parsed note",
            body: "Body",
            summary: "Summary",
            tags: ["parsed"],
            confidence: 88,
          }),
        }),
      })) as unknown as typeof fetch
    )
    const { classifyAiInboxText } = await import("@/lib/ai-inbox/model")

    const result = await classifyAiInboxText("prompt")

    expect(result).toMatchObject({
      targetType: "note",
      title: "Parsed note",
      confidence: 88,
    })
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      })
    )
  })

  it("fails when model credentials are missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "")
    vi.stubEnv("OPENAI_MODEL", "")
    const { classifyAiInboxText } = await import("@/lib/ai-inbox/model")

    await expect(classifyAiInboxText("prompt")).rejects.toThrow(
      "AI inbox model is not configured"
    )
  })
})
