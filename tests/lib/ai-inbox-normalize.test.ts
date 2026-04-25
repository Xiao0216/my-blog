import { describe, expect, it } from "vitest"

import { normalizeAiInboxCandidate } from "@/lib/ai-inbox/normalize"
import type { StoredPlanet } from "@/lib/cms/schema"

const planets: StoredPlanet[] = [
  {
    id: 1,
    slug: "stardust",
    name: "星尘",
    summary: "Inbox fragments",
    description: "Inbox fragments",
    x: 0,
    y: 0,
    size: "small",
    theme: "teal",
    status: "draft",
    sortOrder: 99,
    weight: 1,
  },
  {
    id: 2,
    slug: "work",
    name: "工作与职业",
    summary: "Work",
    description: "Work",
    x: 0,
    y: 0,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 1,
    weight: 10,
  },
]

describe("AI inbox normalization", () => {
  it("normalizes a confident project candidate as a draft project", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "project",
        title: "Delivery Platform",
        body: "Built a platform with Next.js.",
        summary: "Platform project",
        tags: ["Next.js", "delivery"],
        galaxySlug: "work",
        planetSlug: "work",
        occurredAt: "2026-04-25",
        confidence: 91,
        reasoning: "This describes a project.",
        stack: ["Next.js"],
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "project",
      title: "Delivery Platform",
      status: "draft",
      visibility: null,
      planetId: 2,
      confidence: 91,
      stack: ["Next.js"],
    })
  })

  it("downgrades low confidence output to assistant stardust memory", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "essay",
        title: "",
        body: "",
        summary: "",
        tags: ["unclear"],
        galaxySlug: "writing",
        occurredAt: "not-a-date",
        confidence: 40,
        reasoning: "Unclear.",
      },
      planets,
      sourceText: "今天脑子很乱，先记一下。",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "memory",
      title: "未命名记录",
      body: "今天脑子很乱，先记一下。",
      visibility: "assistant",
      status: null,
      planetId: 1,
      occurredAt: "2026-04-25",
      confidence: 40,
      memoryType: "diary",
    })
    expect(normalized.aiReasoning).toContain("降级为星尘记忆")
  })

  it("keeps photo and list candidates pending without visibility or status", () => {
    const photo = normalizeAiInboxCandidate({
      candidate: {
        targetType: "photo",
        title: "杭州照片",
        body: "之后补图。",
        summary: "照片占位",
        tags: ["杭州"],
        galaxySlug: "life",
        planetSlug: "work",
        occurredAt: "2026-04-25",
        confidence: 80,
        reasoning: "Mentions a photo.",
      },
      planets,
      sourceText: "杭州照片之后补图",
      today: "2026-04-25",
    })

    const list = normalizeAiInboxCandidate({
      candidate: {
        targetType: "list",
        title: "Packing list",
        body: "Passport, charger",
        summary: "Travel checklist",
        tags: ["travel"],
        planetId: 2,
        confidence: 88,
        reasoning: "Structured list content.",
      },
      planets,
      sourceText: "Passport, charger",
      today: "2026-04-25",
    })

    expect(photo).toMatchObject({
      targetType: "photo",
      visibility: null,
      status: null,
      planetId: null,
    })
    expect(list).toMatchObject({
      targetType: "list",
      visibility: null,
      status: null,
      planetId: null,
    })
  })

  it("throws a clear error when fallback memory has no stardust planet", () => {
    expect(() =>
      normalizeAiInboxCandidate({
        candidate: {
          targetType: "essay",
          title: "",
          body: "",
          confidence: 30,
        },
        planets: [],
        sourceText: "needs fallback",
        today: "2026-04-25",
      }),
    ).toThrow("stardust planet is required")

    expect(() =>
      normalizeAiInboxCandidate({
        candidate: {
          targetType: "essay",
          title: "",
          body: "",
          confidence: 30,
        },
        planets: [planets[1]],
        sourceText: "needs fallback",
        today: "2026-04-25",
      }),
    ).toThrow("stardust planet is required")
  })

  it("downgrades a non-object candidate to stardust memory", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: null,
      planets,
      sourceText: "raw scalar output",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "memory",
      title: "未命名记录",
      body: "raw scalar output",
      summary: "raw scalar output",
      visibility: "assistant",
      status: null,
      planetId: 1,
      occurredAt: "2026-04-25",
      confidence: 0,
      memoryType: "diary",
      importance: 5,
    })
  })

  it("downgrades an array candidate to stardust memory", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: [],
      planets,
      sourceText: "array model output",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "memory",
      body: "array model output",
      visibility: "assistant",
      planetId: 1,
    })
    expect(normalized.aiReasoning).toContain("降级为星尘记忆")
  })

  it("downgrades a scalar candidate to stardust memory", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: "bad output",
      planets,
      sourceText: "scalar model output",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "memory",
      body: "scalar model output",
      visibility: "assistant",
      planetId: 1,
    })
    expect(normalized.aiReasoning).toContain("降级为星尘记忆")
  })

  it("falls back from invalid planetId to a valid planetSlug", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "project",
        title: "Delivery Platform",
        body: "Built a platform with Next.js.",
        planetId: 999,
        planetSlug: "work",
        occurredAt: "2026-04-25",
        confidence: 91,
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })

    expect(normalized.planetId).toBe(2)
  })

  it("uses today for invalid calendar dates", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "project",
        title: "Delivery Platform",
        body: "Built a platform with Next.js.",
        planetSlug: "work",
        occurredAt: "2026-02-30",
        confidence: 91,
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })

    expect(normalized.occurredAt).toBe("2026-04-25")
  })

  it("accepts numeric-string confidence values", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "project",
        title: "Delivery Platform",
        body: "Built a platform with Next.js.",
        planetSlug: "work",
        confidence: "91",
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "project",
      confidence: 91,
      status: "draft",
      planetId: 2,
    })
  })

  it("clamps confidence and importance into storage ranges", () => {
    const high = normalizeAiInboxCandidate({
      candidate: {
        targetType: "memory",
        title: "Strong signal",
        body: "Remember this",
        planetSlug: "stardust",
        confidence: 200,
        importance: 20,
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })
    const low = normalizeAiInboxCandidate({
      candidate: {
        targetType: "memory",
        title: "Low signal",
        body: "Remember this too",
        planetSlug: "stardust",
        confidence: 70,
        importance: -2,
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })

    expect(high).toMatchObject({
      confidence: 100,
      importance: 10,
    })
    expect(low).toMatchObject({
      confidence: 70,
      importance: 1,
    })
  })
})
