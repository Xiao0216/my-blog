# Life Universe Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the approved life-universe taxonomy as data and tests while keeping the current homepage visual UI unchanged.

**Architecture:** Add one canonical taxonomy module for galaxies, content types, and special areas. Use that module to seed the CMS life-universe planets as the seven top-level galaxies, with guarded migration for legacy seed planets. Keep homepage components data-driven so the UI structure stays unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript, SQLite via `node:sqlite`, Vitest, Testing Library.

---

## Scope Split

This plan implements the first testable slice of the taxonomy design:

- Canonical taxonomy constants and helpers.
- Seven top-level galaxies in the CMS seed data.
- Migration guard for old seed-only planets.
- Tests proving content helpers and homepage rendering use the new taxonomy without changing layout controls.

This plan does not implement search overlays, filter panels, route-based galaxy pages, or new admin workflows. Those are separate implementation plans after this foundation exists.

## File Structure

- Create `lib/life-universe/taxonomy.ts`: canonical source for galaxy, content type, and special-area metadata.
- Create `tests/lib/life-universe-taxonomy.test.ts`: unit coverage for taxonomy constants, lookup helpers, and defensive cloning.
- Modify `lib/cms/db.ts`: seed the seven taxonomy galaxies and migrate legacy seed planets only when their old seed summaries still match.
- Modify `tests/lib/cms-db.test.ts`: verify fresh CMS databases expose seven public galaxies and legacy `health` seed data is retired when untouched.
- Modify `lib/content.ts`: expose a cloned taxonomy helper for pages and future admin code.
- Modify `tests/lib/content.test.ts`: verify public content helpers expose the seven galaxy slugs and taxonomy clones do not leak mutation.
- Modify `tests/components/home-page-view.test.tsx`: add a regression that the homepage can render all seven galaxies while preserving existing controls.

## Task 1: Canonical Taxonomy Module

**Files:**
- Create: `lib/life-universe/taxonomy.ts`
- Create: `tests/lib/life-universe-taxonomy.test.ts`

- [ ] **Step 1: Write the failing taxonomy tests**

Create `tests/lib/life-universe-taxonomy.test.ts`:

```ts
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
    first.contentTypes[0].label = "mutated"

    const next = getLifeUniverseTaxonomy()
    expect(next.galaxies[0].suggestedPlanets).not.toContain("mutated")
    expect(next.contentTypes[0].label).toBe("文章")
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npm test -- tests/lib/life-universe-taxonomy.test.ts
```

Expected: FAIL because `@/lib/life-universe/taxonomy` does not exist.

- [ ] **Step 3: Add the taxonomy module**

Create `lib/life-universe/taxonomy.ts`:

```ts
export type LifeUniverseGalaxySlug =
  | "work"
  | "technology"
  | "writing"
  | "diary"
  | "relationships"
  | "life"
  | "interests"

export type LifeUniverseContentTypeSlug =
  | "article"
  | "diary"
  | "project"
  | "memory"
  | "photo"
  | "fragment"
  | "list"

export type LifeUniverseSpecialAreaSlug =
  | "stardust"
  | "meteor"
  | "unnamed-planet"
  | "black-box"

export type LifeUniverseGalaxy = {
  readonly slug: LifeUniverseGalaxySlug
  readonly name: string
  readonly summary: string
  readonly description: string
  readonly suggestedPlanets: ReadonlyArray<string>
  readonly x: number
  readonly y: number
  readonly size: "small" | "medium" | "large"
  readonly theme: string
  readonly sortOrder: number
  readonly weight: number
}

export type LifeUniverseContentType = {
  slug: LifeUniverseContentTypeSlug
  label: string
  description: string
}

export type LifeUniverseSpecialArea = {
  readonly slug: LifeUniverseSpecialAreaSlug
  readonly label: string
  readonly description: string
  readonly visibility: "public" | "private"
}

export type LifeUniverseTaxonomy = {
  galaxies: Array<LifeUniverseGalaxy & { suggestedPlanets: string[] }>
  contentTypes: LifeUniverseContentType[]
  specialAreas: LifeUniverseSpecialArea[]
}

export const LIFE_UNIVERSE_GALAXIES: ReadonlyArray<LifeUniverseGalaxy> = [
  {
    slug: "work",
    name: "工作与职业",
    summary: "过往工作、项目经历、职业成长、协作复盘和求职准备。",
    description:
      "记录职业历史、工作方式、项目交付、团队协作、阶段复盘和未来职业选择。",
    suggestedPlanets: ["过往工作", "医疗项目", "前端交付", "数据平台", "协作复盘", "职业成长", "求职准备"],
    x: 160,
    y: -140,
    size: "large",
    theme: "cyan",
    sortOrder: 1,
    weight: 10,
  },
  {
    slug: "technology",
    name: "技术与学习",
    summary: "前端、工程化、性能优化、AI 工具、读书学习和实验记录。",
    description:
      "沉淀技术学习、工程判断、工具实践、阅读笔记和可复用的实验经验。",
    suggestedPlanets: ["Vue", "JavaScript", "工程化", "性能优化", "ECharts", "WebSocket", "AI 工具", "读书学习", "实验记录"],
    x: -40,
    y: 320,
    size: "large",
    theme: "blue",
    sortOrder: 2,
    weight: 9,
  },
  {
    slug: "writing",
    name: "写作与表达",
    summary: "正式文章、随笔、观点、摘录、灵感、草稿和发布复盘。",
    description:
      "收纳公开表达、写作素材、观点整理、灵感片段和从草稿到发布的过程。",
    suggestedPlanets: ["正式文章", "随笔", "观点", "摘录", "灵感", "草稿", "发布复盘"],
    x: 420,
    y: 170,
    size: "medium",
    theme: "violet",
    sortOrder: 3,
    weight: 7,
  },
  {
    slug: "diary",
    name: "日记与自我",
    summary: "日常记录、情绪、健康、习惯、阶段复盘、个人目标和自我观察。",
    description:
      "记录日常状态、身体和情绪信号、习惯变化、个人目标以及阶段性自我理解。",
    suggestedPlanets: ["每日记录", "情绪", "健康", "习惯", "阶段复盘", "个人目标", "自我观察"],
    x: -260,
    y: 120,
    size: "large",
    theme: "teal",
    sortOrder: 4,
    weight: 8,
  },
  {
    slug: "relationships",
    name: "关系与情感",
    summary: "感情、朋友、家庭、重要对话、感谢、遗憾和边界感。",
    description:
      "保存亲密关系、朋友、家庭、重要对话、情绪记忆、感谢、遗憾和个人边界。",
    suggestedPlanets: ["感情", "朋友", "家庭", "重要对话", "感谢", "遗憾", "边界感"],
    x: -500,
    y: -160,
    size: "medium",
    theme: "emerald",
    sortOrder: 5,
    weight: 7,
  },
  {
    slug: "life",
    name: "生活与体验",
    summary: "旅游、城市、饮食、租房、消费、生活方式和周末记录。",
    description:
      "记录具体生活体验，包括去过的地方、吃过的东西、住处、消费选择和普通周末。",
    suggestedPlanets: ["旅游", "城市", "饮食", "租房", "消费", "生活方式", "周末记录"],
    x: 300,
    y: -260,
    size: "medium",
    theme: "teal",
    sortOrder: 6,
    weight: 7,
  },
  {
    slug: "interests",
    name: "兴趣与娱乐",
    summary: "游戏、影视、音乐、运动、收藏、折腾的小东西和短期兴趣。",
    description:
      "保存兴趣爱好、娱乐体验、游戏和影视记录、音乐运动、收藏以及阶段性折腾。",
    suggestedPlanets: ["游戏", "影视", "音乐", "运动", "收藏", "折腾的小东西", "短期兴趣"],
    x: -360,
    y: 300,
    size: "medium",
    theme: "violet",
    sortOrder: 7,
    weight: 6,
  },
]

export const LIFE_UNIVERSE_CONTENT_TYPES: ReadonlyArray<LifeUniverseContentType> = [
  { slug: "article", label: "文章", description: "成熟的公开写作。" },
  { slug: "diary", label: "日记", description: "按时间记录的个人状态和经历。" },
  { slug: "project", label: "项目", description: "工作、产品或个人构建记录。" },
  { slug: "memory", label: "记忆", description: "具体经历、偏好、事实或里程碑。" },
  { slug: "photo", label: "照片", description: "视觉记忆、旅行或生活影像。" },
  { slug: "fragment", label: "碎片", description: "短笔记、灵感、摘录或未完成观察。" },
  { slug: "list", label: "清单", description: "计划、推荐、任务、书单、游戏或目标列表。" },
]

export const LIFE_UNIVERSE_SPECIAL_AREAS: ReadonlyArray<LifeUniverseSpecialArea> = [
  {
    slug: "stardust",
    label: "星尘",
    description: "还没有明确归属的临时碎片。",
    visibility: "public",
  },
  {
    slug: "meteor",
    label: "流星",
    description: "短期兴趣或可能消失的阶段性关注。",
    visibility: "public",
  },
  {
    slug: "unnamed-planet",
    label: "未命名星球",
    description: "重复出现但尚未正式命名的新主题。",
    visibility: "public",
  },
  {
    slug: "black-box",
    label: "黑匣子",
    description: "私密或敏感内容，不进入公开展示和公开 AI 上下文。",
    visibility: "private",
  },
]

export function getLifeUniverseGalaxy(slug: string) {
  return LIFE_UNIVERSE_GALAXIES.find((galaxy) => galaxy.slug === slug)
}

export function isBlackBoxArea(slug: string) {
  return slug === "black-box"
}

export function getLifeUniverseTaxonomy(): LifeUniverseTaxonomy {
  return {
    galaxies: LIFE_UNIVERSE_GALAXIES.map((galaxy) => ({
      ...galaxy,
      suggestedPlanets: [...galaxy.suggestedPlanets],
    })),
    contentTypes: LIFE_UNIVERSE_CONTENT_TYPES.map((type) => ({ ...type })),
    specialAreas: LIFE_UNIVERSE_SPECIAL_AREAS.map((area) => ({ ...area })),
  }
}
```

- [ ] **Step 4: Run the taxonomy tests and verify they pass**

Run:

```bash
npm test -- tests/lib/life-universe-taxonomy.test.ts
```

Expected: PASS with all taxonomy tests passing.

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/life-universe/taxonomy.ts tests/lib/life-universe-taxonomy.test.ts
git commit -m "feat: add life universe taxonomy"
```

## Task 2: Seed Seven Top-Level Galaxies

**Files:**
- Modify: `lib/cms/db.ts`
- Modify: `tests/lib/cms-db.test.ts`

- [ ] **Step 1: Write failing CMS seed tests**

In `tests/lib/cms-db.test.ts`, update the existing `seeds public life planets, assistant memories, and twin identity` expectation:

```ts
    expect(db.getPublicPlanets().map((planet) => planet.slug)).toEqual([
      "work",
      "technology",
      "writing",
      "diary",
      "relationships",
      "life",
      "interests",
    ])
    expect(db.getPublicPlanets().map((planet) => planet.name)).toEqual([
      "工作与职业",
      "技术与学习",
      "写作与表达",
      "日记与自我",
      "关系与情感",
      "生活与体验",
      "兴趣与娱乐",
    ])
```

Add this test below `does not duplicate seeded memories across module reloads`:

```ts
  it("retires the untouched legacy health seed planet during initialization", async () => {
    let db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "health",
      name: "Health",
      summary: "Energy, habits, body signals, and sustainable pace.",
      description:
        "The health planet tracks routines and constraints that affect long-term output.",
      x: -500,
      y: -160,
      size: "medium",
      theme: "emerald",
      status: "published",
      sortOrder: 5,
      weight: 5,
    })

    expect(db.getPublicPlanets().map((planet) => planet.slug)).toContain("health")

    db = await loadDb()
    db.initializeCmsDatabase()

    expect(db.getPublicPlanets().map((planet) => planet.slug)).not.toContain("health")
    expect(db.getAdminPlanets().find((planet) => planet.slug === "health")).toMatchObject({
      status: "draft",
    })
  })
```

- [ ] **Step 2: Run CMS tests and verify they fail**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: FAIL because the database still seeds `life`, `work`, `diary`, `technology`, and `health`.

- [ ] **Step 3: Replace seed planets with taxonomy galaxies**

In `lib/cms/db.ts`, add this import near the other imports:

```ts
import { LIFE_UNIVERSE_GALAXIES } from "@/lib/life-universe/taxonomy"
```

Replace the existing `lifeUniverseSeedPlanets` constant with:

```ts
const lifeUniverseSeedPlanets: ReadonlyArray<PlanetInput> =
  LIFE_UNIVERSE_GALAXIES.map((galaxy) => ({
    slug: galaxy.slug,
    name: galaxy.name,
    summary: galaxy.summary,
    description: galaxy.description,
    x: galaxy.x,
    y: galaxy.y,
    size: galaxy.size,
    theme: galaxy.theme,
    status: "published",
    sortOrder: galaxy.sortOrder,
    weight: galaxy.weight,
  }))

const legacySeedPlanetSummaries: Record<string, string> = {
  diary: "Short reflections and personal state over time.",
  health: "Energy, habits, body signals, and sustainable pace.",
  life: "Daily rhythm, relationships with the world, and lived texture.",
  technology: "Front-end systems, performance, AI, and product engineering.",
  work: "Delivery habits, collaboration, and engineering judgment.",
}
```

- [ ] **Step 4: Guard legacy seed migration**

In `lib/cms/db.ts`, add this helper above `function seedLifeUniverse(database: DatabaseSync)`:

```ts
function updateLegacySeedPlanet(
  database: DatabaseSync,
  planet: PlanetInput,
  timestamp: string
) {
  const legacySummary = legacySeedPlanetSummaries[planet.slug]

  if (!legacySummary) {
    return
  }

  run(
    database,
    `UPDATE planets
     SET name = ?, summary = ?, description = ?, x = ?, y = ?, size = ?,
         theme = ?, status = ?, sort_order = ?, weight = ?, updated_at = ?
     WHERE slug = ? AND summary = ?`,
    [
      planet.name,
      planet.summary,
      planet.description,
      planet.x,
      planet.y,
      planet.size,
      planet.theme,
      planet.status,
      planet.sortOrder,
      planet.weight,
      timestamp,
      planet.slug,
      legacySummary,
    ]
  )
}

function retireLegacyHealthSeedPlanet(database: DatabaseSync, timestamp: string) {
  run(
    database,
    `UPDATE planets
     SET status = 'draft', updated_at = ?
     WHERE slug = 'health' AND summary = ?`,
    [timestamp, legacySeedPlanetSummaries.health]
  )
}
```

In `seedLifeUniverse`, after the `for (const planet of lifeUniverseSeedPlanets)` insert loop, add:

```ts
  for (const planet of lifeUniverseSeedPlanets) {
    updateLegacySeedPlanet(database, planet, timestamp)
  }

  retireLegacyHealthSeedPlanet(database, timestamp)
```

- [ ] **Step 5: Run CMS tests and verify they pass**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: PASS with the seven galaxy slugs and legacy `health` retirement covered.

- [ ] **Step 6: Commit Task 2**

```bash
git add lib/cms/db.ts tests/lib/cms-db.test.ts
git commit -m "feat: seed life universe galaxies"
```

## Task 3: Expose Taxonomy Through Content Helpers

**Files:**
- Modify: `lib/content.ts`
- Modify: `tests/lib/content.test.ts`

- [ ] **Step 1: Write failing content helper tests**

In `tests/lib/content.test.ts`, add `getLifeUniverseTaxonomy` to the import list:

```ts
  getLifeUniverseTaxonomy,
```

Update the existing `exposes life universe planets, memories, and twin identity` slug expectation:

```ts
    expect(planets.map((planet) => planet.slug)).toEqual([
      "work",
      "technology",
      "writing",
      "diary",
      "relationships",
      "life",
      "interests",
    ])
```

Add this test after that existing test:

```ts
  it("exposes the life universe taxonomy without leaking mutations", () => {
    const taxonomy = getLifeUniverseTaxonomy()

    expect(taxonomy.galaxies.map((galaxy) => galaxy.slug)).toEqual([
      "work",
      "technology",
      "writing",
      "diary",
      "relationships",
      "life",
      "interests",
    ])
    expect(taxonomy.specialAreas.find((area) => area.slug === "black-box")).toMatchObject({
      label: "黑匣子",
      visibility: "private",
    })

    taxonomy.galaxies[0].suggestedPlanets.push("mutated")
    taxonomy.contentTypes[0].label = "mutated"

    const next = getLifeUniverseTaxonomy()
    expect(next.galaxies[0].suggestedPlanets).not.toContain("mutated")
    expect(next.contentTypes[0].label).toBe("文章")
  })
```

- [ ] **Step 2: Run content tests and verify they fail**

Run:

```bash
npm test -- tests/lib/content.test.ts
```

Expected: FAIL because `getLifeUniverseTaxonomy` is not exported and the seeded planet list is still old until Task 2 is applied.

- [ ] **Step 3: Export taxonomy from content layer**

In `lib/content.ts`, add this import:

```ts
import {
  getLifeUniverseTaxonomy as getCanonicalLifeUniverseTaxonomy,
  type LifeUniverseTaxonomy,
} from "@/lib/life-universe/taxonomy"
```

Add this type export near the other `export type` lines:

```ts
export type { LifeUniverseTaxonomy }
```

Add this function near `getLifePlanets`:

```ts
export function getLifeUniverseTaxonomy(): LifeUniverseTaxonomy {
  return getCanonicalLifeUniverseTaxonomy()
}
```

- [ ] **Step 4: Run content tests and verify they pass**

Run:

```bash
npm test -- tests/lib/content.test.ts
```

Expected: PASS with taxonomy cloning and seven public galaxy slugs covered.

- [ ] **Step 5: Commit Task 3**

```bash
git add lib/content.ts tests/lib/content.test.ts
git commit -m "feat: expose life universe taxonomy"
```

## Task 4: Homepage Regression Without Visual UI Changes

**Files:**
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Add a homepage taxonomy regression test**

In `tests/components/home-page-view.test.tsx`, add these imports:

```ts
import { LIFE_UNIVERSE_GALAXIES } from "@/lib/life-universe/taxonomy"
```

Add this helper near `buildProps`:

```ts
function buildGalaxyPlanets(): HomePageViewProps["planets"] {
  return LIFE_UNIVERSE_GALAXIES.map((galaxy, index) => ({
    id: index + 1,
    slug: galaxy.slug,
    name: galaxy.name,
    summary: galaxy.summary,
    description: galaxy.description,
    x: galaxy.x,
    y: galaxy.y,
    size: galaxy.size,
    theme: galaxy.theme,
    status: "published",
    sortOrder: galaxy.sortOrder,
    weight: galaxy.weight,
  }))
}
```

Add this test inside `describe("HomePageView", () => { ... })`:

```ts
  it("renders the seven taxonomy galaxies without changing homepage controls", () => {
    render(<HomePageView {...buildProps({ planets: buildGalaxyPlanets() })} />)

    for (const galaxy of LIFE_UNIVERSE_GALAXIES) {
      expect(
        screen.getByRole("button", { name: `聚焦 ${galaxy.name}` })
      ).toBeInTheDocument()
    }

    expect(screen.getByRole("button", { name: "搜索空间" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "筛选空间" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "抓手模式" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "画布搜索" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "连接视图" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "展开 Null AI" })).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the homepage test and verify it passes**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: PASS. This task is a regression guard; it should not require changing homepage UI code.

- [ ] **Step 3: Commit Task 4**

```bash
git add tests/components/home-page-view.test.tsx
git commit -m "test: cover taxonomy galaxy homepage rendering"
```

## Task 5: Final Verification

**Files:**
- No file changes expected.

- [ ] **Step 1: Run focused verification**

Run:

```bash
npm test -- tests/lib/life-universe-taxonomy.test.ts tests/lib/cms-db.test.ts tests/lib/content.test.ts tests/components/home-page-view.test.tsx
```

Expected: PASS for all focused taxonomy, CMS, content, and homepage tests.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Check final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only files from this plan are modified relative to the branch tip, plus any unrelated pre-existing user changes that were already present before execution.

## Self-Review Notes

- Spec coverage: this plan covers the core taxonomy, seven top-level galaxies, content types, special areas, homepage meaning, and private 黑匣子 metadata. Search/filter UI, galaxy routes, and admin workflow changes are intentionally split into follow-up plans because they are separate subsystems.
- Red-flag scan: the plan uses exact file paths, test code, implementation snippets, commands, expected results, and commit messages.
- Type consistency: `LifeUniverseGalaxySlug`, `LifeUniverseContentTypeSlug`, `LifeUniverseSpecialAreaSlug`, and `LifeUniverseTaxonomy` are defined in Task 1 and reused by later tasks.
