import {
  LIFE_UNIVERSE_CONTENT_TYPES,
  LIFE_UNIVERSE_GALAXIES,
  LIFE_UNIVERSE_SPECIAL_AREAS,
  getLifeUniverseGalaxy,
  getLifeUniverseTaxonomy,
  isBlackBoxArea,
} from "@/lib/life-universe/taxonomy"
import { describe, expect, it } from "vitest"

describe("life universe taxonomy", () => {
  it("defines the seven top-level galaxies in homepage order", () => {
    expect(LIFE_UNIVERSE_GALAXIES.map((galaxy) => galaxy.slug)).toEqual([
      "work",
      "technology",
      "writing",
      "diary",
      "relationships",
      "life",
      "interests",
    ])
    expect(LIFE_UNIVERSE_GALAXIES.map((galaxy) => galaxy.name)).toEqual([
      "工作与职业",
      "技术与学习",
      "写作与表达",
      "日记与自我",
      "关系与情感",
      "生活与体验",
      "兴趣与娱乐",
    ])
  })

  it("keeps content types independent from galaxies", () => {
    expect(LIFE_UNIVERSE_CONTENT_TYPES.map((type) => type.slug)).toEqual([
      "article",
      "diary",
      "project",
      "memory",
      "photo",
      "fragment",
      "list",
    ])
    expect(LIFE_UNIVERSE_CONTENT_TYPES.map((type) => type.label)).toEqual([
      "文章",
      "日记",
      "项目",
      "记忆",
      "照片",
      "碎片",
      "清单",
    ])
    expect(
      LIFE_UNIVERSE_CONTENT_TYPES.find((type) => type.slug === "diary")?.label
    ).toBe("日记")
    expect(getLifeUniverseGalaxy("diary")?.name).toBe("日记与自我")
    expect(
      LIFE_UNIVERSE_CONTENT_TYPES.find((type) => type.slug === "diary")?.label
    ).not.toBe(getLifeUniverseGalaxy("diary")?.name)
    const galaxyNames = new Set(
      LIFE_UNIVERSE_GALAXIES.map((galaxy) => galaxy.name)
    )
    expect(
      LIFE_UNIVERSE_CONTENT_TYPES.every((type) => !galaxyNames.has(type.label))
    ).toBe(true)
  })

  it("defines special holding areas for uncertain and private material", () => {
    expect(LIFE_UNIVERSE_SPECIAL_AREAS.map((area) => area.slug)).toEqual([
      "stardust",
      "meteor",
      "unnamed-planet",
      "black-box",
    ])
    expect(isBlackBoxArea("black-box")).toBe(true)
    expect(isBlackBoxArea("stardust")).toBe(false)
  })

  it("looks up galaxies by slug", () => {
    expect(getLifeUniverseGalaxy("relationships")).toMatchObject({
      name: "关系与情感",
      suggestedPlanets: expect.arrayContaining(["感情", "朋友", "家庭"]),
    })
    expect(getLifeUniverseGalaxy("missing")).toBeUndefined()
  })

  it("returns defensive clones for mutable consumers", () => {
    const first = getLifeUniverseTaxonomy()
    first.galaxies[0].suggestedPlanets.push("mutated")
    const mutableContentType = first.contentTypes[0] as { label: string }
    mutableContentType.label = "mutated"

    const next = getLifeUniverseTaxonomy()
    expect(next.galaxies[0].suggestedPlanets).not.toContain("mutated")
    expect(next.contentTypes[0].label).toBe("文章")
  })
})
