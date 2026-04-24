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

const crowdedCards: ReadonlyArray<UniverseLayoutInputCard> = [
  {
    id: "core",
    kind: "core",
    group: "self",
    importance: 10,
    width: 286,
    height: 190,
  },
  {
    id: "planet-a",
    kind: "planet",
    group: "life",
    importance: 9,
    width: 184,
    height: 142,
  },
  {
    id: "planet-b",
    kind: "planet",
    group: "work",
    importance: 9,
    width: 184,
    height: 142,
  },
  {
    id: "planet-c",
    kind: "planet",
    group: "diary",
    importance: 9,
    width: 184,
    height: 142,
  },
  {
    id: "planet-d",
    kind: "planet",
    group: "family",
    importance: 9,
    width: 184,
    height: 142,
  },
  {
    id: "project-a",
    kind: "project",
    group: "build",
    importance: 7,
    width: 176,
    height: 132,
  },
  {
    id: "project-b",
    kind: "project",
    group: "build",
    importance: 7,
    width: 176,
    height: 132,
  },
  {
    id: "essay-a",
    kind: "essay",
    group: "technology",
    importance: 6,
    width: 168,
    height: 128,
  },
  {
    id: "essay-b",
    kind: "essay",
    group: "technology",
    importance: 6,
    width: 168,
    height: 128,
  },
]

describe("universe layout", () => {
  it("treats the safety margin as expansion on both rectangles", () => {
    const left = { height: 80, width: 100, x: 40, y: 40 }

    expect(cardsOverlap(left, { height: 80, width: 100, x: 204, y: 40 }, 32)).toBe(true)
    expect(cardsOverlap(left, { height: 80, width: 100, x: 205, y: 40 }, 32)).toBe(false)
  })

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

  it("keeps the normal fixture within the safe viewport bounds", () => {
    const placedCards = layoutUniverseCards(fixtureCards, {
      centerX: 480,
      centerY: 330,
      height: 660,
      width: 960,
    })

    expectCardsWithinSafetyBounds(placedCards, 960, 660)
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
        expect(cardsOverlap(placedCards[index], placedCards[nextIndex], 32)).toBe(false)
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

  it("still places a crowded but possible fixture without overlap", () => {
    const placedCards = layoutUniverseCards(crowdedCards, {
      centerX: 540,
      centerY: 360,
      height: 720,
      width: 1080,
    })

    expectCardsWithinSafetyBounds(placedCards, 1080, 720)

    for (let index = 0; index < placedCards.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < placedCards.length; nextIndex += 1) {
        expect(cardsOverlap(placedCards[index], placedCards[nextIndex], 32)).toBe(false)
      }
    }

    expect(placedCards.some((card) => card.ring >= 3)).toBe(true)
  })
})

function expectCardsWithinSafetyBounds(
  cards: ReadonlyArray<{ height: number; width: number; x: number; y: number }>,
  width: number,
  height: number
) {
  for (const card of cards) {
    expect(card.x).toBeGreaterThanOrEqual(32)
    expect(card.y).toBeGreaterThanOrEqual(32)
    expect(card.x + card.width).toBeLessThanOrEqual(width - 32)
    expect(card.y + card.height).toBeLessThanOrEqual(height - 32)
  }
}
