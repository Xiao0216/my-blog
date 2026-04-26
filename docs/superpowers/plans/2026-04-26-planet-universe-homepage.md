# Planet Universe Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage card-first star map with a planet-first universe where planets move by default, hover/focus pauses motion and shows a preview card, and double-click/tap entry opens planet detail.

**Architecture:** Introduce a planet-specific view model and focused planet components, then adapt the existing homepage workbench to render planets instead of persistent cards. Keep the current overlay detail and digital twin integration, but feed them from planet-based models rather than content-card models.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind/CSS in `app/globals.css`, Vitest, Testing Library, existing CMS `StoredPlanet` data.

---

## File Structure

- Create `components/site/life-universe/planet-universe-model.ts`: pure helpers for planet view models, deterministic orbit values, content counts, and preview/detail models.
- Create `components/site/life-universe/planet-body.tsx`: one interactive planet body with hover, focus, double-click, and mobile tap hooks.
- Create `components/site/life-universe/planet-hover-preview.tsx`: pointer-adjacent preview card with bounded positioning and mobile entry action.
- Modify `components/site/life-universe/types.ts`: add planet universe model types while keeping shared existing types.
- Modify `components/site/life-universe/universe-canvas.tsx`: render orbit paths and `PlanetBody` nodes instead of persistent `UniverseCard` nodes on desktop and mobile.
- Modify `components/site/life-universe/life-universe-workbench.tsx`: replace card state with planet state, pause state, preview state, and planet detail construction.
- Modify `components/site/life-universe/planet-detail-overlay.tsx`: keep layout but accept planet-backed detail data from the new model.
- Modify `app/globals.css`: add planet body, orbit, paused, preview, LOD, and reduced-motion styles; remove reliance on default visible card nodes for homepage canvas.
- Modify `tests/components/home-page-view.test.tsx`: update behavior expectations from cards to planets.
- Modify `tests/components/universe-canvas.test.tsx`: update canvas rendering tests for planet hover/focus pause and callback stability.
- Add `tests/lib/planet-universe-model.test.ts`: pure model coverage for all public planets, orbit determinism, counts, and LOD classification.

---

### Task 1: Planet Universe Model

**Files:**
- Create: `components/site/life-universe/planet-universe-model.ts`
- Modify: `components/site/life-universe/types.ts`
- Test: `tests/lib/planet-universe-model.test.ts`

- [ ] **Step 1: Write the failing model tests**

Create `tests/lib/planet-universe-model.test.ts`:

```ts
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

    expect(model.planets.map((planet) => planet.slug)).toEqual(["work", "life"])
    expect(model.planets[0]).toMatchObject({
      id: "planet-1",
      name: "工作与职业",
      level: 0,
      tone: "cyan",
    })
    expect(model.planets[0].orbit.radius).toBeGreaterThan(150)
    expect(model.planets[0].orbit.durationSeconds).toBeGreaterThan(20)
    expect(model.planets[0].rotation.durationSeconds).toBeGreaterThan(10)
  })

  it("uses stable deterministic orbit values for identical input", () => {
    const first = buildPlanetUniverseModel({ memories, planets })
    const second = buildPlanetUniverseModel({ memories, planets })

    expect(second).toEqual(first)
  })

  it("counts only public memories in hover preview content", () => {
    const model = buildPlanetUniverseModel({ memories, planets })
    const preview = buildPlanetPreview(model.planets[0])

    expect(preview.title).toBe("工作与职业")
    expect(preview.summary).toBe("工作、项目和职业成长。")
    expect(preview.meta).toContain("1 条公开记忆")
    expect(preview.hint).toBe("双击进入行星")
  })

  it("downgrades distant or crowded planets to lightweight render levels", () => {
    expect(getPlanetRenderLevel({ distanceFromFocus: 900, isFocused: false, isHovered: false, totalPlanets: 42 })).toBe("point")
    expect(getPlanetRenderLevel({ distanceFromFocus: 420, isFocused: false, isHovered: false, totalPlanets: 18 })).toBe("simple")
    expect(getPlanetRenderLevel({ distanceFromFocus: 120, isFocused: false, isHovered: true, totalPlanets: 42 })).toBe("full")
  })
})
```

- [ ] **Step 2: Run the test and verify it fails for missing module**

Run:

```bash
npm test tests/lib/planet-universe-model.test.ts
```

Expected: FAIL with an import error for `planet-universe-model`.

- [ ] **Step 3: Add the model types**

Modify `components/site/life-universe/types.ts` by appending:

```ts
export type PlanetRenderLevel = "full" | "point" | "simple"

export type PlanetOrbitModel = {
  readonly delaySeconds: number
  readonly durationSeconds: number
  readonly radius: number
  readonly startAngle: number
}

export type PlanetRotationModel = {
  readonly durationSeconds: number
}

export type PlanetUniverseBodyModel = {
  readonly id: string
  readonly planetId: number
  readonly slug: string
  readonly name: string
  readonly summary: string
  readonly description: string
  readonly level: number
  readonly size: number
  readonly tone: UniverseCardTone
  readonly orbit: PlanetOrbitModel
  readonly rotation: PlanetRotationModel
  readonly publicMemoryCount: number
  readonly assistantMemoryCount: number
}

export type PlanetUniverseModel = {
  readonly planets: ReadonlyArray<PlanetUniverseBodyModel>
}

export type PlanetPreviewModel = {
  readonly hint: string
  readonly meta: string
  readonly summary: string
  readonly title: string
}
```

- [ ] **Step 4: Implement pure model helpers**

Create `components/site/life-universe/planet-universe-model.ts`:

```ts
import type {
  HomePageViewProps,
  PlanetPreviewModel,
  PlanetRenderLevel,
  PlanetUniverseBodyModel,
  PlanetUniverseModel,
  UniverseCardTone,
} from "@/components/site/life-universe/types"

const toneByTheme: Record<string, UniverseCardTone> = {
  blue: "blue",
  cyan: "cyan",
  emerald: "emerald",
  teal: "teal",
  violet: "violet",
}

const sizeByPlanetSize = {
  large: 86,
  medium: 68,
  small: 48,
} as const

export function buildPlanetUniverseModel({
  memories,
  planets,
}: Pick<HomePageViewProps, "memories" | "planets">): PlanetUniverseModel {
  return {
    planets: planets.map((planet, index): PlanetUniverseBodyModel => {
      const publicMemoryCount = memories.filter(
        (memory) => memory.planetId === planet.id && memory.visibility === "public"
      ).length
      const assistantMemoryCount = memories.filter(
        (memory) => memory.planetId === planet.id && memory.visibility === "assistant"
      ).length

      return {
        id: `planet-${planet.id}`,
        planetId: planet.id,
        slug: planet.slug,
        name: planet.name,
        summary: planet.summary,
        description: planet.description,
        level: 0,
        size: sizeByPlanetSize[planet.size],
        tone: toneByTheme[planet.theme] !== undefined ? toneByTheme[planet.theme] : "violet",
        orbit: {
          delaySeconds: -1 * (index * 3 + stableNumber(planet.slug, 7)),
          durationSeconds: 42 + Math.max(0, 10 - planet.weight) * 5 + index * 2,
          radius: 190 + index * 34 + Math.max(0, 10 - planet.weight) * 4,
          startAngle: stableNumber(planet.slug, 360),
        },
        rotation: {
          durationSeconds: 18 + stableNumber(`${planet.slug}-rotation`, 14),
        },
        publicMemoryCount,
        assistantMemoryCount,
      }
    }),
  }
}

export function buildPlanetPreview(planet: PlanetUniverseBodyModel): PlanetPreviewModel {
  return {
    title: planet.name,
    summary: planet.summary,
    meta: `${planet.publicMemoryCount} 条公开记忆 · ${planet.assistantMemoryCount} 条助手记忆`,
    hint: "双击进入行星",
  }
}

export function getPlanetRenderLevel({
  distanceFromFocus,
  isFocused,
  isHovered,
  totalPlanets,
}: {
  readonly distanceFromFocus: number
  readonly isFocused: boolean
  readonly isHovered: boolean
  readonly totalPlanets: number
}): PlanetRenderLevel {
  if (isFocused || isHovered || distanceFromFocus < 220) {
    return "full"
  }

  if (totalPlanets > 30 && distanceFromFocus > 760) {
    return "point"
  }

  return "simple"
}

function stableNumber(value: string, modulo: number) {
  let hash = 0

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % modulo
  }

  return hash
}
```

- [ ] **Step 5: Run the model test and verify it passes**

Run:

```bash
npm test tests/lib/planet-universe-model.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the model**

Run:

```bash
git add components/site/life-universe/types.ts components/site/life-universe/planet-universe-model.ts tests/lib/planet-universe-model.test.ts
git commit -m "feat: add planet universe model"
```

---

### Task 2: Planet Body And Hover Preview Components

**Files:**
- Create: `components/site/life-universe/planet-body.tsx`
- Create: `components/site/life-universe/planet-hover-preview.tsx`
- Test: `tests/components/planet-universe-components.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `tests/components/planet-universe-components.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { PlanetBody } from "@/components/site/life-universe/planet-body"
import { PlanetHoverPreview } from "@/components/site/life-universe/planet-hover-preview"
import type { PlanetUniverseBodyModel } from "@/components/site/life-universe/types"

const planet: PlanetUniverseBodyModel = {
  id: "planet-1",
  planetId: 1,
  slug: "work",
  name: "工作与职业",
  summary: "工作、项目和职业成长。",
  description: "完整描述",
  level: 0,
  size: 86,
  tone: "cyan",
  orbit: { delaySeconds: -2, durationSeconds: 44, radius: 220, startAngle: 40 },
  rotation: { durationSeconds: 24 },
  publicMemoryCount: 2,
  assistantMemoryCount: 1,
}

describe("planet universe components", () => {
  it("renders a focusable planet body and reports hover, leave, and entry", () => {
    const onHover = vi.fn()
    const onLeave = vi.fn()
    const onEnter = vi.fn()
    const onSelect = vi.fn()

    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={onEnter}
        onHover={onHover}
        onLeave={onLeave}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole("button", { name: "工作与职业 行星" })

    expect(button).toHaveAttribute("data-planet-id", "planet-1")
    fireEvent.pointerMove(button, { clientX: 120, clientY: 140 })
    expect(onHover).toHaveBeenCalledWith("planet-1", { x: 120, y: 140 })

    fireEvent.click(button)
    expect(onSelect).toHaveBeenCalledWith("planet-1", { x: 0, y: 0 })

    fireEvent.doubleClick(button)
    expect(onEnter).toHaveBeenCalledWith("planet-1")

    fireEvent.pointerLeave(button)
    expect(onLeave).toHaveBeenCalledWith("planet-1")
  })

  it("shows a bounded hover preview with an entry action", () => {
    const onEnter = vi.fn()

    render(
      <PlanetHoverPreview
        anchor={{ x: 900, y: 620 }}
        preview={{
          title: "工作与职业",
          summary: "工作、项目和职业成长。",
          meta: "2 条公开记忆 · 1 条助手记忆",
          hint: "双击进入行星",
        }}
        onEnter={onEnter}
      />
    )

    const preview = screen.getByRole("dialog", { name: "工作与职业 预览" })

    expect(preview).toHaveTextContent("工作、项目和职业成长。")
    expect(preview.getAttribute("style")).toContain("left:")
    fireEvent.click(screen.getByRole("button", { name: "进入 工作与职业" }))
    expect(onEnter).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the component test and verify it fails for missing modules**

Run:

```bash
npm test tests/components/planet-universe-components.test.tsx
```

Expected: FAIL with import errors for `planet-body` and `planet-hover-preview`.

- [ ] **Step 3: Implement `PlanetBody`**

Create `components/site/life-universe/planet-body.tsx`:

```tsx
"use client"

import type { CSSProperties, PointerEvent } from "react"

import type {
  PlanetRenderLevel,
  PlanetUniverseBodyModel,
} from "@/components/site/life-universe/types"

type PointerPoint = {
  readonly x: number
  readonly y: number
}

export function PlanetBody({
  planet,
  isFocused,
  isHovered,
  renderLevel,
  onEnter,
  onHover,
  onLeave,
  onSelect,
}: {
  readonly planet: PlanetUniverseBodyModel
  readonly isFocused: boolean
  readonly isHovered: boolean
  readonly renderLevel: PlanetRenderLevel
  readonly onEnter: (planetId: string) => void
  readonly onHover: (planetId: string, point: PointerPoint) => void
  readonly onLeave: (planetId: string) => void
  readonly onSelect: (planetId: string, point: PointerPoint) => void
}) {
  function pointFromEvent(event: PointerEvent<HTMLButtonElement>): PointerPoint {
    return {
      x: event.clientX,
      y: event.clientY,
    }
  }

  return (
    <button
      type="button"
      aria-label={`${planet.name} 行星`}
      data-focused={isFocused ? "true" : "false"}
      data-hovered={isHovered ? "true" : "false"}
      data-planet-id={planet.id}
      data-render-level={renderLevel}
      data-testid="planet-body"
      className="planet-body"
      onClick={(event) => onSelect(planet.id, pointFromEvent(event))}
      onDoubleClick={() => onEnter(planet.id)}
      onFocus={() => onHover(planet.id, { x: 0, y: 0 })}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          onEnter(planet.id)
        }
        if (event.key === " ") {
          event.preventDefault()
          onSelect(planet.id, { x: 0, y: 0 })
        }
      }}
      onPointerLeave={() => onLeave(planet.id)}
      onPointerMove={(event) => onHover(planet.id, pointFromEvent(event))}
      style={
        {
          "--planet-orbit-delay": `${planet.orbit.delaySeconds}s`,
          "--planet-orbit-duration": `${planet.orbit.durationSeconds}s`,
          "--planet-orbit-radius": `${planet.orbit.radius}px`,
          "--planet-rotation-duration": `${planet.rotation.durationSeconds}s`,
          "--planet-size": `${planet.size}px`,
          "--planet-start-angle": `${planet.orbit.startAngle}deg`,
        } as CSSProperties
      }
    >
      <span className={`planet-sphere planet-sphere-${planet.tone}`}>
        <span className="planet-shade" />
      </span>
    </button>
  )
}
```

- [ ] **Step 4: Implement `PlanetHoverPreview`**

Create `components/site/life-universe/planet-hover-preview.tsx`:

```tsx
"use client"

import type { CSSProperties } from "react"

import type { PlanetPreviewModel } from "@/components/site/life-universe/types"

const PREVIEW_WIDTH = 260
const PREVIEW_HEIGHT = 154
const OFFSET = 18
const EDGE_PADDING = 16

export function PlanetHoverPreview({
  anchor,
  preview,
  onEnter,
}: {
  readonly anchor: { readonly x: number; readonly y: number }
  readonly preview: PlanetPreviewModel
  readonly onEnter: () => void
}) {
  const left = clamp(anchor.x + OFFSET, EDGE_PADDING, viewportWidth() - PREVIEW_WIDTH - EDGE_PADDING)
  const top = clamp(anchor.y + OFFSET, EDGE_PADDING, viewportHeight() - PREVIEW_HEIGHT - EDGE_PADDING)

  return (
    <aside
      role="dialog"
      aria-label={`${preview.title} 预览`}
      className="planet-hover-preview"
      style={
        {
          left,
          top,
          width: PREVIEW_WIDTH,
        } as CSSProperties
      }
    >
      <p className="planet-hover-preview-meta">{preview.meta}</p>
      <h2>{preview.title}</h2>
      <p>{preview.summary}</p>
      <div className="planet-hover-preview-actions">
        <span>{preview.hint}</span>
        <button type="button" onClick={onEnter} aria-label={`进入 ${preview.title}`}>
          进入
        </button>
      </div>
    </aside>
  )
}

function viewportWidth() {
  return typeof window === "undefined" ? 1024 : window.innerWidth
}

function viewportHeight() {
  return typeof window === "undefined" ? 768 : window.innerHeight
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}
```

- [ ] **Step 5: Run the component test and verify it passes**

Run:

```bash
npm test tests/components/planet-universe-components.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the components**

Run:

```bash
git add components/site/life-universe/planet-body.tsx components/site/life-universe/planet-hover-preview.tsx tests/components/planet-universe-components.test.tsx
git commit -m "feat: add planet body preview components"
```

---

### Task 3: Replace Default Canvas Cards With Planets

**Files:**
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `tests/components/home-page-view.test.tsx`
- Modify: `tests/components/universe-canvas.test.tsx`

- [ ] **Step 1: Update homepage tests for planet-first default rendering**

In `tests/components/home-page-view.test.tsx`, replace the default card expectations with:

```tsx
it("renders planets as the default universe bodies instead of homepage cards", () => {
  render(<HomePageView {...buildProps({ planets: buildGalaxyPlanets() })} />)

  for (const galaxy of LIFE_UNIVERSE_GALAXIES) {
    expect(
      screen.getByRole("button", { name: `${galaxy.name} 行星` })
    ).toBeInTheDocument()
  }

  expect(screen.queryByRole("button", { name: "聚焦 构建你的数字花园" })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "聚焦 文章样例" })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "聚焦 项目样例" })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "聚焦 笔记样例" })).not.toBeInTheDocument()
})
```

Update the focus test to use planets:

```tsx
it("pauses the universe and shows a preview when a planet is hovered", () => {
  render(<HomePageView {...buildProps()} />)

  fireEvent.pointerMove(screen.getByRole("button", { name: "工作 行星" }), {
    clientX: 220,
    clientY: 260,
  })

  expect(screen.getByTestId("null-space-shell")).toHaveAttribute("data-motion-paused", "true")
  expect(screen.getByRole("dialog", { name: "工作 预览" })).toHaveTextContent("工作与交付")
})
```

- [ ] **Step 2: Run homepage tests and verify they fail against card-first UI**

Run:

```bash
npm test tests/components/home-page-view.test.tsx
```

Expected: FAIL because planet buttons and `data-motion-paused` do not exist yet.

- [ ] **Step 3: Update `UniverseCanvas` props and rendering**

Modify `components/site/life-universe/universe-canvas.tsx` to import and render planets:

```tsx
import { PlanetBody } from "@/components/site/life-universe/planet-body"
import { PlanetHoverPreview } from "@/components/site/life-universe/planet-hover-preview"
import { buildPlanetPreview, getPlanetRenderLevel } from "@/components/site/life-universe/planet-universe-model"
```

Change the props type to include:

```ts
readonly focusedPlanetId?: string
readonly hoveredPlanetId?: string
readonly hoverPoint?: { readonly x: number; readonly y: number }
readonly isMotionPaused: boolean
readonly planets: ReadonlyArray<PlanetUniverseBodyModel>
readonly onEnterPlanet: (planetId: string) => void
readonly onHoverPlanet: (planetId: string, point: { readonly x: number; readonly y: number }) => void
readonly onLeavePlanet: (planetId: string) => void
readonly onSelectPlanet: (planetId: string, point: { readonly x: number; readonly y: number }) => void
```

Inside the component, derive:

```ts
const hoveredPlanet = planets.find((planet) => planet.id === hoveredPlanetId)
```

Replace the `cards.map((card) => <UniverseCard ... />)` block with:

```tsx
<div className="planet-orbit-system" data-motion-paused={isMotionPaused ? "true" : "false"}>
  {planets.map((planet) => (
    <div
      key={`${planet.id}-orbit`}
      className="planet-orbit-path"
      style={
        {
          "--planet-orbit-radius": `${planet.orbit.radius}px`,
        } as CSSProperties
      }
    />
  ))}
  {planets.map((planet) => {
    const hoveredRadius = hoveredPlanet ? hoveredPlanet.orbit.radius : 0
    const distance = Math.abs(planet.orbit.radius - hoveredRadius)

    return (
      <PlanetBody
        key={planet.id}
        planet={planet}
        isFocused={planet.id === focusedPlanetId}
        isHovered={planet.id === hoveredPlanetId}
        renderLevel={getPlanetRenderLevel({
          distanceFromFocus: hoveredPlanet ? distance : planet.orbit.radius,
          isFocused: planet.id === focusedPlanetId,
          isHovered: planet.id === hoveredPlanetId,
          totalPlanets: planets.length,
        })}
        onEnter={onEnterPlanet}
        onHover={onHoverPlanet}
        onLeave={onLeavePlanet}
        onSelect={onSelectPlanet}
      />
    )
  })}
</div>
{hoveredPlanet && hoverPoint ? (
  <PlanetHoverPreview
    anchor={hoverPoint}
    preview={buildPlanetPreview(hoveredPlanet)}
    onEnter={() => onEnterPlanet(hoveredPlanet.id)}
  />
) : null}
```

Keep the empty state condition, but change it to use `planets.length === 0`.

- [ ] **Step 4: Update `LifeUniverseWorkbench` state**

In `components/site/life-universe/life-universe-workbench.tsx`, replace card model construction with:

```ts
const universe = useMemo(
  () => buildPlanetUniverseModel({ memories: props.memories, planets: props.planets }),
  [props.memories, props.planets]
)
const [focusedPlanetId, setFocusedPlanetId] = useState(universe.planets[0]?.id)
const [hoveredPlanetId, setHoveredPlanetId] = useState<string | undefined>(undefined)
const [hoverPoint, setHoverPoint] = useState<{ readonly x: number; readonly y: number } | undefined>(undefined)
const [enteredPlanetId, setEnteredPlanetId] = useState<string | undefined>(undefined)
const isMotionPaused = Boolean(hoveredPlanetId || enteredPlanetId)
```

Add handlers:

```ts
function hoverPlanet(planetId: string, point: { readonly x: number; readonly y: number }) {
  setHoveredPlanetId(planetId)
  setFocusedPlanetId(planetId)
  setHoverPoint(point)
}

function leavePlanet(planetId: string) {
  setHoveredPlanetId((current) => (current === planetId ? undefined : current))
  setHoverPoint(undefined)
}

function selectPlanet(planetId: string, point: { readonly x: number; readonly y: number }) {
  setFocusedPlanetId(planetId)
  setHoveredPlanetId(planetId)
  setHoverPoint(point)
}

function enterPlanet(planetId: string) {
  setFocusedPlanetId(planetId)
  setEnteredPlanetId(planetId)
  setViewState("inside")
}
```

Pass the new props into `UniverseCanvas`:

```tsx
<UniverseCanvas
  focusedPlanetId={focusedPlanetId}
  hoveredPlanetId={hoveredPlanetId}
  hoverPoint={hoverPoint}
  isMotionPaused={isMotionPaused}
  planets={universe.planets}
  detail={detail}
  enteredPlanetId={enteredPlanetId}
  zoom={zoom}
  pan={pan}
  hasPlanets={props.planets.length > 0}
  viewState={viewState}
  onEnterPlanet={enterPlanet}
  onHoverPlanet={hoverPlanet}
  onLeavePlanet={leavePlanet}
  onPanChange={setPan}
  onSelectPlanet={selectPlanet}
  onWheelZoom={zoomFromWheel}
/>
```

Set the shell attribute:

```tsx
data-motion-paused={isMotionPaused ? "true" : "false"}
```

- [ ] **Step 5: Run homepage and canvas tests**

Run:

```bash
npm test tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx tests/components/planet-universe-components.test.tsx tests/lib/planet-universe-model.test.ts
```

Expected: PASS after fixing TypeScript prop mismatches in the touched tests.

- [ ] **Step 6: Commit the canvas replacement**

Run:

```bash
git add components/site/life-universe/universe-canvas.tsx components/site/life-universe/life-universe-workbench.tsx tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx
git commit -m "feat: render homepage universe as planets"
```

---

### Task 4: Planet Detail Entry And Twin Context

**Files:**
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/life-universe/planet-detail-overlay.tsx`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Update detail tests for planet double-click**

In `tests/components/home-page-view.test.tsx`, replace the double-click test body with:

```tsx
it("enters a planet detail overlay on planet double click and returns to the universe", () => {
  render(<HomePageView {...buildProps()} />)

  fireEvent.doubleClick(screen.getByRole("button", { name: "工作 行星" }))

  const dialog = screen.getByRole("dialog", { name: "工作 行星详情" })

  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveAttribute("aria-modal", "true")
  expect(screen.getByText("概览")).toBeInTheDocument()
  expect(screen.getByText("关键记忆")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "返回宇宙" })).toHaveFocus()
  expect(screen.getByTestId("null-space-shell")).toHaveAttribute("data-view-state", "inside")

  fireEvent.click(screen.getByRole("button", { name: "返回宇宙" }))

  expect(screen.queryByRole("dialog", { name: "工作 行星详情" })).not.toBeInTheDocument()
  expect(screen.getByTestId("null-space-shell")).toHaveAttribute("data-view-state", "overview")
})
```

- [ ] **Step 2: Run the focused detail test and verify it fails if detail still depends on cards**

Run:

```bash
npm test tests/components/home-page-view.test.tsx -t "enters a planet detail overlay"
```

Expected: FAIL until `detail` is built from the entered planet.

- [ ] **Step 3: Build detail from planets**

In `components/site/life-universe/life-universe-workbench.tsx`, replace the old entered card detail lookup with:

```ts
const enteredPlanet = useMemo(
  () => universe.planets.find((planet) => planet.id === enteredPlanetId),
  [enteredPlanetId, universe.planets]
)
const focusedPlanet = useMemo(
  () => universe.planets.find((planet) => planet.id === focusedPlanetId),
  [focusedPlanetId, universe.planets]
)
const detail = useMemo(
  () => (enteredPlanet ? buildPlanetDetail(enteredPlanet, props) : undefined),
  [enteredPlanet, props]
)
```

Update the chat request context:

```ts
contextCard: focusedPlanet
  ? {
      category: "行星",
      id: focusedPlanet.id,
      planetId: focusedPlanet.planetId,
      title: focusedPlanet.name,
    }
  : undefined,
focusedPlanetId: focusedPlanet?.planetId,
```

Replace `buildPlanetDetail` with a version that accepts `PlanetUniverseBodyModel`:

```ts
function buildPlanetDetail(
  planet: PlanetUniverseBodyModel,
  { essays, memories, notes, projects }: HomePageViewProps
): PlanetDetailModel {
  const keyMemories = memories
    .filter((memory) => memory.visibility === "public" && memory.planetId === planet.planetId)
    .slice(0, 3)
    .map((memory) => memory.title)
  const relatedTitles = [...essays, ...projects, ...notes].map((item) => item.title).slice(0, 4)

  return {
    card: {
      id: planet.id,
      kind: "planet",
      group: planet.slug,
      importance: 1,
      width: planet.size,
      height: planet.size,
      x: 0,
      y: 0,
      ring: 1,
      angle: planet.orbit.startAngle,
      posture: { rotateX: 0, rotateY: 0, rotateZ: 0, translateZ: 0 },
      layoutStatus: "placed",
      category: "行星",
      title: planet.name,
      excerpt: planet.summary,
      date: "持续运转",
      tone: planet.tone,
      status: "mature",
      planetId: planet.planetId,
    },
    counts: {
      essays: essays.length,
      memories: memories.filter((memory) => memory.planetId === planet.planetId).length,
      notes: notes.length,
      projects: projects.length,
    },
    keyMemories: keyMemories.length > 0 ? keyMemories : ["最近还没有公开记忆，但这个行星已经可以承载你的行为记录。"],
    recentChanges: [`${planet.name} 正在形成更清晰的轨道。`, "新的内容会在这里沉淀成时间线。"],
    relatedTitles: relatedTitles.length > 0 ? relatedTitles : ["关联内容正在形成，下一次沉淀会先出现在这里。"],
  }
}
```

- [ ] **Step 4: Run detail and chat-context related tests**

Run:

```bash
npm test tests/components/home-page-view.test.tsx tests/app/twin-chat-route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit detail entry**

Run:

```bash
git add components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/planet-detail-overlay.tsx tests/components/home-page-view.test.tsx
git commit -m "feat: enter planet details from orbit bodies"
```

---

### Task 5: Styling, Motion Pause, LOD, And Reduced Motion

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Add tests for pause and render levels**

Add this test to `tests/components/home-page-view.test.tsx`:

```tsx
it("marks planet render levels and pauses animation while preview is active", () => {
  const crowdedPlanets = Array.from({ length: 36 }, (_, index) => ({
    ...buildGalaxyPlanets()[index % buildGalaxyPlanets().length],
    id: index + 1,
    slug: `planet-${index + 1}`,
    name: `行星 ${index + 1}`,
    sortOrder: index + 1,
  }))

  render(<HomePageView {...buildProps({ planets: crowdedPlanets })} />)

  expect(screen.getAllByTestId("planet-body").length).toBe(36)
  expect(screen.getAllByTestId("planet-body").some((planet) => planet.getAttribute("data-render-level") === "point")).toBe(true)

  fireEvent.pointerMove(screen.getByRole("button", { name: "行星 1 行星" }), {
    clientX: 180,
    clientY: 220,
  })

  expect(screen.getByTestId("null-space-shell")).toHaveAttribute("data-motion-paused", "true")
})
```

- [ ] **Step 2: Run the styling behavior test and verify it fails if LOD is not surfaced**

Run:

```bash
npm test tests/components/home-page-view.test.tsx -t "marks planet render levels"
```

Expected: FAIL until render levels are present for crowded planets.

- [ ] **Step 3: Add planet CSS**

Append to the life-universe section of `app/globals.css`:

```css
  .planet-orbit-system {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }

  .planet-orbit-path {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(var(--planet-orbit-radius) * 2);
    height: calc(var(--planet-orbit-radius) * 2);
    border: 1px solid color-mix(in srgb, var(--ns-link-line) 58%, transparent);
    border-radius: 9999px;
    transform: translate(-50%, -50%);
    opacity: 0.28;
    pointer-events: none;
  }

  .planet-body {
    position: absolute;
    left: 50%;
    top: 50%;
    display: grid;
    width: var(--planet-size);
    height: var(--planet-size);
    place-items: center;
    border: 0;
    border-radius: 9999px;
    background: transparent;
    outline: none;
    transform:
      rotate(var(--planet-start-angle))
      translateX(var(--planet-orbit-radius))
      rotate(calc(var(--planet-start-angle) * -1));
    animation: planet-orbit var(--planet-orbit-duration) linear infinite;
    animation-delay: var(--planet-orbit-delay);
    transform-origin: center;
  }

  .planet-sphere {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 9999px;
    box-shadow:
      inset -18px -14px 28px rgba(0, 0, 0, 0.32),
      0 0 34px color-mix(in srgb, var(--ns-accent-primary) 30%, transparent);
    animation: planet-self-rotate var(--planet-rotation-duration) linear infinite;
  }

  .planet-shade {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.68), transparent 0 16%, rgba(255, 255, 255, 0.12) 17% 28%, transparent 58%),
      linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  }

  .planet-sphere-cyan { background: linear-gradient(135deg, #67e8f9, #155e75); }
  .planet-sphere-blue { background: linear-gradient(135deg, #93c5fd, #1d4ed8); }
  .planet-sphere-emerald { background: linear-gradient(135deg, #86efac, #047857); }
  .planet-sphere-teal { background: linear-gradient(135deg, #5eead4, #0f766e); }
  .planet-sphere-violet { background: linear-gradient(135deg, #c4b5fd, #6d28d9); }
  .planet-sphere-neutral { background: linear-gradient(135deg, #e4e4e7, #52525b); }

  .planet-body[data-hovered="true"],
  .planet-body[data-focused="true"] {
    z-index: 80;
  }

  .planet-body[data-hovered="true"] .planet-sphere,
  .planet-body:focus-visible .planet-sphere {
    box-shadow:
      inset -18px -14px 28px rgba(0, 0, 0, 0.25),
      0 0 0 2px var(--ns-accent-primary),
      0 0 54px color-mix(in srgb, var(--ns-accent-primary) 62%, transparent);
  }

  .planet-body[data-render-level="point"] {
    width: 12px;
    height: 12px;
  }

  .planet-body[data-render-level="simple"] {
    width: calc(var(--planet-size) * 0.62);
    height: calc(var(--planet-size) * 0.62);
    opacity: 0.72;
  }

  .planet-hover-preview {
    pointer-events: auto;
    position: fixed;
    z-index: 160;
    border: 1px solid var(--ns-glass-border);
    border-radius: 0.9rem;
    background: var(--ns-glass-bg);
    box-shadow: var(--ns-glass-shadow);
    padding: 0.9rem;
    color: var(--ns-text-secondary);
    backdrop-filter: blur(22px) saturate(180%);
  }

  .planet-hover-preview h2 {
    margin-top: 0.35rem;
    color: var(--ns-text-primary);
    font-size: 0.98rem;
    font-weight: 700;
    line-height: 1.25rem;
  }

  .planet-hover-preview p {
    margin-top: 0.45rem;
    font-size: 0.72rem;
    line-height: 1.15rem;
  }

  .planet-hover-preview-meta {
    margin-top: 0;
    color: var(--ns-text-muted);
    font-family: var(--font-geist-mono);
    font-size: 0.62rem;
  }

  .planet-hover-preview-actions {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.66rem;
    color: var(--ns-text-muted);
  }

  .planet-hover-preview-actions button {
    border: 1px solid var(--ns-glass-border);
    border-radius: 0.65rem;
    background: var(--ns-control-bg);
    padding: 0.35rem 0.55rem;
    color: var(--ns-text-primary);
  }

  .null-space-shell[data-motion-paused="true"] .planet-body,
  .null-space-shell[data-motion-paused="true"] .planet-sphere {
    animation-play-state: paused;
  }

  @keyframes planet-orbit {
    to {
      transform:
        rotate(calc(var(--planet-start-angle) + 360deg))
        translateX(var(--planet-orbit-radius))
        rotate(calc((var(--planet-start-angle) + 360deg) * -1));
    }
  }

  @keyframes planet-self-rotate {
    to {
      background-position: 160% 0;
    }
  }
```

Inside the existing reduced-motion media query, add:

```css
  .planet-body,
  .planet-sphere {
    animation: none;
  }
```

- [ ] **Step 4: Run behavior tests, typecheck, and lint**

Run:

```bash
npm test tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx tests/components/planet-universe-components.test.tsx tests/lib/planet-universe-model.test.ts
npm run typecheck
npm run lint
```

Expected: all commands PASS.

- [ ] **Step 5: Commit styling and motion behavior**

Run:

```bash
git add app/globals.css tests/components/home-page-view.test.tsx
git commit -m "feat: style moving planet universe"
```

---

### Task 6: Final Verification And Cleanup

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run full unit test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run typecheck and lint**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Review final diff**

Run:

```bash
git status --short
git diff --stat HEAD
git diff HEAD -- components/site/life-universe app/globals.css tests/components tests/lib
```

Expected: only the planet-universe implementation, tests, and styles are changed.

- [ ] **Step 5: Commit verification fixes if any were required**

If Step 1, 2, or 3 required code changes, run:

```bash
git add components/site/life-universe app/globals.css tests/components tests/lib
git commit -m "fix: stabilize planet universe homepage"
```

Expected: commit is created only when verification produced additional implementation changes.

---

## Self-Review

- Spec coverage: The plan covers planet-first default rendering, hover/focus pause, pointer preview card, double-click entry, mobile tap entry through the preview button, LOD, reduced motion, all-public-planet representation, and removal of default article/project/note cards from the homepage canvas.
- Completion-marker scan: No unfinished instructions remain.
- Type consistency: `PlanetUniverseBodyModel`, `PlanetPreviewModel`, `PlanetRenderLevel`, and handler names are introduced before use and reused consistently across tasks.
