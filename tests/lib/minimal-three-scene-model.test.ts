import { describe, expect, it } from "vitest"

import {
  buildMinimalThreeScene,
  getMinimalColorScheme,
} from "@/components/site/life-universe/minimal-three-scene-model"
import type {
  PlanetUniverseBodyModel,
  UniverseContentNodeModel,
} from "@/components/site/life-universe/types"

const contentNodes: UniverseContentNodeModel[] = [
  {
    contentType: "essay",
    href: "/essays/frontend",
    id: "essay-frontend",
    importance: 8,
    kind: "star",
    summary: "前端工程化内容摘要。",
    targetPlanetId: "planet-1",
    title: "前端工程化",
  },
  {
    contentType: "memory",
    id: "memory-1",
    importance: 4,
    kind: "fragment",
    summary: "一条零散记忆。",
    targetPlanetId: "planet-2",
    title: "零散记忆",
  },
]

const planets: PlanetUniverseBodyModel[] = [
  {
    id: "planet-1",
    planetId: 1,
    slug: "work",
    name: "工作与职业",
    summary: "工作、项目和职业成长。",
    description: "完整描述",
    level: 0,
    size: 86,
    tone: "cyan",
    orbit: { delaySeconds: -1, durationSeconds: 44, radius: 220, startAngle: 40 },
    rotation: { durationSeconds: 24 },
    publicMemoryCount: 2,
    assistantMemoryCount: 1,
  },
  {
    id: "planet-2",
    planetId: 2,
    slug: "writing",
    name: "写作与表达",
    summary: "写作和表达。",
    description: "完整描述",
    level: 0,
    size: 68,
    tone: "violet",
    orbit: { delaySeconds: -4, durationSeconds: 52, radius: 280, startAngle: 140 },
    rotation: { durationSeconds: 28 },
    publicMemoryCount: 0,
    assistantMemoryCount: 0,
  },
  {
    id: "planet-3",
    planetId: 3,
    slug: "life",
    name: "生活与体验",
    summary: "生活体验。",
    description: "完整描述",
    level: 0,
    size: 48,
    tone: "neutral",
    orbit: { delaySeconds: -8, durationSeconds: 60, radius: 360, startAngle: 260 },
    rotation: { durationSeconds: 32 },
    publicMemoryCount: 1,
    assistantMemoryCount: 0,
  },
]

describe("minimal three scene model", () => {
  it("maps every public planet into a deterministic 3d body", () => {
    const first = buildMinimalThreeScene(planets)
    const second = buildMinimalThreeScene(planets)

    expect(second).toEqual(first)
    expect(first.bodies.map((body) => body.id)).toEqual(["planet-1", "planet-2", "planet-3"])
    expect(first.bodies[0]).toMatchObject({
      colorScheme: "sage",
      hasRing: true,
      id: "planet-1",
      name: "工作与职业",
      renderLevel: "full",
    })
    expect(first.bodies[0].position).toHaveLength(3)
    expect(first.bodies[0].size).toBeGreaterThan(first.bodies[2].size)
    expect(first.stars.length).toBeGreaterThanOrEqual(18)
    expect(first.stars.length).toBeLessThanOrEqual(44)
    expect(first.stars.every((star) => Boolean(star.id))).toBe(true)
    expect(first.stars.every((star) => star.kind === "background")).toBe(true)
  })

  it("places concrete content nodes as non-overlapping scattered stars and fragments", () => {
    const first = buildMinimalThreeScene(planets, contentNodes)
    const second = buildMinimalThreeScene(planets, contentNodes)
    const contentStars = first.stars.filter((star) => star.kind !== "background")

    expect(second).toEqual(first)
    expect(contentStars).toHaveLength(2)
    expect(contentStars[0]).toMatchObject({
      contentType: "essay",
      href: "/essays/frontend",
      id: "essay-frontend",
      kind: "star",
      targetPlanetId: "planet-1",
      title: "前端工程化",
    })
    expect(contentStars[1]).toMatchObject({
      contentType: "memory",
      id: "memory-1",
      kind: "fragment",
      targetPlanetId: "planet-2",
      title: "零散记忆",
    })
    const dx = contentStars[0].position[0] - contentStars[1].position[0]
    const dy = contentStars[0].position[1] - contentStars[1].position[1]
    expect(Math.sqrt(dx * dx + dy * dy)).toBeGreaterThan(38)
  })

  it("cycles restrained color schemes so adjacent cyan-like planets are not identical", () => {
    expect(getMinimalColorScheme({ tone: "cyan", index: 0 })).toBe("sage")
    expect(getMinimalColorScheme({ tone: "cyan", index: 1 })).toBe("warm")
    expect(getMinimalColorScheme({ tone: "violet", index: 2 })).toBe("mist")
    expect(getMinimalColorScheme({ tone: "blue", index: 3 })).toBe("slate")
    expect(getMinimalColorScheme({ tone: "neutral", index: 4 })).toBe("rose")
  })

  it("keeps all crowded public planets represented while reducing low-priority detail", () => {
    const crowded = Array.from({ length: 20 }, (_, index) => ({
      ...planets[index % planets.length],
      id: `planet-${index + 1}`,
      planetId: index + 1,
      slug: `planet-${index + 1}`,
      size: index < 8 ? 86 : 48,
      orbit: {
        delaySeconds: -index,
        durationSeconds: 44 + index,
        radius: 220 + index * 18,
        startAngle: (index * 37) % 360,
      },
    }))
    const scene = buildMinimalThreeScene(crowded)

    expect(scene.bodies).toHaveLength(20)
    expect(scene.bodies.some((body) => body.renderLevel === "point")).toBe(true)
    expect(scene.bodies.some((body) => body.renderLevel === "simple")).toBe(true)
    expect(scene.bodies.slice(0, 8).every((body) => body.renderLevel === "full")).toBe(true)
  })
})
