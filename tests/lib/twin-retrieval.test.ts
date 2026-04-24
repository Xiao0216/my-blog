import { describe, expect, it } from "vitest"

import type { StoredMemory, StoredPlanet } from "@/lib/cms/schema"
import { retrieveTwinContext } from "@/lib/twin/retrieval"

const planets: ReadonlyArray<StoredPlanet> = [
  {
    id: 1,
    slug: "work",
    name: "Work",
    summary: "Delivery and engineering collaboration",
    description: "How work is planned and shipped.",
    x: 0,
    y: 0,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 1,
    weight: 9,
  },
  {
    id: 2,
    slug: "health",
    name: "Health",
    summary: "Energy and routines",
    description: "Personal rhythm and sustainable pace.",
    x: 100,
    y: 100,
    size: "medium",
    theme: "emerald",
    status: "published",
    sortOrder: 2,
    weight: 4,
  },
]

const memories: ReadonlyArray<StoredMemory> = [
  {
    id: 1,
    planetId: 1,
    planetSlug: "work",
    planetName: "Work",
    title: "Engineering delivery style",
    content: "I prefer practical delivery, clear ownership, and maintainable code.",
    type: "preference",
    occurredAt: "2026-04-24",
    visibility: "public",
    importance: 9,
    tags: ["engineering", "delivery"],
    source: "fixture",
  },
  {
    id: 2,
    planetId: 2,
    planetSlug: "health",
    planetName: "Health",
    title: "Private health note",
    content: "This private note should never appear.",
    type: "diary",
    occurredAt: "2026-04-24",
    visibility: "private",
    importance: 10,
    tags: ["private"],
    source: "fixture",
  },
]

describe("retrieveTwinContext", () => {
  it("returns ranked planet and memory references for a query", () => {
    const result = retrieveTwinContext({
      message: "How do you approach engineering delivery?",
      focusedPlanetId: undefined,
      planets,
      memories,
      limit: 4,
    })

    expect(result.references[0]).toMatchObject({
      kind: "memory",
      id: "memory-1",
      title: "Engineering delivery style",
    })
    expect(result.contextText).toContain("Engineering delivery style")
    expect(result.contextText).toContain("maintainable code")
  })

  it("excludes private memories even when text matches", () => {
    const result = retrieveTwinContext({
      message: "private health note",
      focusedPlanetId: 2,
      planets,
      memories,
      limit: 4,
    })

    expect(result.contextText).not.toContain("This private note should never appear")
    expect(result.references.map((reference) => reference.id)).not.toContain("memory-2")
  })
})
