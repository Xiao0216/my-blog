import { describe, expect, it } from "vitest"

import {
  buildPlanetPreview,
  buildPlanetUniverseModel,
  getPlanetRenderLevel,
} from "@/components/site/life-universe/planet-universe-model"
import type { StoredMemory, StoredPlanet } from "@/lib/content"

const planets: StoredPlanet[] = [
  {
    id: 1,
    slug: "work",
    name: "工作与职业",
    summary: "工作、项目和职业成长。",
    description: "更完整的工作描述。",
    x: 160,
    y: -140,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 1,
    weight: 10,
  },
  {
    id: 2,
    slug: "life",
    name: "生活与体验",
    summary: "生活、旅行和体验。",
    description: "更完整的生活描述。",
    x: 300,
    y: -260,
    size: "medium",
    theme: "teal",
    status: "published",
    sortOrder: 6,
    weight: 7,
  },
  {
    id: 3,
    slug: "mystery",
    name: "未知星球",
    summary: "未分类内容。",
    description: "更完整的未知描述。",
    x: -40,
    y: 80,
    size: "small",
    theme: "magenta",
    status: "published",
    sortOrder: 9,
    weight: 4,
  },
]

const memories: StoredMemory[] = [
  {
    id: 1,
    planetId: 1,
    planetSlug: "work",
    planetName: "工作与职业",
    title: "公开工作记忆",
    content: "公开内容",
    type: "bio",
    occurredAt: "2026-04-24",
    visibility: "public",
    importance: 9,
    tags: ["工作"],
    source: "test",
  },
  {
    id: 2,
    planetId: 1,
    planetSlug: "work",
    planetName: "工作与职业",
    title: "助手工作记忆",
    content: "助手内容",
    type: "preference",
    occurredAt: "2026-04-25",
    visibility: "assistant",
    importance: 8,
    tags: ["工作"],
    source: "test",
  },
]

describe("planet universe model", () => {
  it("represents every supplied planet as an orbiting planet", () => {
    const model = buildPlanetUniverseModel({ memories, planets })

    expect(model.planets.map((planet) => planet.slug)).toEqual([
      "work",
      "life",
      "mystery",
    ])
    expect(model.planets[0]).toMatchObject({
      id: "planet-1",
      name: "工作与职业",
      level: 0,
      tone: "cyan",
      size: 86,
    })
    expect(model.planets[1]).toMatchObject({
      id: "planet-2",
      name: "生活与体验",
      level: 0,
      tone: "teal",
      size: 68,
    })
    expect(model.planets[2]).toMatchObject({
      id: "planet-3",
      name: "未知星球",
      level: 0,
      tone: "violet",
      size: 48,
    })
    expect(model.planets[0].orbit.radius).toBeGreaterThan(150)
    expect(model.planets[0].orbit.durationSeconds).toBeGreaterThan(20)
    expect(model.planets[0].rotation.durationSeconds).toBeGreaterThan(10)
    expect(model.planets[0].orbit.startAngle).toBeGreaterThanOrEqual(0)
    expect(model.planets[0].orbit.startAngle).toBeLessThan(360)
    expect(Number.isInteger(model.planets[0].orbit.startAngle)).toBe(true)
  })

  it("uses stable deterministic orbit values for identical input", () => {
    const first = buildPlanetUniverseModel({ memories, planets })
    const second = buildPlanetUniverseModel({ memories, planets })

    expect(second).toEqual(first)
  })

  it("counts only public memories in hover preview content", () => {
    const model = buildPlanetUniverseModel({ memories, planets })
    const preview = buildPlanetPreview(model.planets[0])
    const emptyPreview = buildPlanetPreview(model.planets[1])

    expect(preview.title).toBe("工作与职业")
    expect(preview.summary).toBe("工作、项目和职业成长。")
    expect(preview.meta).toBe("1 条公开记忆 · 1 条助手记忆")
    expect(preview.hint).toBe("双击进入行星")
    expect(emptyPreview.meta).toBe("0 条公开记忆 · 0 条助手记忆")
  })

  it("downgrades distant or crowded planets to lightweight render levels", () => {
    expect(
      getPlanetRenderLevel({
        distanceFromFocus: 900,
        isFocused: false,
        isHovered: false,
        totalPlanets: 42,
      }),
    ).toBe("point")
    expect(
      getPlanetRenderLevel({
        distanceFromFocus: 900,
        isFocused: false,
        isHovered: false,
        totalPlanets: 18,
      }),
    ).toBe("simple")
    expect(
      getPlanetRenderLevel({
        distanceFromFocus: 420,
        isFocused: false,
        isHovered: false,
        totalPlanets: 42,
      }),
    ).toBe("simple")
    expect(
      getPlanetRenderLevel({
        distanceFromFocus: 120,
        isFocused: false,
        isHovered: true,
        totalPlanets: 42,
      }),
    ).toBe("full")
    expect(
      getPlanetRenderLevel({
        distanceFromFocus: 120,
        isFocused: false,
        isHovered: false,
        totalPlanets: 42,
      }),
    ).toBe("simple")
    expect(
      getPlanetRenderLevel({
        distanceFromFocus: 120,
        isFocused: false,
        isHovered: false,
        totalPlanets: 5,
      }),
    ).toBe("full")
  })
})
