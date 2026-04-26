# Minimal Three.js Planet Universe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current CSS/DOM planet bodies with a minimal high-end Three.js planet scene while preserving all public planets, hover preview behavior, double-click detail entry, reduced-motion support, and DOM accessibility controls.

**Architecture:** Add a deterministic Three.js scene model, render it through `@react-three/fiber`, and keep the existing React DOM workbench as the owner of hover, focus, pause, detail, and digital twin state. The WebGL canvas handles visual planets/stars/orbits; DOM controls remain available for accessibility, tests, and mobile fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, `@react-three/fiber`, Vitest, Testing Library, Playwright, existing SQLite-backed `StoredPlanet` content.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add `three` and `@react-three/fiber`.
- Create `components/site/life-universe/minimal-three-scene-model.ts`: pure deterministic mapping from `PlanetUniverseBodyModel` into minimal Three.js body data, star positions, color schemes, LOD, and orbit parameters.
- Create `components/site/life-universe/minimal-planet-mesh.tsx`: one matte 3D planet mesh, optional thin ring, glow shell, and invisible hit mesh.
- Create `components/site/life-universe/minimal-star-field.tsx`: low-count deterministic warm star points.
- Create `components/site/life-universe/minimal-orbit-paths.tsx`: thin understated orbit rings.
- Create `components/site/life-universe/minimal-connections.tsx`: optional faint straight connection lines.
- Create `components/site/life-universe/planet-universe-scene.tsx`: `@react-three/fiber` Canvas wrapper and scene event bridge.
- Modify `components/site/life-universe/universe-canvas.tsx`: render the WebGL scene as the primary desktop planet system and keep DOM planet controls as accessibility/mobile fallback.
- Modify `components/site/life-universe/life-universe-workbench.tsx`: pass reduced-motion and active state into the scene.
- Modify `components/site/life-universe/types.ts`: add minimal Three.js scene model types if not kept local to the new model file.
- Modify `app/globals.css`: add minimal canvas container, DOM accessibility control, and card refinements; preserve fallback styles.
- Add `tests/lib/minimal-three-scene-model.test.ts`: deterministic model and color/LOD coverage.
- Add `tests/components/planet-universe-scene.test.tsx`: mocked Canvas/component behavior and event bridge tests.
- Modify `tests/components/home-page-view.test.tsx`: assert WebGL scene container, all public planet accessibility controls, hover pause, detail entry, and fallback behavior.
- Modify `tests/components/universe-canvas.test.tsx`: update canvas expectations from CSS planet system to WebGL scene plus DOM fallback.
- Add or modify Playwright smoke coverage in `tests/e2e/release-smoke.spec.ts`: verify homepage canvas is nonblank on desktop and mobile.

---

### Task 1: Install Three.js Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Confirm dependencies are absent**

Run:

```bash
node -e "const pkg=require('./package.json'); console.log(Boolean(pkg.dependencies.three), Boolean(pkg.dependencies['@react-three/fiber']))"
```

Expected: prints `false false`.

- [ ] **Step 2: Install runtime packages**

Run:

```bash
npm install three @react-three/fiber
```

Expected: command exits `0`, and `package.json` contains `three` and `@react-three/fiber` in `dependencies`.

- [ ] **Step 3: Verify dependency metadata**

Run:

```bash
node -e "const pkg=require('./package.json'); if(!pkg.dependencies.three||!pkg.dependencies['@react-three/fiber']) process.exit(1); console.log(pkg.dependencies.three, pkg.dependencies['@react-three/fiber'])"
```

Expected: prints installed semver ranges and exits `0`.

- [ ] **Step 4: Run install verification**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit dependencies**

Run:

```bash
git add package.json package-lock.json
git commit -m "chore: add threejs dependencies"
```

---

### Task 2: Minimal Three.js Scene Model

**Files:**
- Create: `components/site/life-universe/minimal-three-scene-model.ts`
- Test: `tests/lib/minimal-three-scene-model.test.ts`

- [ ] **Step 1: Write failing model tests**

Create `tests/lib/minimal-three-scene-model.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  buildMinimalThreeScene,
  getMinimalColorScheme,
} from "@/components/site/life-universe/minimal-three-scene-model"
import type { PlanetUniverseBodyModel } from "@/components/site/life-universe/types"

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
    expect(first.stars.length).toBeGreaterThanOrEqual(25)
    expect(first.stars.length).toBeLessThanOrEqual(60)
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
```

- [ ] **Step 2: Run the model test and verify it fails**

Run:

```bash
npm test tests/lib/minimal-three-scene-model.test.ts
```

Expected: FAIL with import error for `minimal-three-scene-model`.

- [ ] **Step 3: Implement the scene model**

Create `components/site/life-universe/minimal-three-scene-model.ts`:

```ts
import type {
  PlanetRenderLevel,
  PlanetUniverseBodyModel,
  UniverseCardTone,
} from "@/components/site/life-universe/types"

export type MinimalColorScheme = "mist" | "rose" | "sage" | "slate" | "warm"

export type MinimalThreeBody = {
  readonly colorScheme: MinimalColorScheme
  readonly description: string
  readonly hasRing: boolean
  readonly id: string
  readonly name: string
  readonly orbitRadius: number
  readonly orbitSpeed: number
  readonly planetId: number
  readonly position: readonly [number, number, number]
  readonly publicMemoryCount: number
  readonly renderLevel: PlanetRenderLevel
  readonly rotationSpeed: number
  readonly size: number
  readonly slug: string
  readonly summary: string
}

export type MinimalStarPoint = {
  readonly position: readonly [number, number, number]
  readonly size: number
}

export type MinimalThreeScene = {
  readonly bodies: ReadonlyArray<MinimalThreeBody>
  readonly stars: ReadonlyArray<MinimalStarPoint>
}

const colorCycle: ReadonlyArray<MinimalColorScheme> = [
  "sage",
  "mist",
  "warm",
  "slate",
  "rose",
]

export function buildMinimalThreeScene(
  planets: ReadonlyArray<PlanetUniverseBodyModel>
): MinimalThreeScene {
  return {
    bodies: planets.map((planet, index) => buildBody(planet, index, planets.length)),
    stars: buildStars(36),
  }
}

export function getMinimalColorScheme({
  index,
  tone,
}: {
  readonly index: number
  readonly tone: UniverseCardTone
}): MinimalColorScheme {
  if (tone === "violet") return "mist"
  if (tone === "blue") return "slate"
  if (tone === "neutral") return colorCycle[index % colorCycle.length]
  if (tone === "cyan" || tone === "teal" || tone === "emerald") {
    return index % 2 === 0 ? "sage" : "warm"
  }
  return colorCycle[index % colorCycle.length]
}

function buildBody(
  planet: PlanetUniverseBodyModel,
  index: number,
  total: number
): MinimalThreeBody {
  const angle = degreesToRadians(planet.orbit.startAngle)
  const tier = getTier(index, total)
  const radius = 5.5 + index * 1.45 + (tier === "point" ? 3.2 : 0)
  const y = ((index % 5) - 2) * 0.72

  return {
    colorScheme: getMinimalColorScheme({ index, tone: planet.tone }),
    description: planet.description,
    hasRing: planet.size >= 68 && index % 3 === 0,
    id: planet.id,
    name: planet.name,
    orbitRadius: round(radius),
    orbitSpeed: round(0.018 / (1 + index * 0.18)),
    planetId: planet.planetId,
    position: [
      round(Math.cos(angle) * radius),
      round(y),
      round(Math.sin(angle) * radius * 0.72),
    ],
    publicMemoryCount: planet.publicMemoryCount,
    renderLevel: tier,
    rotationSpeed: round(0.0035 / (1 + index * 0.06)),
    size: round(resolveSize(planet.size, tier)),
    slug: planet.slug,
    summary: planet.summary,
  }
}

function getTier(index: number, total: number): PlanetRenderLevel {
  if (total > 16 && index >= 16) return "point"
  if (total > 8 && index >= 8) return "simple"
  return "full"
}

function resolveSize(size: number, tier: PlanetRenderLevel) {
  const normalized = Math.max(0.65, Math.min(1.85, size / 50))

  if (tier === "point") return 0.14
  if (tier === "simple") return normalized * 0.68
  return normalized
}

function buildStars(count: number): ReadonlyArray<MinimalStarPoint> {
  return Array.from({ length: count }, (_, index) => {
    const seed = seeded(index + 1)
    const theta = seed * Math.PI * 2
    const phi = Math.acos(2 * seeded(index + 101) - 1)
    const radius = 18 + seeded(index + 201) * 24

    return {
      position: [
        round(radius * Math.sin(phi) * Math.cos(theta)),
        round(radius * Math.sin(phi) * Math.sin(theta)),
        round(radius * Math.cos(phi) - 14),
      ],
      size: seeded(index + 301) > 0.82 ? 0.075 : 0.04,
    }
  })
}

function seeded(value: number) {
  const x = Math.sin(value * 999) * 10000
  return x - Math.floor(x)
}

function degreesToRadians(value: number) {
  return (value / 180) * Math.PI
}

function round(value: number) {
  return Number(value.toFixed(3))
}
```

- [ ] **Step 4: Run model tests**

Run:

```bash
npm test tests/lib/minimal-three-scene-model.test.ts tests/lib/planet-universe-model.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit model**

Run:

```bash
git add components/site/life-universe/minimal-three-scene-model.ts tests/lib/minimal-three-scene-model.test.ts
git commit -m "feat: add minimal three scene model"
```

---

### Task 3: WebGL Scene Components

**Files:**
- Create: `components/site/life-universe/minimal-planet-mesh.tsx`
- Create: `components/site/life-universe/minimal-star-field.tsx`
- Create: `components/site/life-universe/minimal-orbit-paths.tsx`
- Create: `components/site/life-universe/minimal-connections.tsx`
- Create: `components/site/life-universe/planet-universe-scene.tsx`
- Test: `tests/components/planet-universe-scene.test.tsx`

- [ ] **Step 1: Write failing component tests with mocked fiber Canvas**

Create `tests/components/planet-universe-scene.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import type { MinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { readonly children: ReactNode }) => (
    <div data-testid="mock-three-canvas">{children}</div>
  ),
  useFrame: () => undefined,
}))

const scene: MinimalThreeScene = {
  stars: [
    { position: [1, 2, -10], size: 0.04 },
    { position: [-2, 1, -14], size: 0.075 },
  ],
  bodies: [
    {
      colorScheme: "sage",
      description: "完整描述",
      hasRing: true,
      id: "planet-1",
      name: "工作与职业",
      orbitRadius: 6,
      orbitSpeed: 0.01,
      planetId: 1,
      position: [4, 0, -2],
      publicMemoryCount: 2,
      renderLevel: "full",
      rotationSpeed: 0.003,
      size: 1.4,
      slug: "work",
      summary: "工作、项目和职业成长。",
    },
    {
      colorScheme: "mist",
      description: "完整描述",
      hasRing: false,
      id: "planet-2",
      name: "写作与表达",
      orbitRadius: 8,
      orbitSpeed: 0.008,
      planetId: 2,
      position: [-5, 1, -3],
      publicMemoryCount: 0,
      renderLevel: "simple",
      rotationSpeed: 0.002,
      size: 0.8,
      slug: "writing",
      summary: "写作。",
    },
  ],
}

describe("PlanetUniverseScene", () => {
  it("renders a canvas scene with one interactive mesh per planet", async () => {
    const { PlanetUniverseScene } = await import("@/components/site/life-universe/planet-universe-scene")
    const onEnterPlanet = vi.fn()
    const onHoverPlanet = vi.fn()
    const onLeavePlanet = vi.fn()

    render(
      <PlanetUniverseScene
        focusedPlanetId="planet-1"
        hoveredPlanetId={undefined}
        isMotionPaused={false}
        scene={scene}
        onEnterPlanet={onEnterPlanet}
        onHoverPlanet={onHoverPlanet}
        onLeavePlanet={onLeavePlanet}
      />
    )

    expect(screen.getByTestId("mock-three-canvas")).toBeInTheDocument()
    expect(screen.getByTestId("minimal-star-field")).toHaveAttribute("data-star-count", "2")
    expect(screen.getAllByTestId("minimal-planet-mesh")).toHaveLength(2)
    expect(screen.getByTestId("minimal-orbit-paths")).toHaveAttribute("data-orbit-count", "2")
  })

  it("bridges planet pointer and double-click events back to the DOM owner", async () => {
    const { PlanetUniverseScene } = await import("@/components/site/life-universe/planet-universe-scene")
    const onEnterPlanet = vi.fn()
    const onHoverPlanet = vi.fn()
    const onLeavePlanet = vi.fn()

    render(
      <PlanetUniverseScene
        focusedPlanetId={undefined}
        hoveredPlanetId={undefined}
        isMotionPaused={false}
        scene={scene}
        onEnterPlanet={onEnterPlanet}
        onHoverPlanet={onHoverPlanet}
        onLeavePlanet={onLeavePlanet}
      />
    )

    const planet = screen.getByTestId("minimal-planet-mesh-planet-1")

    fireEvent.pointerMove(planet, { clientX: 120, clientY: 160 })
    expect(onHoverPlanet).toHaveBeenCalledWith("planet-1", { x: 120, y: 160 })

    fireEvent.doubleClick(planet)
    expect(onEnterPlanet).toHaveBeenCalledWith("planet-1")

    fireEvent.pointerLeave(planet)
    expect(onLeavePlanet).toHaveBeenCalledWith("planet-1")
  })
})
```

- [ ] **Step 2: Run scene component tests and verify failure**

Run:

```bash
npm test tests/components/planet-universe-scene.test.tsx
```

Expected: FAIL with import error for `planet-universe-scene`.

- [ ] **Step 3: Implement `minimal-star-field.tsx`**

Create `components/site/life-universe/minimal-star-field.tsx`:

```tsx
"use client"

import * as THREE from "three"

import type { MinimalStarPoint } from "@/components/site/life-universe/minimal-three-scene-model"

export function MinimalStarField({
  stars,
}: {
  readonly stars: ReadonlyArray<MinimalStarPoint>
}) {
  const positions = new Float32Array(stars.flatMap((star) => [...star.position]))

  return (
    <points data-testid="minimal-star-field" data-star-count={stars.length}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={stars.length}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fff8f0"
        size={0.06}
        transparent
        opacity={0.62}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
```

- [ ] **Step 4: Implement `minimal-orbit-paths.tsx`**

Create `components/site/life-universe/minimal-orbit-paths.tsx`:

```tsx
"use client"

import { useMemo } from "react"
import * as THREE from "three"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"

export function MinimalOrbitPaths({
  bodies,
}: {
  readonly bodies: ReadonlyArray<MinimalThreeBody>
}) {
  return (
    <group data-testid="minimal-orbit-paths" data-orbit-count={bodies.length}>
      {bodies.map((body) => (
        <OrbitPath key={body.id} body={body} />
      ))}
    </group>
  )
}

function OrbitPath({ body }: { readonly body: MinimalThreeBody }) {
  const geometry = useMemo(() => {
    const points = new THREE.EllipseCurve(
      0,
      0,
      body.orbitRadius,
      body.orbitRadius * 0.72,
      0,
      Math.PI * 2
    )
      .getPoints(96)
      .map((point) => new THREE.Vector3(point.x, 0, point.y))

    return new THREE.BufferGeometry().setFromPoints(points)
  }, [body.orbitRadius])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#fff8f0" transparent opacity={0.08} />
    </line>
  )
}
```

- [ ] **Step 5: Implement `minimal-connections.tsx`**

Create `components/site/life-universe/minimal-connections.tsx`:

```tsx
"use client"

import { useMemo } from "react"
import * as THREE from "three"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"

export function MinimalConnections({
  bodies,
  hoveredPlanetId,
}: {
  readonly bodies: ReadonlyArray<MinimalThreeBody>
  readonly hoveredPlanetId?: string
}) {
  const pairs = useMemo(() => {
    return bodies.flatMap((body, index) => {
      const next = bodies[(index + 1) % bodies.length]
      return next && next.id !== body.id ? [[body, next] as const] : []
    })
  }, [bodies])

  return (
    <group data-testid="minimal-connections" data-connection-count={pairs.length}>
      {pairs.map(([from, to]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...from.position),
          new THREE.Vector3(...to.position),
        ])
        const active = hoveredPlanetId === from.id || hoveredPlanetId === to.id

        return (
          <line key={`${from.id}-${to.id}`} geometry={geometry}>
            <lineBasicMaterial color="#fff8f0" transparent opacity={active ? 0.26 : 0.045} />
          </line>
        )
      })}
    </group>
  )
}
```

- [ ] **Step 6: Implement `minimal-planet-mesh.tsx`**

Create `components/site/life-universe/minimal-planet-mesh.tsx`:

```tsx
"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"

const colors = {
  mist: { glow: "#baaacd", shadow: "#7a6a90", surface: "#9a8ab0" },
  rose: { glow: "#d0b0b8", shadow: "#907078", surface: "#b09098" },
  sage: { glow: "#8aaaaa", shadow: "#4a6a6a", surface: "#6a8a8a" },
  slate: { glow: "#9abbd0", shadow: "#5a7a90", surface: "#7a9ab0" },
  warm: { glow: "#d8c8b8", shadow: "#988070", surface: "#b8a090" },
} as const

export function MinimalPlanetMesh({
  body,
  hasHover,
  isHovered,
  isMotionPaused,
  onEnter,
  onHover,
  onLeave,
}: {
  readonly body: MinimalThreeBody
  readonly hasHover: boolean
  readonly isHovered: boolean
  readonly isMotionPaused: boolean
  readonly onEnter: (planetId: string) => void
  readonly onHover: (planetId: string, point: { readonly x: number; readonly y: number }) => void
  readonly onLeave: (planetId: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const palette = colors[body.colorScheme]

  useFrame(() => {
    if (!groupRef.current || !sphereRef.current || isMotionPaused) return

    groupRef.current.rotation.y += body.orbitSpeed
    sphereRef.current.rotation.y += body.rotationSpeed
  })

  const opacity = hasHover && !isHovered ? 0.42 : 0.96

  return (
    <group
      ref={groupRef}
      data-testid="minimal-planet-mesh"
      position={body.position as [number, number, number]}
    >
      <mesh
        data-testid={`minimal-planet-mesh-${body.id}`}
        onDoubleClick={() => onEnter(body.id)}
        onPointerLeave={() => onLeave(body.id)}
        onPointerMove={(event) => {
          const source = event.sourceEvent
          onHover(body.id, { x: source.clientX, y: source.clientY })
        }}
      >
        <sphereGeometry args={[body.size * 2.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh scale={isHovered ? 1.14 : 1}>
        <sphereGeometry args={[body.size * 1.42, 32, 32]} />
        <meshBasicMaterial color={palette.glow} transparent opacity={0.035 * opacity} side={THREE.BackSide} />
      </mesh>
      <mesh ref={sphereRef} scale={isHovered ? 1.12 : 1}>
        <sphereGeometry args={[body.size, body.renderLevel === "full" ? 48 : 24, body.renderLevel === "full" ? 48 : 24]} />
        <meshStandardMaterial
          color={palette.surface}
          emissive={palette.shadow}
          emissiveIntensity={isHovered ? 0.1 : 0.025}
          metalness={0}
          opacity={opacity}
          roughness={0.92}
          transparent
        />
      </mesh>
      {body.hasRing ? (
        <mesh rotation={[Math.PI / 2.25, 0, 0]}>
          <torusGeometry args={[body.size * 1.75, body.size * 0.018, 8, 96]} />
          <meshBasicMaterial color={palette.glow} transparent opacity={0.22 * opacity} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      {isHovered ? <pointLight color={palette.glow} intensity={0.65} distance={12} decay={3} /> : null}
    </group>
  )
}
```

- [ ] **Step 7: Implement `planet-universe-scene.tsx`**

Create `components/site/life-universe/planet-universe-scene.tsx`:

```tsx
"use client"

import { Canvas } from "@react-three/fiber"

import type { MinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import { MinimalConnections } from "@/components/site/life-universe/minimal-connections"
import { MinimalOrbitPaths } from "@/components/site/life-universe/minimal-orbit-paths"
import { MinimalPlanetMesh } from "@/components/site/life-universe/minimal-planet-mesh"
import { MinimalStarField } from "@/components/site/life-universe/minimal-star-field"

export function PlanetUniverseScene({
  focusedPlanetId,
  hoveredPlanetId,
  isMotionPaused,
  onEnterPlanet,
  onHoverPlanet,
  onLeavePlanet,
  scene,
}: {
  readonly focusedPlanetId?: string
  readonly hoveredPlanetId?: string
  readonly isMotionPaused: boolean
  readonly onEnterPlanet: (planetId: string) => void
  readonly onHoverPlanet: (planetId: string, point: { readonly x: number; readonly y: number }) => void
  readonly onLeavePlanet: (planetId: string) => void
  readonly scene: MinimalThreeScene
}) {
  const activeHoverId = hoveredPlanetId ?? focusedPlanetId

  return (
    <div className="minimal-three-scene" data-testid="minimal-three-scene">
      <Canvas
        camera={{ fov: 45, position: [0, 0, 24] }}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={["#0a0a0c"]} />
        <ambientLight intensity={0.16} />
        <directionalLight color="#fff8f0" intensity={0.55} position={[6, 6, 8]} />
        <MinimalStarField stars={scene.stars} />
        <MinimalOrbitPaths bodies={scene.bodies} />
        <MinimalConnections bodies={scene.bodies} hoveredPlanetId={activeHoverId} />
        {scene.bodies.map((body) => (
          <MinimalPlanetMesh
            key={body.id}
            body={body}
            hasHover={Boolean(activeHoverId)}
            isHovered={activeHoverId === body.id}
            isMotionPaused={isMotionPaused}
            onEnter={onEnterPlanet}
            onHover={onHoverPlanet}
            onLeave={onLeavePlanet}
          />
        ))}
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 8: Run component tests**

Run:

```bash
npm test tests/components/planet-universe-scene.test.tsx tests/lib/minimal-three-scene-model.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit scene components**

Run:

```bash
git add components/site/life-universe/minimal-planet-mesh.tsx components/site/life-universe/minimal-star-field.tsx components/site/life-universe/minimal-orbit-paths.tsx components/site/life-universe/minimal-connections.tsx components/site/life-universe/planet-universe-scene.tsx tests/components/planet-universe-scene.test.tsx
git commit -m "feat: add minimal three planet scene"
```

---

### Task 4: Integrate WebGL Scene Into Homepage Canvas

**Files:**
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`
- Modify: `tests/components/universe-canvas.test.tsx`

- [ ] **Step 1: Update tests for WebGL scene integration**

In `tests/components/home-page-view.test.tsx`, add or update a homepage test:

```tsx
it("renders the minimal Three.js scene while preserving accessible planet controls", () => {
  render(<HomePageView {...buildProps({ planets: buildGalaxyPlanets() })} />)

  expect(screen.getByTestId("minimal-three-scene")).toBeInTheDocument()

  for (const galaxy of LIFE_UNIVERSE_GALAXIES) {
    expect(screen.getByRole("button", { name: `${galaxy.name} 行星` })).toBeInTheDocument()
  }
})
```

In `tests/components/universe-canvas.test.tsx`, mock `PlanetUniverseScene`:

```tsx
vi.mock("@/components/site/life-universe/planet-universe-scene", () => ({
  PlanetUniverseScene: ({
    onEnterPlanet,
    onHoverPlanet,
    onLeavePlanet,
    scene,
  }: {
    readonly onEnterPlanet: (planetId: string) => void
    readonly onHoverPlanet: (planetId: string, point: { readonly x: number; readonly y: number }) => void
    readonly onLeavePlanet: (planetId: string) => void
    readonly scene: { readonly bodies: ReadonlyArray<{ readonly id: string; readonly name: string }> }
  }) => (
    <div data-testid="mock-minimal-three-scene" data-body-count={scene.bodies.length}>
      {scene.bodies.map((body) => (
        <button
          key={body.id}
          type="button"
          onDoubleClick={() => onEnterPlanet(body.id)}
          onPointerLeave={() => onLeavePlanet(body.id)}
          onPointerMove={() => onHoverPlanet(body.id, { x: 120, y: 160 })}
        >
          scene {body.name}
        </button>
      ))}
    </div>
  ),
}))
```

Then update canvas tests to assert the mock scene receives all bodies and event bridge works.

- [ ] **Step 2: Run integration tests and verify failures**

Run:

```bash
npm test tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx
```

Expected: FAIL because `minimal-three-scene` is not rendered yet.

- [ ] **Step 3: Integrate scene model in `life-universe-workbench.tsx`**

Add:

```ts
import { buildMinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
```

Derive:

```ts
const threeScene = useMemo(
  () => buildMinimalThreeScene(universe.planets),
  [universe.planets]
)
```

Pass `threeScene` to `UniverseCanvas`.

- [ ] **Step 4: Integrate `PlanetUniverseScene` in `universe-canvas.tsx`**

Import:

```ts
import type { MinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import { PlanetUniverseScene } from "@/components/site/life-universe/planet-universe-scene"
```

Add prop:

```ts
readonly threeScene: MinimalThreeScene
```

Inside the viewport/camera area, replace the desktop `.planet-orbit-system` primary visual with:

```tsx
<PlanetUniverseScene
  focusedPlanetId={focusedPlanetId}
  hoveredPlanetId={hoveredPlanetId}
  isMotionPaused={isMotionPaused}
  onEnterPlanet={onEnterPlanet}
  onHoverPlanet={onHoverPlanet}
  onLeavePlanet={onLeavePlanet}
  scene={threeScene}
/>
```

Keep DOM `PlanetBody` controls available but visually demoted for accessibility:

```tsx
<div className="planet-accessibility-controls" aria-label="行星访问控制">
  {planets.map((planet) => (
    <PlanetBody
      key={planet.id}
      planet={planet}
      isFocused={planet.id === focusedPlanetId}
      isHovered={planet.id === hoveredPlanetId}
      renderLevel="point"
      onEnter={onEnterPlanet}
      onHover={onHoverPlanet}
      onLeave={onLeavePlanet}
      onSelect={onSelectPlanet}
    />
  ))}
</div>
```

Style these controls so they remain keyboard focusable but do not visually compete with the WebGL scene.

- [ ] **Step 5: Add minimal CSS**

Append or update in `app/globals.css`:

```css
  .minimal-three-scene {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 2rem;
    background:
      radial-gradient(ellipse at center, #121214 0%, #0a0a0c 54%, #050507 100%);
  }

  .minimal-three-scene canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }

  .planet-accessibility-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .planet-accessibility-controls .planet-body {
    pointer-events: auto;
    opacity: 0;
  }

  .planet-accessibility-controls .planet-body:focus-visible {
    opacity: 1;
  }
```

- [ ] **Step 6: Run focused verification**

Run:

```bash
npm test tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx tests/components/planet-universe-scene.test.tsx tests/lib/minimal-three-scene-model.test.ts
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit integration**

Run:

```bash
git add components/site/life-universe/universe-canvas.tsx components/site/life-universe/life-universe-workbench.tsx app/globals.css tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx
git commit -m "feat: integrate minimal three universe"
```

---

### Task 5: Interaction, Reduced Motion, And Fallback Hardening

**Files:**
- Modify: `components/site/life-universe/planet-universe-scene.tsx`
- Modify: `components/site/life-universe/minimal-planet-mesh.tsx`
- Modify: `components/site/life-universe/universe-canvas.tsx`
- Modify: `tests/components/home-page-view.test.tsx`
- Modify: `tests/components/planet-universe-scene.test.tsx`

- [ ] **Step 1: Add reduced-motion and fallback tests**

In `tests/components/planet-universe-scene.test.tsx`, add:

```tsx
it("marks the scene as reduced motion when requested", async () => {
  const { PlanetUniverseScene } = await import("@/components/site/life-universe/planet-universe-scene")

  render(
    <PlanetUniverseScene
      focusedPlanetId={undefined}
      hoveredPlanetId={undefined}
      isMotionPaused={false}
      isReducedMotion={true}
      scene={scene}
      onEnterPlanet={() => {}}
      onHoverPlanet={() => {}}
      onLeavePlanet={() => {}}
    />
  )

  expect(screen.getByTestId("minimal-three-scene")).toHaveAttribute("data-reduced-motion", "true")
})
```

In `tests/components/home-page-view.test.tsx`, add a test stubbing `matchMedia`:

```tsx
it("keeps planet previews usable when reduced motion is requested", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    addEventListener: () => {},
    dispatchEvent: () => false,
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    removeEventListener: () => {},
  }))

  render(<HomePageView {...buildProps()} />)

  fireEvent.pointerMove(screen.getByRole("button", { name: "工作 行星" }), {
    clientX: 160,
    clientY: 180,
  })

  expect(screen.getByRole("dialog", { name: "工作 预览" })).toBeInTheDocument()
  expect(screen.getByTestId("null-space-shell")).toHaveAttribute("data-motion-paused", "true")
})
```

- [ ] **Step 2: Run tests and verify failures**

Run:

```bash
npm test tests/components/planet-universe-scene.test.tsx tests/components/home-page-view.test.tsx -t "reduced motion|keeps planet previews"
```

Expected: FAIL until reduced-motion state is wired.

- [ ] **Step 3: Add reduced-motion hook**

In `life-universe-workbench.tsx`, add:

```ts
const [isReducedMotion, setIsReducedMotion] = useState(false)

useEffect(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return
  }

  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  setIsReducedMotion(query.matches)

  function handleChange(event: MediaQueryListEvent) {
    setIsReducedMotion(event.matches)
  }

  query.addEventListener("change", handleChange)
  return () => query.removeEventListener("change", handleChange)
}, [])
```

If lint rejects direct effect state sync, use `useSyncExternalStore` instead:

```ts
function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {}
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
```

Prefer the `useSyncExternalStore` version if lint fails.

- [ ] **Step 4: Pass reduced motion into scene**

Add `isReducedMotion` prop to `UniverseCanvas` and `PlanetUniverseScene`.

In `MinimalPlanetMesh`, treat `isReducedMotion` like pause:

```ts
if (!groupRef.current || !sphereRef.current || isMotionPaused || isReducedMotion) return
```

Set the scene container attribute:

```tsx
data-reduced-motion={isReducedMotion ? "true" : "false"}
```

- [ ] **Step 5: Run focused verification**

Run:

```bash
npm test tests/components/planet-universe-scene.test.tsx tests/components/home-page-view.test.tsx tests/components/universe-canvas.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit interactions**

Run:

```bash
git add components/site/life-universe/planet-universe-scene.tsx components/site/life-universe/minimal-planet-mesh.tsx components/site/life-universe/universe-canvas.tsx components/site/life-universe/life-universe-workbench.tsx tests/components/home-page-view.test.tsx tests/components/planet-universe-scene.test.tsx
git commit -m "feat: harden three scene interactions"
```

---

### Task 6: Browser Canvas Verification

**Files:**
- Modify: `tests/e2e/release-smoke.spec.ts`

- [ ] **Step 1: Add Playwright canvas smoke test**

Append this test to `tests/e2e/release-smoke.spec.ts`:

```ts
test("homepage renders a nonblank minimal Three.js canvas", async ({ page }) => {
  await page.goto("/")

  const canvas = page.locator('[data-testid="minimal-three-scene"] canvas')
  await expect(canvas).toBeVisible()

  const box = await canvas.boundingBox()
  expect(box?.width ?? 0).toBeGreaterThan(240)
  expect(box?.height ?? 0).toBeGreaterThan(180)

  const sample = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement
    const context = canvasNode.getContext("webgl2") ?? canvasNode.getContext("webgl")

    if (!context) {
      return { hasContext: false, height: canvasNode.height, width: canvasNode.width }
    }

    const width = Math.max(1, canvasNode.width)
    const height = Math.max(1, canvasNode.height)
    const pixels = new Uint8Array(4 * 20 * 20)
    context.readPixels(
      Math.floor(width / 2) - 10,
      Math.floor(height / 2) - 10,
      20,
      20,
      context.RGBA,
      context.UNSIGNED_BYTE,
      pixels
    )
    const nonBlackPixels = Array.from({ length: 400 }).filter((_, index) => {
      const offset = index * 4
      return pixels[offset] + pixels[offset + 1] + pixels[offset + 2] > 12
    }).length

    return {
      hasContext: true,
      height,
      nonBlackPixels,
      width,
    }
  })

  expect(sample.hasContext).toBe(true)
  expect(sample.width).toBeGreaterThan(240)
  expect(sample.height).toBeGreaterThan(180)
  expect("nonBlackPixels" in sample ? sample.nonBlackPixels : 0).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run e2e smoke test**

Run:

```bash
npm run test:e2e -- tests/e2e/release-smoke.spec.ts
```

Expected: PASS. If Chromium dependencies are missing, run the existing project setup commands:

```bash
npx playwright install chromium
npx playwright install-deps chromium
```

Then rerun the e2e command.

- [ ] **Step 3: Commit e2e verification**

Run:

```bash
git add tests/e2e/release-smoke.spec.ts
git commit -m "test: verify three canvas smoke"
```

---

### Task 7: Final Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run full unit suite**

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

- [ ] **Step 3: Run e2e smoke**

Run:

```bash
npm run test:e2e -- tests/e2e/release-smoke.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Review diff**

Run:

```bash
git status --short
git diff --stat master..HEAD
git diff master..HEAD -- package.json package-lock.json components/site/life-universe app/globals.css tests/components tests/lib tests/e2e docs/superpowers
```

Expected: only the Three.js planet universe implementation, tests, docs, and dependency changes are present.

- [ ] **Step 6: Commit any verification fixes**

If verification required fixes, run:

```bash
git add package.json package-lock.json components/site/life-universe app/globals.css tests/components tests/lib tests/e2e
git commit -m "fix: stabilize minimal three planet universe"
```

Expected: commit only if Step 1-4 required changes.

---

## Self-Review

- Spec coverage: The plan covers Three.js dependency installation, deterministic scene model, WebGL planet/star/orbit components, homepage integration, all-public-planet accessibility controls, hover pause, double-click detail entry, reduced motion, crowded LOD behavior, browser canvas pixel verification, and production build verification.
- Completion-marker scan: No unfinished instructions remain.
- Type consistency: `MinimalThreeScene`, `MinimalThreeBody`, `MinimalStarPoint`, and scene event handler names are introduced before use and reused consistently.
