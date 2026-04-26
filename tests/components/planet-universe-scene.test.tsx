import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { buildMinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import type { PlanetUniverseBodyModel } from "@/components/site/life-universe/types"

const { useFrameMock } = vi.hoisted(() => ({
  useFrameMock: vi.fn(),
}))

vi.mock("@react-three/fiber", () => ({
  Canvas({ children }: { readonly children?: React.ReactNode }) {
    return <div data-testid="mock-r3f-canvas">{children}</div>
  },
  useFrame: useFrameMock,
}))

vi.mock("@/components/site/life-universe/minimal-star-field", () => ({
  MinimalStarField({ stars }: { readonly stars: ReadonlyArray<unknown> }) {
    return <div data-testid="minimal-star-field" data-star-count={stars.length} />
  },
}))

vi.mock("@/components/site/life-universe/minimal-orbit-paths", () => ({
  MinimalOrbitPaths({ bodies }: { readonly bodies: ReadonlyArray<unknown> }) {
    return <div data-testid="minimal-orbit-paths" data-orbit-count={bodies.length} />
  },
}))

vi.mock("@/components/site/life-universe/minimal-connections", () => ({
  MinimalConnections() {
    return <div data-testid="minimal-connections" />
  },
}))

vi.mock("@/components/site/life-universe/minimal-planet-mesh", () => ({
  MinimalPlanetMesh({
    body,
    onEnterPlanet,
    onHoverPlanet,
    onLeavePlanet,
  }: {
    readonly body: { readonly id: string }
    readonly onEnterPlanet: (planetId: string) => void
    readonly onHoverPlanet: (planetId: string, point: { x: number; y: number }) => void
    readonly onLeavePlanet: (planetId: string) => void
  }) {
    return (
      <button
        data-testid={`minimal-planet-mesh-${body.id}`}
        onDoubleClick={() => onEnterPlanet(body.id)}
        onPointerLeave={() => onLeavePlanet(body.id)}
        onPointerMove={(event) =>
          onHoverPlanet(body.id, { x: event.clientX, y: event.clientY })
        }
        type="button"
      />
    )
  },
}))

import { PlanetUniverseScene } from "@/components/site/life-universe/planet-universe-scene"

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
]

function readConnection(value: string | null) {
  return (value ?? "").split(",").filter(Boolean).map(Number)
}

function expectPointCloseTo(
  actual: ReadonlyArray<number>,
  expected: readonly [number, number, number]
) {
  expect(actual).toHaveLength(3)
  actual.forEach((value, index) => {
    expect(value).toBeCloseTo(expected[index], 4)
  })
}

function latestFrameCallback() {
  const callback = useFrameMock.mock.calls.at(-1)?.[0]

  expect(callback).toEqual(expect.any(Function))

  return callback as (state: unknown, delta?: number) => void
}

describe("PlanetUniverseScene", () => {
  it("renders the canvas, wires scene counts, and bridges planet events", () => {
    const scene = buildMinimalThreeScene(planets)
    const onHoverPlanet = vi.fn()
    const onLeavePlanet = vi.fn()
    const onEnterPlanet = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    try {
      render(
        <PlanetUniverseScene
          scene={scene}
          hoveredPlanetId="planet-1"
          focusedPlanetId="planet-1"
          isMotionPaused={false}
          onHoverPlanet={onHoverPlanet}
          onLeavePlanet={onLeavePlanet}
          onEnterPlanet={onEnterPlanet}
        />
      )

      expect(screen.getByTestId("minimal-three-scene")).toBeInTheDocument()
      expect(screen.getByTestId("mock-r3f-canvas")).toBeInTheDocument()
      expect(screen.getByTestId("minimal-star-field")).toHaveAttribute(
        "data-star-count",
        String(scene.stars.length)
      )
      expect(screen.getByTestId("minimal-orbit-paths")).toHaveAttribute(
        "data-orbit-count",
        String(scene.bodies.length)
      )
      expect(screen.getAllByTestId(/^minimal-planet-mesh-/)).toHaveLength(scene.bodies.length)

      fireEvent.pointerMove(screen.getByTestId("minimal-planet-mesh-planet-1"), {
        clientX: 123,
        clientY: 456,
      })
      fireEvent.pointerLeave(screen.getByTestId("minimal-planet-mesh-planet-1"))
      fireEvent.doubleClick(screen.getByTestId("minimal-planet-mesh-planet-1"))

      expect(onHoverPlanet).toHaveBeenCalledWith("planet-1", { x: 123, y: 456 })
      expect(onLeavePlanet).toHaveBeenCalledWith("planet-1")
      expect(onEnterPlanet).toHaveBeenCalledWith("planet-1")
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it("keeps real connection endpoints aligned with shared orbit positions and pause state", async () => {
    const scene = buildMinimalThreeScene(planets)
    const [activeBody, connectedBody] = scene.bodies
    const {
      getMinimalOrbitAngularSpeed,
      getMinimalOrbitPosition,
      getMinimalOrbitSeed,
    } = await import("@/components/site/life-universe/minimal-three-orbit")
    const { MinimalConnections } = await vi.importActual<
      typeof import("@/components/site/life-universe/minimal-connections")
    >("@/components/site/life-universe/minimal-connections")
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    useFrameMock.mockClear()

    try {
      const { rerender } = render(
        <MinimalConnections
          activePlanetId={activeBody.id}
          bodies={scene.bodies}
          isMotionPaused={false}
        />
      )
      const initial = readConnection(
        screen.getByTestId("minimal-connections").getAttribute("data-first-connection")
      )

      expectPointCloseTo(
        initial.slice(0, 3),
        getMinimalOrbitPosition(activeBody, getMinimalOrbitSeed(activeBody))
      )
      expectPointCloseTo(
        initial.slice(3, 6),
        getMinimalOrbitPosition(connectedBody, getMinimalOrbitSeed(connectedBody))
      )

      latestFrameCallback()({}, 1)
      rerender(
        <MinimalConnections
          activePlanetId={activeBody.id}
          bodies={scene.bodies}
          isMotionPaused={false}
        />
      )

      const moved = readConnection(
        screen.getByTestId("minimal-connections").getAttribute("data-first-connection")
      )
      expectPointCloseTo(
        moved.slice(0, 3),
        getMinimalOrbitPosition(
          activeBody,
          getMinimalOrbitSeed(activeBody) + getMinimalOrbitAngularSpeed(activeBody)
        )
      )
      expectPointCloseTo(
        moved.slice(3, 6),
        getMinimalOrbitPosition(
          connectedBody,
          getMinimalOrbitSeed(connectedBody) + getMinimalOrbitAngularSpeed(connectedBody)
        )
      )

      rerender(
        <MinimalConnections
          activePlanetId={activeBody.id}
          bodies={scene.bodies}
          isMotionPaused
        />
      )
      const beforePausedFrame = readConnection(
        screen.getByTestId("minimal-connections").getAttribute("data-first-connection")
      )

      latestFrameCallback()({}, 1)
      rerender(
        <MinimalConnections
          activePlanetId={activeBody.id}
          bodies={scene.bodies}
          isMotionPaused
        />
      )

      expect(readConnection(
        screen.getByTestId("minimal-connections").getAttribute("data-first-connection")
      )).toEqual(beforePausedFrame)
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })
})
