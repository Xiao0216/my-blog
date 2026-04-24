# Immersive Planet Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Null Space homepage into a full-canvas life universe with deterministic non-overlapping layout, CSS 3D cards, embedded AI avatar, and double-click planet entry.

**Architecture:** Keep `HomePageView` as the data boundary and evolve `LifeUniverseWorkbench` into a state coordinator for selected card, entered card, camera, and chat context. Move deterministic layout into a pure helper under `components/site/life-universe/`, keep visual behavior in focused components, and replace the fixed right-side `TwinConsole` with a floating `TwinOrb`. Use CSS transforms and custom properties for 3D and transitions instead of adding a heavy rendering or animation stack.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Tailwind CSS 4, CSS custom properties/transforms, lucide-react icons, Vitest, Testing Library, Docker Compose deployment.

---

## File Structure

- Create: `components/site/life-universe/universe-layout.ts`
  Deterministic ring layout, collision detection, viewport/camera helpers, and 3D posture derivation.
- Create: `components/site/life-universe/planet-detail-overlay.tsx`
  Center detail panel shown when a card is entered.
- Create: `components/site/life-universe/twin-orb.tsx`
  In-canvas digital twin avatar and expanded floating chat/search panel.
- Modify: `components/site/life-universe/types.ts`
  Add card kind, group, importance, layout rect, 3D posture, camera, and view-state types.
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
  Own selected card, entered card, view state, camera, twin panel state, and chat submission.
- Modify: `components/site/life-universe/universe-canvas.tsx`
  Render layout-driven cards, connection lines, camera layer, contextual action group, and detail overlay.
- Modify: `components/site/life-universe/universe-card.tsx`
  Render base 3D posture, single-click focus, double-click entry, and visible entry affordance.
- Modify: `components/site/life-universe/twin-console.tsx`
  Remove homepage usage after `TwinOrb` lands. Keep the file exported only if another module still imports it.
- Modify: `components/site/life-universe/universe-toolbar.tsx`
  Keep zoom/reset controls compatible with the new camera state.
- Modify: `app/globals.css`
  Add CSS for 3D scene perspective, entry transitions, detail panel, floating twin orb, reduced motion, and action group.
- Modify: `tests/components/home-page-view.test.tsx`
  Add behavior tests for focus, double-click entry, return, embedded twin, and fallback detail content.
- Create: `tests/lib/universe-layout.test.ts`
  Unit tests for layout determinism and non-overlap.

---

### Task 1: Pure Layout Engine

**Files:**
- Create: `components/site/life-universe/universe-layout.ts`
- Modify: `components/site/life-universe/types.ts`
- Create: `tests/lib/universe-layout.test.ts`

- [ ] **Step 1: Write failing layout tests**

Create `tests/lib/universe-layout.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- tests/lib/universe-layout.test.ts
```

Expected: fails because `components/site/life-universe/universe-layout.ts` and `UniverseLayoutInputCard` do not exist.

- [ ] **Step 3: Add layout types**

Add these exports to `components/site/life-universe/types.ts`:

```ts
export type UniverseCardKind =
  | "core"
  | "essay"
  | "memory"
  | "note"
  | "planet"
  | "project"

export type UniverseLayoutInputCard = {
  readonly id: string
  readonly kind: UniverseCardKind
  readonly group: string
  readonly importance: number
  readonly width: number
  readonly height: number
}

export type UniverseCardPosture = {
  readonly rotateX: number
  readonly rotateY: number
  readonly rotateZ: number
  readonly translateZ: number
}

export type UniverseViewport = {
  readonly centerX: number
  readonly centerY: number
  readonly width: number
  readonly height: number
}

export type PlacedUniverseCard = UniverseLayoutInputCard & {
  readonly x: number
  readonly y: number
  readonly ring: number
  readonly angle: number
  readonly posture: UniverseCardPosture
}
```

- [ ] **Step 4: Implement deterministic ring layout**

Create `components/site/life-universe/universe-layout.ts`:

```ts
import type {
  PlacedUniverseCard,
  UniverseLayoutInputCard,
  UniverseViewport,
} from "@/components/site/life-universe/types"

const SAFETY_MARGIN = 32
const RING_RADII = [0, 255, 410, 560] as const
const ANGLE_STEP = Math.PI / 18
const MAX_ATTEMPTS_PER_RING = 72

export function layoutUniverseCards(
  cards: ReadonlyArray<UniverseLayoutInputCard>,
  viewport: UniverseViewport
): ReadonlyArray<PlacedUniverseCard> {
  const sortedCards = [...cards].sort((a, b) => {
    if (b.importance !== a.importance) {
      return b.importance - a.importance
    }

    return a.id.localeCompare(b.id)
  })
  const placedCards: PlacedUniverseCard[] = []

  for (const card of sortedCards) {
    placedCards.push(placeCard(card, placedCards, viewport))
  }

  return sortByOriginalOrder(cards, placedCards)
}

export function cardsOverlap(
  first: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  second: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  margin = SAFETY_MARGIN
) {
  return !(
    first.x + first.width + margin <= second.x ||
    second.x + second.width + margin <= first.x ||
    first.y + first.height + margin <= second.y ||
    second.y + second.height + margin <= first.y
  )
}

function placeCard(
  card: UniverseLayoutInputCard,
  placedCards: ReadonlyArray<PlacedUniverseCard>,
  viewport: UniverseViewport
): PlacedUniverseCard {
  const preferredRing = getPreferredRing(card)
  const seedAngle = getSeedAngle(card.id)

  for (let ring = preferredRing; ring < RING_RADII.length; ring += 1) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_RING; attempt += 1) {
      const angle = seedAngle + attempt * ANGLE_STEP
      const candidate = createPlacedCard(card, viewport, ring, angle)

      if (!placedCards.some((placedCard) => cardsOverlap(candidate, placedCard))) {
        return candidate
      }
    }
  }

  const fallbackRing = RING_RADII.length - 1
  return createPlacedCard(
    card,
    viewport,
    fallbackRing,
    seedAngle + placedCards.length * ANGLE_STEP
  )
}

function createPlacedCard(
  card: UniverseLayoutInputCard,
  viewport: UniverseViewport,
  ring: number,
  angle: number
): PlacedUniverseCard {
  const radius = RING_RADII[ring]
  const rawX = viewport.centerX + Math.cos(angle) * radius - card.width / 2
  const rawY = viewport.centerY + Math.sin(angle) * radius - card.height / 2
  const x = clamp(rawX, SAFETY_MARGIN, viewport.width - card.width - SAFETY_MARGIN)
  const y = clamp(rawY, SAFETY_MARGIN, viewport.height - card.height - SAFETY_MARGIN)

  return {
    ...card,
    angle: round(angle),
    posture: derivePosture(x + card.width / 2, y + card.height / 2, ring, viewport),
    ring,
    x: round(x),
    y: round(y),
  }
}

function derivePosture(
  centerX: number,
  centerY: number,
  ring: number,
  viewport: UniverseViewport
) {
  if (ring === 0) {
    return {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateZ: 84,
    }
  }

  const dx = centerX - viewport.centerX
  const dy = centerY - viewport.centerY

  return {
    rotateX: round(clamp((-dy / viewport.height) * 24, -10, 10)),
    rotateY: round(clamp((dx / viewport.width) * -34, -18, 18)),
    rotateZ: round(clamp((dx / viewport.width) * 8, -5, 5)),
    translateZ: Math.max(12, 64 - ring * 14),
  }
}

function getPreferredRing(card: UniverseLayoutInputCard) {
  if (card.kind === "core") {
    return 0
  }

  if (card.kind === "planet") {
    return 1
  }

  if (card.kind === "essay" || card.kind === "project" || card.kind === "memory") {
    return 2
  }

  return 3
}

function getSeedAngle(id: string) {
  let hash = 0

  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360
  }

  return (hash / 360) * Math.PI * 2
}

function sortByOriginalOrder(
  sourceCards: ReadonlyArray<UniverseLayoutInputCard>,
  placedCards: ReadonlyArray<PlacedUniverseCard>
) {
  const order = new Map(sourceCards.map((card, index) => [card.id, index]))

  return [...placedCards].sort(
    (first, second) => (order.get(first.id) ?? 0) - (order.get(second.id) ?? 0)
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number) {
  return Number(value.toFixed(3))
}
```

- [ ] **Step 5: Run layout tests**

Run:

```bash
npm test -- tests/lib/universe-layout.test.ts
```

Expected: `3` tests pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add components/site/life-universe/types.ts components/site/life-universe/universe-layout.ts tests/lib/universe-layout.test.ts
git commit -m "feat: add deterministic universe layout"
```

---

### Task 2: Layout-Driven Cards

**Files:**
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/universe-card.tsx`
- Modify: `components/site/life-universe/types.ts`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing component test for non-overlap metadata**

Add this test to `tests/components/home-page-view.test.tsx`:

```tsx
it("renders layout-driven cards without overlap metadata collisions", () => {
  render(<HomePageView {...buildProps()} />)

  const cards = screen.getAllByTestId("universe-card")

  expect(cards.length).toBeGreaterThan(3)
  expect(cards.every((card) => card.getAttribute("data-ring"))).toBe(true)
  expect(cards.every((card) => card.getAttribute("data-layout-x"))).toBe(true)
  expect(cards.every((card) => card.getAttribute("data-layout-y"))).toBe(true)
})
```

- [ ] **Step 2: Run focused test and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: the new test fails because `data-testid="universe-card"` and layout metadata do not exist on cards.

- [ ] **Step 3: Extend card model**

Update `UniverseCardModel` in `components/site/life-universe/types.ts` so it includes layout input fields and placed output fields:

```ts
export type UniverseCardModel = PlacedUniverseCard & {
  readonly category: string
  readonly date: string
  readonly excerpt: string
  readonly featured?: boolean
  readonly planetId?: number
  readonly status: UniverseCardStatus
  readonly title: string
  readonly tone: UniverseCardTone
}
```

- [ ] **Step 4: Replace manual slots with layout helper**

In `components/site/life-universe/life-universe-workbench.tsx`, remove `planetSlots` and `noteSlots`. Keep `buildUniverseCards`, but make it build unplaced cards first and pass them to `layoutUniverseCards`:

```ts
const UNIVERSE_VIEWPORT = {
  centerX: 480,
  centerY: 330,
  height: 660,
  width: 960,
} as const
```

Use these fixed sizes:

```ts
const CARD_SIZE = {
  core: { width: 286, height: 190 },
  planet: { width: 184, height: 142 },
  feature: { width: 168, height: 138 },
  note: { width: 164, height: 124 },
} as const
```

After creating cards without `x`, `y`, `ring`, `angle`, or `posture`, merge the returned placed data by id:

```ts
const placedCards = layoutUniverseCards(
  baseCards.map(({ group, height, id, importance, kind, width }) => ({
    group,
    height,
    id,
    importance,
    kind,
    width,
  })),
  UNIVERSE_VIEWPORT
)
const placementById = new Map(placedCards.map((card) => [card.id, card]))

return baseCards.map((card) => {
  const placement = placementById.get(card.id)

  if (!placement) {
    throw new Error(`Missing universe placement for ${card.id}`)
  }

  return {
    ...card,
    ...placement,
  }
})
```

- [ ] **Step 5: Render layout metadata on cards**

Update the root `<button>` in `UniverseCard`:

```tsx
data-testid="universe-card"
data-kind={card.kind}
data-layout-x={card.x}
data-layout-y={card.y}
data-ring={card.ring}
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx tests/lib/universe-layout.test.ts
```

Expected: layout tests and homepage layout metadata test pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/universe-canvas.tsx components/site/life-universe/universe-card.tsx components/site/life-universe/types.ts tests/components/home-page-view.test.tsx
git commit -m "feat: render layout-driven universe cards"
```

---

### Task 3: CSS 3D Card Posture And Focus Actions

**Files:**
- Modify: `components/site/life-universe/universe-card.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing test for 3D posture and action group**

Add this test:

```tsx
it("shows persistent 3D posture and focus actions for the selected card", () => {
  render(<HomePageView {...buildProps()} />)

  const workCard = screen.getByRole("button", { name: "聚焦 Work" })

  expect(workCard.getAttribute("style")).toContain("--card-rotate-x")
  expect(workCard.getAttribute("style")).toContain("--card-rotate-y")
  expect(workCard.getAttribute("style")).toContain("--card-depth")

  fireEvent.click(workCard)

  expect(screen.getByRole("button", { name: "进入 Work" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "询问 Work" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "查看 Work 关联" })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused test and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: fails because the card does not expose persistent base 3D variables and focus actions are not rendered.

- [ ] **Step 3: Update `UniverseCard` transform variables**

Set these style values on the root button:

```tsx
"--card-rotate-x": `${card.posture.rotateX}deg`,
"--card-rotate-y": `${card.posture.rotateY}deg`,
"--card-rotate-z": `${card.posture.rotateZ}deg`,
"--card-depth": `${card.posture.translateZ}px`,
"--hover-tilt-x": `${tilt.x}deg`,
"--hover-tilt-y": `${tilt.y}deg`,
```

Use this transform string:

```tsx
transform:
  "perspective(1100px) translateZ(var(--card-depth)) rotateX(calc(var(--card-rotate-x) + var(--hover-tilt-x))) rotateY(calc(var(--card-rotate-y) + var(--hover-tilt-y))) rotateZ(var(--card-rotate-z)) scale(var(--selected-scale))"
```

- [ ] **Step 4: Add focus action group**

In `UniverseCanvas`, render an action group when `selectedCardId` matches a card:

```tsx
<div
  className="planet-action-group"
  style={{
    left: selectedCard.x + selectedCard.width + 14,
    top: selectedCard.y + 8,
  }}
>
  <button type="button" aria-label={`进入 ${selectedCard.title}`} onClick={() => onEnterCard(selectedCard.id)}>
    进入
  </button>
  <button type="button" aria-label={`询问 ${selectedCard.title}`} onClick={() => onAskTwin(selectedCard.id)}>
    问 AI
  </button>
  <button type="button" aria-label={`查看 ${selectedCard.title} 关联`} onClick={() => onShowRelated(selectedCard.id)}>
    关联
  </button>
</div>
```

Add props to `UniverseCanvas`:

```ts
readonly onAskTwin: (cardId: string) => void
readonly onEnterCard: (cardId: string) => void
readonly onShowRelated: (cardId: string) => void
```

In `LifeUniverseWorkbench`, wire them to existing state first:

```ts
function askTwinAboutCard(cardId: string) {
  setSelectedCardId(cardId)
}

function showRelatedCard(cardId: string) {
  setSelectedCardId(cardId)
}
```

`enterCard` is implemented in Task 4.

- [ ] **Step 5: Add CSS for 3D scene and action group**

Add to `app/globals.css`:

```css
.universe-scene-3d {
  perspective: 1200px;
  transform-style: preserve-3d;
}

.planet-action-group {
  position: absolute;
  z-index: 130;
  display: inline-flex;
  gap: 0.35rem;
  border: 1px solid var(--ns-glass-border);
  border-radius: 9999px;
  background: var(--ns-glass-bg);
  box-shadow: var(--ns-glass-shadow);
  padding: 0.35rem;
  backdrop-filter: blur(20px) saturate(180%);
}

.planet-action-group button {
  border-radius: 9999px;
  padding: 0.4rem 0.65rem;
  color: var(--ns-text-secondary);
  font-size: 0.68rem;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.planet-action-group button:hover {
  background: var(--ns-control-bg);
  color: var(--ns-text-primary);
  transform: translateY(-1px);
}
```

Add `universe-scene-3d` to the card viewport layer in `UniverseCanvas`.

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: 3D posture and focus action test passes.

- [ ] **Step 7: Commit**

Run:

```bash
git add app/globals.css components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/universe-card.tsx components/site/life-universe/universe-canvas.tsx tests/components/home-page-view.test.tsx
git commit -m "feat: add 3d card posture and focus actions"
```

---

### Task 4: Planet Entry State And Detail Overlay

**Files:**
- Create: `components/site/life-universe/planet-detail-overlay.tsx`
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/universe-card.tsx`
- Modify: `components/site/life-universe/types.ts`
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing tests for double-click entry and return**

Add tests:

```tsx
it("enters a planet detail overlay on double click and returns to the universe", () => {
  render(<HomePageView {...buildProps()} />)

  fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Work" }))

  expect(
    screen.getByRole("dialog", { name: "Work 行星详情" })
  ).toBeInTheDocument()
  expect(screen.getByText("概览")).toBeInTheDocument()
  expect(screen.getByText("最近变化")).toBeInTheDocument()
  expect(screen.getByText("关键记忆")).toBeInTheDocument()
  expect(screen.getByText("关联内容")).toBeInTheDocument()
  expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
    "data-view-state",
    "inside"
  )

  fireEvent.click(screen.getByRole("button", { name: "返回宇宙" }))

  expect(
    screen.queryByRole("dialog", { name: "Work 行星详情" })
  ).not.toBeInTheDocument()
  expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
    "data-view-state",
    "overview"
  )
})

it("renders polished fallback detail content when public memory data is empty", () => {
  render(
    <HomePageView
      {...buildProps({
        memories: [],
      })}
    />
  )

  fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Work" }))

  expect(
    screen.getByText("最近还没有公开记忆，但这个行星已经可以承载你的行为记录。")
  ).toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: fails because the detail dialog and `data-view-state` do not exist.

- [ ] **Step 3: Add view-state types**

Add to `types.ts`:

```ts
export type UniverseViewState = "entering" | "focused" | "inside" | "leaving" | "overview"

export type PlanetDetailModel = {
  readonly card: UniverseCardModel
  readonly counts: {
    readonly essays: number
    readonly memories: number
    readonly notes: number
    readonly projects: number
  }
  readonly keyMemories: ReadonlyArray<string>
  readonly recentChanges: ReadonlyArray<string>
  readonly relatedTitles: ReadonlyArray<string>
}
```

- [ ] **Step 4: Implement entry state in `LifeUniverseWorkbench`**

Add state:

```ts
const [viewState, setViewState] = useState<UniverseViewState>("overview")
const [enteredCardId, setEnteredCardId] = useState<string | undefined>()
```

Add handlers:

```ts
function enterCard(cardId: string) {
  setSelectedCardId(cardId)
  setEnteredCardId(cardId)
  setViewState("inside")
}

function leaveCard() {
  setEnteredCardId(undefined)
  setViewState("overview")
}
```

Pass `viewState`, `enteredCardId`, `onEnterCard={enterCard}`, and `onLeaveCard={leaveCard}` to `UniverseCanvas`.

Set on the shell:

```tsx
data-view-state={viewState}
```

- [ ] **Step 5: Wire double-click**

In `UniverseCard`, add:

```tsx
onDoubleClick={onEnter}
```

Add prop:

```ts
readonly onEnter: () => void
```

Pass `onEnter={() => onEnterCard(card.id)}` from `UniverseCanvas`.

- [ ] **Step 6: Create `PlanetDetailOverlay`**

Create `components/site/life-universe/planet-detail-overlay.tsx`:

```tsx
import { ArrowLeft, ExternalLink, Link2, MessageCircle } from "lucide-react"

import type { PlanetDetailModel } from "@/components/site/life-universe/types"

export function PlanetDetailOverlay({
  detail,
  onAskTwin,
  onLeave,
}: {
  readonly detail: PlanetDetailModel
  readonly onAskTwin: () => void
  readonly onLeave: () => void
}) {
  return (
    <section
      role="dialog"
      aria-label={`${detail.card.title} 行星详情`}
      className="planet-detail-overlay"
    >
      <header className="planet-detail-header">
        <button type="button" aria-label="返回宇宙" onClick={onLeave}>
          <ArrowLeft className="h-4 w-4" />
          <span>返回宇宙</span>
        </button>
        <div>
          <p>{detail.card.category}</p>
          <h2>{detail.card.title}</h2>
        </div>
        <span>{detail.card.status}</span>
      </header>

      <div className="planet-detail-counts">
        <span>{detail.counts.memories} 记忆</span>
        <span>{detail.counts.essays} 文章</span>
        <span>{detail.counts.notes} 笔记</span>
        <span>{detail.counts.projects} 项目</span>
      </div>

      <div className="planet-detail-grid">
        <DetailSection title="概览" items={[detail.card.excerpt]} />
        <DetailSection title="最近变化" items={detail.recentChanges} />
        <DetailSection title="关键记忆" items={detail.keyMemories} />
        <DetailSection title="关联内容" items={detail.relatedTitles} />
      </div>

      <footer className="planet-detail-actions">
        <button type="button" onClick={onAskTwin}>
          <MessageCircle className="h-4 w-4" />
          <span>问 AI</span>
        </button>
        <button type="button">
          <Link2 className="h-4 w-4" />
          <span>只看关联</span>
        </button>
        <button type="button" disabled title="这个行星暂时没有独立详情页">
          <ExternalLink className="h-4 w-4" />
          <span>打开完整页</span>
        </button>
      </footer>
    </section>
  )
}

function DetailSection({
  items,
  title,
}: {
  readonly items: ReadonlyArray<string>
  readonly title: string
}) {
  return (
    <article>
      <h3>{title}</h3>
      <div>
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </article>
  )
}
```

- [ ] **Step 7: Build detail model**

In `LifeUniverseWorkbench`, derive:

```ts
const enteredCard = cards.find((card) => card.id === enteredCardId)
const detail = enteredCard
  ? buildPlanetDetail(enteredCard, props)
  : undefined
```

Add helper:

```ts
function buildPlanetDetail(
  card: UniverseCardModel,
  props: HomePageViewProps
): PlanetDetailModel {
  const publicMemoryTitles = props.memories
    .filter((memory) => memory.visibility === "public")
    .slice(0, 3)
    .map((memory) => memory.title)

  return {
    card,
    counts: {
      essays: props.essays.length,
      memories: props.memories.length,
      notes: props.notes.length,
      projects: props.projects.length,
    },
    keyMemories:
      publicMemoryTitles.length > 0
        ? publicMemoryTitles
        : ["最近还没有公开记忆，但这个行星已经可以承载你的行为记录。"],
    recentChanges: [
      `${card.title} 正在形成更清晰的结构。`,
      "新的内容会在这里沉淀成时间线。",
    ],
    relatedTitles: [
      ...props.essays.slice(0, 2).map((essay) => essay.title),
      ...props.projects.slice(0, 2).map((project) => project.title),
      ...props.notes.slice(0, 2).map((note) => note.title),
    ].slice(0, 4),
  }
}
```

- [ ] **Step 8: Render overlay**

In `UniverseCanvas`, render:

```tsx
{detail ? (
  <PlanetDetailOverlay
    detail={detail}
    onAskTwin={() => onAskTwin(detail.card.id)}
    onLeave={onLeaveCard}
  />
) : null}
```

Add props:

```ts
readonly detail?: PlanetDetailModel
readonly onLeaveCard: () => void
readonly viewState: UniverseViewState
```

- [ ] **Step 9: Add CSS for inside state and detail overlay**

Add to `app/globals.css`:

```css
.null-space-shell[data-view-state="inside"] .null-space-card:not([data-entered="true"]) {
  opacity: 0;
  filter: blur(8px);
  pointer-events: none;
  scale: 0.82;
}

.planet-detail-overlay {
  position: absolute;
  inset: 7% 8%;
  z-index: 150;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 1rem;
  border: 1px solid var(--ns-glass-border);
  border-radius: 1.5rem;
  background: var(--ns-glass-bg);
  box-shadow: var(--ns-glass-shadow);
  padding: 1.25rem;
  backdrop-filter: blur(26px) saturate(180%);
  animation: planet-detail-enter 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.planet-detail-header,
.planet-detail-actions,
.planet-detail-counts {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.planet-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.planet-detail-grid article {
  border: 1px solid var(--ns-glass-border);
  border-radius: 1rem;
  background: var(--ns-control-bg);
  padding: 1rem;
}

@keyframes planet-detail-enter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

- [ ] **Step 10: Run focused tests**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: double-click entry, return, and fallback detail tests pass.

- [ ] **Step 11: Commit**

Run:

```bash
git add app/globals.css components/site/life-universe/planet-detail-overlay.tsx components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/universe-canvas.tsx components/site/life-universe/universe-card.tsx components/site/life-universe/types.ts tests/components/home-page-view.test.tsx
git commit -m "feat: add immersive planet detail entry"
```

---

### Task 5: Embedded Twin Orb

**Files:**
- Create: `components/site/life-universe/twin-orb.tsx`
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/twin-console.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing tests for floating AI avatar**

Update the existing structure test so it no longer expects the fixed complementary panel:

```tsx
expect(
  screen.queryByRole("complementary", { name: "Null AI digital twin" })
).not.toBeInTheDocument()
expect(screen.getByRole("button", { name: "展开 Null AI" })).toBeInTheDocument()
```

Add a new test:

```tsx
it("expands the embedded twin orb and sends chat in the selected card context", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      answer: "Contextual AI reply",
      mode: "fallback",
      references: [],
    }),
  })
  vi.stubGlobal("fetch", fetchMock)
  render(<HomePageView {...buildProps()} />)

  fireEvent.click(screen.getByRole("button", { name: "聚焦 Work" }))
  fireEvent.click(screen.getByRole("button", { name: "展开 Null AI" }))

  expect(screen.getByRole("dialog", { name: "Null AI 对话" })).toHaveTextContent(
    "当前上下文：Work"
  )

  fireEvent.change(screen.getByPlaceholderText("搜索或和 Null AI 聊聊..."), {
    target: { value: "总结这个行星" },
  })
  fireEvent.click(screen.getByRole("button", { name: "发送给 Null AI" }))

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/twin/chat",
      expect.objectContaining({
        body: expect.stringContaining("总结这个行星"),
      })
    )
  })
  expect(await screen.findByText("Contextual AI reply")).toBeInTheDocument()

  fireEvent.click(screen.getByRole("button", { name: "收起 Null AI" }))
  expect(screen.queryByRole("dialog", { name: "Null AI 对话" })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: fails because the fixed `TwinConsole` still renders and `TwinOrb` does not exist.

- [ ] **Step 3: Create `TwinOrb`**

Create `components/site/life-universe/twin-orb.tsx`:

```tsx
"use client"

import { MessageCircle, Send, X } from "lucide-react"
import type { FormEvent } from "react"

import type { ChatMessage, UniverseCardModel } from "@/components/site/life-universe/types"
import type { StoredTwinIdentity } from "@/lib/content"

export function TwinOrb({
  contextCard,
  draftMessage,
  identity,
  isExpanded,
  isSending,
  messages,
  onDraftChange,
  onSubmit,
  onToggle,
}: {
  readonly contextCard?: UniverseCardModel
  readonly draftMessage: string
  readonly identity: StoredTwinIdentity
  readonly isExpanded: boolean
  readonly isSending: boolean
  readonly messages: ReadonlyArray<ChatMessage>
  readonly onDraftChange: (value: string) => void
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void
  readonly onToggle: () => void
}) {
  return (
    <div className="twin-orb-shell" data-expanded={isExpanded ? "true" : "false"}>
      {isExpanded ? (
        <section role="dialog" aria-label="Null AI 对话" className="twin-orb-panel">
          <header>
            <div>
              <h2>{identity.displayName || "Null AI"}</h2>
              <p>当前上下文：{contextCard?.title ?? "全局星图"}</p>
            </div>
            <button type="button" aria-label="收起 Null AI" onClick={onToggle}>
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="twin-orb-messages">
            {messages.map((message) => (
              <article key={message.id} data-role={message.role}>
                <p>{message.content}</p>
              </article>
            ))}
            {isSending ? <p>思考中</p> : null}
          </div>

          <form onSubmit={onSubmit}>
            <textarea
              value={draftMessage}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="搜索或和 Null AI 聊聊..."
              rows={1}
            />
            <button type="submit" aria-label="发送给 Null AI" disabled={isSending}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : (
        <button type="button" aria-label="展开 Null AI" className="twin-orb-avatar" onClick={onToggle}>
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Replace `TwinConsole` in homepage**

In `LifeUniverseWorkbench`, add:

```ts
const [isTwinExpanded, setIsTwinExpanded] = useState(false)
```

Replace `<TwinConsole ... />` with:

```tsx
<TwinOrb
  contextCard={selectedCard}
  draftMessage={draftMessage}
  identity={props.twinIdentity}
  isExpanded={isTwinExpanded}
  isSending={isSending}
  messages={messages}
  onDraftChange={setDraftMessage}
  onSubmit={submitMessage}
  onToggle={() => setIsTwinExpanded((current) => !current)}
/>
```

Remove the homepage import for `TwinConsole`. Keep the `TwinConsole` file only if it is still referenced elsewhere.

- [ ] **Step 5: Include selected context in chat body**

Change the chat body in `submitMessage`:

```ts
body: JSON.stringify({
  contextCard: selectedCard
    ? {
        category: selectedCard.category,
        id: selectedCard.id,
        title: selectedCard.title,
      }
    : undefined,
  history,
  message,
}),
```

The current `/api/twin/chat` route ignores unknown fields, so this preserves compatibility while documenting frontend context.

- [ ] **Step 6: Add Twin Orb CSS**

Add to `app/globals.css`:

```css
.twin-orb-shell {
  position: absolute;
  right: clamp(1rem, 4vw, 3rem);
  bottom: clamp(5rem, 11vh, 7rem);
  z-index: 170;
}

.twin-orb-avatar {
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  place-items: center;
  border: 1px solid var(--ns-glass-border);
  border-radius: 9999px;
  background: var(--ns-accent-gradient);
  color: white;
  box-shadow: 0 0 44px var(--ns-particle-glow);
  animation: twin-orb-breathe 3.8s ease-in-out infinite;
}

.twin-orb-panel {
  width: min(24rem, calc(100vw - 2rem));
  border: 1px solid var(--ns-glass-border);
  border-radius: 1.25rem;
  background: var(--ns-glass-bg);
  box-shadow: var(--ns-glass-shadow);
  padding: 1rem;
  backdrop-filter: blur(24px) saturate(180%);
  animation: twin-panel-enter 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.twin-orb-panel header,
.twin-orb-panel form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.twin-orb-messages {
  max-height: 16rem;
  overflow: auto;
  padding: 0.9rem 0;
}

.twin-orb-panel textarea {
  min-height: 2.75rem;
  flex: 1;
  resize: none;
  border: 1px solid var(--ns-glass-border);
  border-radius: 1rem;
  background: var(--ns-input-bg);
  padding: 0.75rem 0.9rem;
  color: var(--ns-text-primary);
  outline: none;
}

@keyframes twin-orb-breathe {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.04);
  }
}

@keyframes twin-panel-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: embedded twin avatar test passes, existing chat test is updated to use the expanded orb.

- [ ] **Step 8: Commit**

Run:

```bash
git add app/globals.css components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/twin-orb.tsx components/site/life-universe/twin-console.tsx tests/components/home-page-view.test.tsx
git commit -m "feat: embed twin chat inside universe canvas"
```

---

### Task 6: Camera, Transition Polish, And Keyboard Escape

**Files:**
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/universe-toolbar.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing tests for camera and Escape behavior**

Add:

```tsx
it("moves the camera during planet entry and restores it on return", () => {
  render(<HomePageView {...buildProps()} />)

  const viewport = screen.getByTestId("universe-viewport")
  expect(viewport).toHaveAttribute("data-camera-mode", "overview")

  fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Work" }))

  expect(viewport).toHaveAttribute("data-camera-mode", "inside")

  fireEvent.click(screen.getByRole("button", { name: "返回宇宙" }))

  expect(viewport).toHaveAttribute("data-camera-mode", "overview")
})

it("uses Escape to collapse Null AI before leaving planet detail", () => {
  render(<HomePageView {...buildProps()} />)

  fireEvent.click(screen.getByRole("button", { name: "展开 Null AI" }))
  fireEvent.keyDown(window, { key: "Escape" })

  expect(screen.queryByRole("dialog", { name: "Null AI 对话" })).not.toBeInTheDocument()

  fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Work" }))
  fireEvent.keyDown(window, { key: "Escape" })

  expect(
    screen.queryByRole("dialog", { name: "Work 行星详情" })
  ).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: fails because `data-camera-mode` and Escape handling do not exist.

- [ ] **Step 3: Add camera mode attributes**

In `UniverseCanvas`, add to the viewport layer:

```tsx
data-camera-mode={viewState === "inside" ? "inside" : "overview"}
```

When `detail` exists, compute the viewport transform from the entered card:

```ts
const cameraTransform = detail
  ? `translate(calc(-50% + ${480 - detail.card.x - detail.card.width / 2}px), calc(-50% + ${330 - detail.card.y - detail.card.height / 2}px)) scale(1.28)`
  : `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom / 78})`
```

Use `cameraTransform` in the viewport style.

- [ ] **Step 4: Add Escape handler**

In `LifeUniverseWorkbench`, import `useEffect` and add:

```ts
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") {
      return
    }

    if (isTwinExpanded) {
      setIsTwinExpanded(false)
      return
    }

    if (viewState === "inside") {
      leaveCard()
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [isTwinExpanded, viewState])
```

- [ ] **Step 5: Add transition CSS**

Add:

```css
.null-space-shell[data-view-state="inside"] .planet-action-group {
  opacity: 0;
  pointer-events: none;
}

[data-testid="universe-viewport"] {
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  [data-testid="universe-viewport"],
  .planet-detail-overlay,
  .twin-orb-avatar,
  .twin-orb-panel {
    animation: none;
    transition: none;
  }
}
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: camera and Escape tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add app/globals.css components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/universe-canvas.tsx components/site/life-universe/universe-toolbar.tsx tests/components/home-page-view.test.tsx
git commit -m "feat: polish planet entry camera transitions"
```

---

### Task 7: Render Performance Guardrails

**Files:**
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/universe-card.tsx`
- Modify: `components/site/life-universe/twin-orb.tsx`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing smoke test for chat typing isolation**

Add:

```tsx
it("keeps card layout stable while typing in the twin panel", () => {
  render(<HomePageView {...buildProps()} />)

  const before = screen
    .getAllByTestId("universe-card")
    .map((card) => `${card.getAttribute("data-layout-x")}:${card.getAttribute("data-layout-y")}`)

  fireEvent.click(screen.getByRole("button", { name: "展开 Null AI" }))
  fireEvent.change(screen.getByPlaceholderText("搜索或和 Null AI 聊聊..."), {
    target: { value: "typing should not move cards" },
  })

  const after = screen
    .getAllByTestId("universe-card")
    .map((card) => `${card.getAttribute("data-layout-x")}:${card.getAttribute("data-layout-y")}`)

  expect(after).toEqual(before)
})
```

- [ ] **Step 2: Run focused test**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected before optimization: this may already pass. If it passes, keep it as a regression test and continue.

- [ ] **Step 3: Memoize expensive derived values**

In `LifeUniverseWorkbench`, ensure:

```ts
const cards = useMemo(() => buildUniverseCards(props), [props])
const selectedCard = useMemo(
  () => cards.find((card) => card.id === selectedCardId) ?? cards[0],
  [cards, selectedCardId]
)
const detail = useMemo(
  () => (enteredCard ? buildPlanetDetail(enteredCard, props) : undefined),
  [enteredCard, props]
)
```

- [ ] **Step 4: Memoize card rendering**

Wrap `UniverseCard` export:

```ts
export const UniverseCard = memo(function UniverseCard({
  card,
  isEntered,
  isSelected,
  onEnter,
  onSelect,
}: UniverseCardProps) {
  // existing component body
})
```

Define `UniverseCardProps` above the component.

- [ ] **Step 5: Throttle drag and wheel updates**

In `UniverseCanvas`, add:

```ts
const frameRef = useRef<number | undefined>(undefined)

function schedulePan(nextPan: CanvasPan) {
  if (frameRef.current) {
    cancelAnimationFrame(frameRef.current)
  }

  frameRef.current = requestAnimationFrame(() => {
    onPanChange(nextPan)
    frameRef.current = undefined
  })
}
```

Use `schedulePan` inside `handleMouseMove`. Add cleanup:

```ts
useEffect(() => {
  return () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }
  }
}, [])
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx tests/lib/universe-layout.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add components/site/life-universe/life-universe-workbench.tsx components/site/life-universe/universe-canvas.tsx components/site/life-universe/universe-card.tsx components/site/life-universe/twin-orb.tsx tests/components/home-page-view.test.tsx
git commit -m "perf: stabilize universe interactions"
```

---

### Task 8: Full Verification And Docker Deployment

**Files:**
- No source edits unless verification exposes a specific defect.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: exits `0`.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exits `0`.

- [ ] **Step 3: Run full tests**

Run:

```bash
npm test
```

Expected: all test files pass. The expected count is the existing suite plus the new layout and homepage tests.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: Next.js build completes with route output for `/`, `/api/twin/chat`, content routes, RSS, and sitemap.

- [ ] **Step 5: Rebuild Docker service**

Run:

```bash
docker compose up -d --build
```

Expected: `ai-blog` rebuilds and starts.

- [ ] **Step 6: Confirm container health**

Run:

```bash
docker compose ps
```

Expected: `ai-blog` is `healthy` and mapped as `127.0.0.1:3001->3000/tcp`.

- [ ] **Step 7: Smoke homepage markers through nginx**

Run:

```bash
html=$(curl -fsS -H 'Host: blog.wenshuai.site' http://127.0.0.1/)
for marker in 'Null Space' '展开 Null AI' 'data-view-state="overview"' 'data-testid="universe-viewport"'; do
  printf '%s ' "$marker"
  printf '%s' "$html" | grep -Fq "$marker" && echo OK || echo MISSING
done
```

Expected:

```text
Null Space OK
展开 Null AI OK
data-view-state="overview" OK
data-testid="universe-viewport" OK
```

- [ ] **Step 8: Smoke main routes**

Run:

```bash
for path in / /essays /projects /notes /about /rss.xml /sitemap.xml; do
  status=$(curl -sS -o /dev/null -w '%{http_code}' -H 'Host: blog.wenshuai.site' "http://127.0.0.1${path}")
  printf '%s %s\n' "$path" "$status"
done
```

Expected:

```text
/ 200
/essays 200
/projects 200
/notes 200
/about 200
/rss.xml 200
/sitemap.xml 200
```

- [ ] **Step 9: Smoke twin API**

Run:

```bash
curl -fsS \
  -H 'Host: blog.wenshuai.site' \
  -H 'Content-Type: application/json' \
  -X POST http://127.0.0.1/api/twin/chat \
  --data '{"message":"总结一下工作行星","contextCard":{"id":"planet-work","title":"Work","category":"work"}}'
```

Expected: JSON response with `answer`, `mode`, and `references`. `mode` may be `fallback` when `OPENAI_API_KEY` is not configured.

- [ ] **Step 10: Confirm reference image remains private**

Run:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -H 'Host: blog.wenshuai.site' http://127.0.0.1/export.jpg
```

Expected: `404`.

- [ ] **Step 11: Commit verification fixes only if needed**

If verification required a code fix, commit the focused fix:

```bash
git add <changed-files>
git commit -m "fix: stabilize immersive planet entry"
```

If no fix was needed, do not create an empty commit.
