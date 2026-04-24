import { describe, expect, it } from "vitest"

import {
  cardsOverlap,
  layoutUniverseCards,
} from "@/components/site/life-universe/universe-layout"
import type { UniverseLayoutInputCard } from "@/components/site/life-universe/types"

const fixtureCards: ReadonlyArray<UniverseLayoutInputCard> = [
  {
    id: "core",
    kind: "core",
    group: "self",
    importance: 10,
    width: 286,
    height: 190,
  },
  {
    id: "life",
    kind: "planet",
    group: "life",
    importance: 9,
    width: 184,
    height: 142,
  },
  {
    id: "work",
    kind: "planet",
    group: "work",
    importance: 9,
    width: 184,
    height: 142,
  },
  {
    id: "diary",
    kind: "planet",
    group: "diary",
    importance: 8,
    width: 168,
    height: 140,
  },
  {
    id: "essay-1",
    kind: "essay",
    group: "technology",
    importance: 5,
    width: 164,
    height: 138,
  },
  {
    id: "note-1",
    kind: "note",
    group: "diary",
    importance: 3,
    width: 164,
    height: 124,
  },
]

describe("universe layout", () => {
  it("places cards deterministically for the same input", () => {
    const first = layoutUniverseCards(fixtureCards, {
      centerX: 480,
      centerY: 330,
      height: 660,
      width: 960,
    })
    const second = layoutUniverseCards(fixtureCards, {
      centerX: 480,
      centerY: 330,
      height: 660,
      width: 960,
    })

    expect(second).toEqual(first)
  })

  it("does not overlap card rectangles when expanded by the safety margin", () => {
    const placedCards = layoutUniverseCards(fixtureCards, {
      centerX: 480,
      centerY: 330,
      height: 660,
      width: 960,
    })

    for (let index = 0; index < placedCards.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < placedCards.length; nextIndex += 1) {
        expect(
          cardsOverlap(placedCards[index], placedCards[nextIndex], 32)
        ).toBe(false)
      }
    }
  })

  it("derives a front-facing posture for the core card and angled postures for orbit cards", () => {
    const placedCards = layoutUniverseCards(fixtureCards, {
      centerX: 480,
      centerY: 330,
      height: 660,
      width: 960,
    })
    const core = placedCards.find((card) => card.id === "core")
    const orbitCard = placedCards.find((card) => card.id === "life")

    expect(core?.posture.rotateX).toBe(0)
    expect(core?.posture.rotateY).toBe(0)
    expect(core?.posture.translateZ).toBeGreaterThan(orbitCard?.posture.translateZ ?? 0)
    expect(Math.abs(orbitCard?.posture.rotateY ?? 0)).toBeGreaterThan(0)
  })
})
