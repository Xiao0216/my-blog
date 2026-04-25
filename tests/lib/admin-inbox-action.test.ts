import { beforeEach, describe, expect, it, vi } from "vitest"

import type { StoredRecord } from "@/lib/cms/schema"

const {
  captureAiInboxTextMock,
  requireAdminSessionMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  captureAiInboxTextMock: vi.fn(),
  requireAdminSessionMock: vi.fn(async () => undefined),
  revalidatePathMock: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock("@/lib/admin-guard", () => ({
  requireAdminSession: requireAdminSessionMock,
}))

vi.mock("@/lib/ai-inbox/capture", () => ({
  captureAiInboxText: captureAiInboxTextMock,
}))

import { submitAiInboxAction } from "@/app/admin/(protected)/inbox/actions"

function createRecord(overrides: Partial<StoredRecord> = {}): StoredRecord {
  return {
    id: 1,
    sourceText: "raw note",
    targetType: "note",
    title: "Captured note",
    body: "Captured body",
    summary: "Captured summary",
    tags: ["inbox"],
    galaxySlug: "writing",
    planetId: null,
    planetName: null,
    occurredAt: "2026-04-25",
    visibility: null,
    status: "draft",
    confidence: 90,
    aiReasoning: "Short note.",
    projectionStatus: "projected",
    projectionTable: "notes",
    projectionId: 1,
    createdAt: "2026-04-25T00:00:00.000Z",
    updatedAt: "2026-04-25T00:00:00.000Z",
    ...overrides,
  }
}

function createFormData(sourceText: string): FormData {
  const formData = new FormData()
  formData.set("sourceText", sourceText)

  return formData
}

beforeEach(() => {
  captureAiInboxTextMock.mockReset()
  requireAdminSessionMock.mockClear()
  revalidatePathMock.mockClear()
})

describe("submitAiInboxAction", () => {
  it("saves inbox text and revalidates the projected admin path", async () => {
    const record = createRecord()
    captureAiInboxTextMock.mockResolvedValue(record)

    const result = await submitAiInboxAction(
      { sourceText: "" },
      createFormData("raw note")
    )

    expect(requireAdminSessionMock).toHaveBeenCalledTimes(1)
    expect(requireAdminSessionMock).toHaveBeenCalledWith("/admin/inbox")
    expect(captureAiInboxTextMock).toHaveBeenCalledTimes(1)
    expect(captureAiInboxTextMock).toHaveBeenCalledWith("raw note")
    expect(result).toEqual({ sourceText: "", record })
    expect(revalidatePathMock).toHaveBeenCalledWith("/")
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin")
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/inbox")
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/notes")
  })

  it("returns capture errors without revalidating paths", async () => {
    captureAiInboxTextMock.mockRejectedValue(new Error("model down"))

    const result = await submitAiInboxAction(
      { sourceText: "" },
      createFormData("raw failed text")
    )

    expect(requireAdminSessionMock).toHaveBeenCalledTimes(1)
    expect(requireAdminSessionMock).toHaveBeenCalledWith("/admin/inbox")
    expect(captureAiInboxTextMock).toHaveBeenCalledTimes(1)
    expect(captureAiInboxTextMock).toHaveBeenCalledWith("raw failed text")
    expect(result).toEqual({
      sourceText: "raw failed text",
      error: "model down",
    })
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })
})
