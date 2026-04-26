import type { ComponentProps } from "react"

import { act, fireEvent, render, screen } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { memo } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { buildMinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import type {
  PlanetRenderLevel,
  PlanetUniverseBodyModel,
} from "@/components/site/life-universe/types"
import type { PlanetPoint } from "@/components/site/life-universe/planet-body"

const { renderCounts } = vi.hoisted(() => ({
  renderCounts: new Map<string, number>(),
}))

vi.mock("@/components/site/life-universe/planet-body", () => ({
  PlanetBody: memo(function MockPlanetBody({
    isFocused,
    isHovered,
    planet,
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
    readonly onHover: (planetId: string, point: PlanetPoint) => void
    readonly onLeave: (planetId: string) => void
    readonly onSelect: (planetId: string, point: PlanetPoint) => void
  }) {
    renderCounts.set(planet.id, (renderCounts.get(planet.id) ?? 0) + 1)

    return (
      <button
        aria-label={`${planet.name} 行星`}
        type="button"
        data-focused={isFocused ? "true" : "false"}
        data-hovered={isHovered ? "true" : "false"}
        data-testid="planet-body"
        data-planet-id={planet.id}
        data-render-level={renderLevel}
        onBlur={() => onLeave(planet.id)}
        onClick={() => onSelect(planet.id, { x: 0, y: 0 })}
        onDoubleClick={() => onEnter(planet.id)}
        onFocus={() => onHover(planet.id, { x: 0, y: 0 })}
        onPointerLeave={() => onLeave(planet.id)}
        onPointerMove={(event) =>
          onHover(planet.id, { x: event.clientX, y: event.clientY })
        }
      >
        {planet.name}
      </button>
    )
  }),
}))

vi.mock("@/components/site/life-universe/planet-universe-scene", () => ({
  PlanetUniverseScene({
    scene,
    onEnterPlanet,
    onHoverPlanet,
    onLeavePlanet,
  }: {
    readonly scene: { readonly bodies: ReadonlyArray<{ readonly id: string }> }
    readonly onEnterPlanet: (planetId: string) => void
    readonly onHoverPlanet: (planetId: string, point: PlanetPoint) => void
    readonly onLeavePlanet: (planetId: string) => void
  }) {
    return (
      <div
        className="minimal-three-scene"
        data-body-count={scene.bodies.length}
        data-testid="mock-minimal-three-scene"
      >
        {scene.bodies.map((body) => (
          <button
            key={body.id}
            data-testid={`mock-scene-planet-${body.id}`}
            onDoubleClick={() => onEnterPlanet(body.id)}
            onPointerLeave={() => onLeavePlanet(body.id)}
            onPointerMove={(event) =>
              onHoverPlanet(body.id, {
                x: event.clientX,
                y: event.clientY,
              })
            }
            type="button"
          />
        ))}
      </div>
    )
  },
}))

import { UniverseCanvas } from "@/components/site/life-universe/universe-canvas"

const planets: ReadonlyArray<PlanetUniverseBodyModel> = [
  {
    id: "planet-1",
    planetId: 1,
    slug: "work",
    name: "工作",
    summary: "工作与交付",
    description: "工作如何发生",
    level: 0,
    size: 86,
    tone: "cyan",
    orbit: {
      delaySeconds: -0.2,
      durationSeconds: 31,
      radius: 220,
      startAngle: 45,
    },
    rotation: { durationSeconds: 18 },
    publicMemoryCount: 2,
    assistantMemoryCount: 1,
  },
  {
    id: "planet-2",
    planetId: 2,
    slug: "life",
    name: "生活",
    summary: "生活与节奏",
    description: "日常生活感受",
    level: 0,
    size: 68,
    tone: "teal",
    orbit: {
      delaySeconds: 0.3,
      durationSeconds: 34,
      radius: 260,
      startAngle: 120,
    },
    rotation: { durationSeconds: 20 },
    publicMemoryCount: 1,
    assistantMemoryCount: 0,
  },
]

function buildProps(
  overrides: Partial<ComponentProps<typeof UniverseCanvas>> = {}
): ComponentProps<typeof UniverseCanvas> {
  return {
    planets,
    threeScene: buildMinimalThreeScene(planets),
    focusedPlanetId: "planet-1",
    hoveredPlanetId: undefined,
    relatedScopePlanetId: undefined,
    hoverPoint: undefined,
    detail: undefined,
    enteredPlanetId: undefined,
    zoom: 78,
    pan: { x: 0, y: 0 },
    isMotionPaused: false,
    viewState: "overview",
    onSelectPlanet: () => {},
    onAskTwinPlanet: () => {},
    onEnterPlanet: () => {},
    onHoverPlanet: () => {},
    onLeavePlanet: () => {},
    onShowRelatedPlanet: () => {},
    onPanChange: () => {},
    onWheelZoom: () => {},
    ...overrides,
  }
}

afterEach(() => {
  renderCounts.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("UniverseCanvas", () => {
  it("keeps WebGL scene and fallback accessibility styles available", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

    expect(css).toMatch(/\.minimal-three-scene\s*{[\s\S]*?width:\s*100%/)
    expect(css).toMatch(/\.minimal-three-scene\s*{[\s\S]*?height:\s*100%/)
    expect(css).toMatch(/\.minimal-three-scene\s*{[\s\S]*?radial-gradient/)
    expect(css).toMatch(
      /\.planet-accessibility-controls\s*{[\s\S]*?position:\s*absolute/
    )
    expect(css).toMatch(/\.planet-accessibility-controls\s*{[\s\S]*?inset:\s*0/)
    expect(css).toMatch(
      /\.planet-accessibility-controls\s*{[\s\S]*?pointer-events:\s*none/
    )
    expect(css).toMatch(/\.planet-orbit-system\s*{[\s\S]*?position:\s*absolute/)
    expect(css).toMatch(/\.planet-orbit-system\s*{[\s\S]*?inset:\s*0/)
    expect(css).toMatch(
      /\.planet-orbit-path\s*{[\s\S]*?--planet-orbit-diameter:\s*calc\(var\(--planet-orbit-radius\)\s*\*\s*2\)/
    )
    expect(css).toMatch(/\.planet-orbit-path\s*{[\s\S]*?border:/)
    expect(css).toMatch(/\.planet-body\s*{[\s\S]*?position:\s*absolute/)
    expect(css).toMatch(
      /\.planet-body\s*{[\s\S]*?width:\s*var\(--planet-size\)/
    )
    expect(css).toMatch(/\.planet-body\s*{[\s\S]*?animation:\s*planet-orbit/)
    expect(css).toMatch(
      /\.planet-body\s*{[\s\S]*?transform:\s*rotate\(var\(--planet-start-angle\)\)\s*translateX\(var\(--planet-orbit-radius\)\)/
    )
    expect(css).toMatch(/\.planet-sphere\s*{[\s\S]*?display:\s*block/)
    expect(css).toMatch(/\.planet-sphere\s*{[\s\S]*?animation:\s*planet-self-rotate/)
    expect(css).toMatch(/\.planet-sphere-cyan\s*{/)
    expect(css).toMatch(
      /\.planet-body\[data-render-level="point"\]\s*{[\s\S]*?(width|height|opacity|filter):/
    )
    expect(css).toMatch(
      /\.planet-body\[data-render-level="simple"\]\s*{[\s\S]*?(width|height|opacity|filter):/
    )
    expect(css).toMatch(
      /\.planet-accessibility-controls\s+\.planet-orbit-path\s*{[\s\S]*?opacity:\s*0/
    )
    expect(css).toMatch(
      /\.planet-accessibility-controls\s+\.planet-body\s*{[\s\S]*?pointer-events:\s*auto/
    )
    expect(css).toMatch(
      /\.planet-accessibility-controls\s+\.planet-body\s*{[\s\S]*?opacity:\s*0/
    )
    expect(css).toMatch(
      /\.planet-accessibility-controls\s+\.planet-body:focus-visible\s*{[\s\S]*?(opacity|outline|filter):/
    )
    expect(css).not.toMatch(/\.connection-line\s*{/)
    expect(css).not.toMatch(/\.constellation-node\s*{/)
    expect(css).toMatch(/\.planet-shade\s*{[\s\S]*?position:\s*absolute/)
    expect(css).toMatch(/\.planet-hover-preview\s*{[\s\S]*?position:\s*fixed/)
    expect(css).toMatch(
      /\.null-space-shell\[data-motion-paused="true"\]\s+\.planet-body\s*,[\s\S]*?animation-play-state:\s*paused/
    )
    expect(css).toMatch(
      /\.null-space-shell\[data-motion-paused="true"\]\s+\.planet-sphere[\s\S]*?animation-play-state:\s*paused/
    )
    expect(css).toMatch(/@keyframes\s+planet-orbit/)
    expect(css).toMatch(/@keyframes\s+planet-self-rotate/)
    expect(css).toMatch(/\[data-testid="mobile-planet-card"\]\s*{/)
    expect(css).toMatch(
      /\.null-space-shell\[data-related-scope="true"\]\s*\[data-testid="mobile-planet-card"\]\[data-related="false"\]\s*{[\s\S]*?display:\s*none/
    )
    expect(css).toMatch(/\[data-testid="mobile-planet-card"\]\s+button\s*{/)
    expect(css).not.toContain('data-testid="mobile-universe-card"')
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*?\.planet-body/
    )
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*?\.planet-sphere/
    )
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*?animation:\s*none/
    )
  })

  it("does not rerender memoized planets when parent callbacks change but planet state is stable", () => {
    const { rerender } = render(<UniverseCanvas {...buildProps()} />)

    expect(renderCounts.get("planet-1")).toBe(1)
    expect(renderCounts.get("planet-2")).toBe(1)

    rerender(
      <UniverseCanvas
        {...buildProps({
          onEnterPlanet: () => {},
          onAskTwinPlanet: () => {},
          onHoverPlanet: () => {},
          onLeavePlanet: () => {},
          onSelectPlanet: () => {},
          onShowRelatedPlanet: () => {},
          onWheelZoom: () => {},
        })}
      />
    )

    expect(renderCounts.get("planet-1")).toBe(1)
    expect(renderCounts.get("planet-2")).toBe(1)
  })

  it("marks related scope state on the viewport and planets", () => {
    const { container, getByTestId } = render(
      <UniverseCanvas {...buildProps({ relatedScopePlanetId: "planet-1" })} />
    )

    expect(getByTestId("universe-viewport")).toHaveAttribute(
      "data-related-scope",
      "true"
    )
    expect(container.querySelector('[data-related="true"]')).toBeTruthy()
    expect(container.querySelector('[data-related="false"]')).toBeTruthy()
  })

  it("renders the mocked three scene with all scene bodies and keeps DOM fallback controls", () => {
    const { container, getByRole, getByTestId } = render(
      <UniverseCanvas
        {...buildProps({
          hoveredPlanetId: "planet-1",
          hoverPoint: { x: 320, y: 220 },
          isMotionPaused: true,
        })}
      />
    )

    expect(getByTestId("mock-minimal-three-scene")).toHaveAttribute(
      "data-body-count",
      "2"
    )
    expect(container.querySelector(".minimal-three-scene")).toBeTruthy()
    expect(container.querySelector(".planet-accessibility-controls")).toBeTruthy()
    expect(container.querySelector(".planet-orbit-system")).toBeTruthy()
    expect(container.querySelectorAll(".planet-orbit-path")).toHaveLength(2)
    expect(getByTestId("universe-viewport")).toHaveAttribute(
      "data-motion-paused",
      "true"
    )
    expect(getByRole("dialog", { name: "工作 预览" })).toHaveTextContent(
      "工作与交付"
    )
  })

  it("bridges hover, leave, and enter events from the scene mock", () => {
    const onHoverPlanet = vi.fn()
    const onLeavePlanet = vi.fn()
    const onEnterPlanet = vi.fn()

    render(
      <UniverseCanvas
        {...buildProps({
          onHoverPlanet,
          onLeavePlanet,
          onEnterPlanet,
        })}
      />
    )

    fireEvent.pointerMove(screen.getByTestId("mock-scene-planet-planet-1"), {
      clientX: 123,
      clientY: 234,
    })
    fireEvent.pointerLeave(screen.getByTestId("mock-scene-planet-planet-1"))
    fireEvent.doubleClick(screen.getByTestId("mock-scene-planet-planet-1"))

    expect(onHoverPlanet).toHaveBeenCalledWith("planet-1", { x: 123, y: 234 })
    expect(onLeavePlanet).toHaveBeenCalledWith("planet-1")
    expect(onEnterPlanet).toHaveBeenCalledWith("planet-1")
  })

  it("keeps hover preview and detail behavior through the DOM fallback controls", () => {
    const onHoverPlanet = vi.fn()
    const onLeavePlanet = vi.fn()
    const onEnterPlanet = vi.fn()
    const onSelectPlanet = vi.fn()

    render(
      <UniverseCanvas
        {...buildProps({
          onHoverPlanet,
          onLeavePlanet,
          onEnterPlanet,
          onSelectPlanet,
        })}
      />
    )

    const fallbackPlanet = screen.getByRole("button", { name: "工作 行星" })

    fireEvent.focus(fallbackPlanet)
    fireEvent.pointerMove(fallbackPlanet, { clientX: 321, clientY: 222 })
    fireEvent.click(fallbackPlanet)
    fireEvent.doubleClick(fallbackPlanet)
    fireEvent.blur(fallbackPlanet)

    expect(onHoverPlanet).toHaveBeenCalledWith("planet-1", { x: 0, y: 0 })
    expect(onHoverPlanet).toHaveBeenCalledWith("planet-1", { x: 321, y: 222 })
    expect(onSelectPlanet).toHaveBeenCalledWith("planet-1", { x: 0, y: 0 })
    expect(onEnterPlanet).toHaveBeenCalledWith("planet-1")
    expect(onLeavePlanet).toHaveBeenCalledWith("planet-1")
  })

  it("cancels trackpad pinch wheel events on the canvas before the browser can zoom the page", () => {
    const addEventListenerSpy = vi.spyOn(
      HTMLElement.prototype,
      "addEventListener"
    )
    const onWheelZoom = vi.fn()
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    const { getByRole } = render(
      <UniverseCanvas {...buildProps({ onWheelZoom })} />
    )
    const canvas = getByRole("region", { name: "空境宇宙画布" })

    const hasNonPassiveCanvasWheelListener =
      addEventListenerSpy.mock.calls.some(
        ([eventName, , options], index) =>
          addEventListenerSpy.mock.contexts[index] === canvas &&
          eventName === "wheel" &&
          typeof options === "object" &&
          options !== null &&
          "passive" in options &&
          options.passive === false
      )
    expect(hasNonPassiveCanvasWheelListener).toBe(true)

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      deltaY: -40,
    })
    let dispatchResult = true
    act(() => {
      dispatchResult = canvas.dispatchEvent(event)
    })

    expect(dispatchResult).toBe(false)
    expect(event.defaultPrevented).toBe(true)
    expect(onWheelZoom).toHaveBeenCalledWith(-40)
  })
})
