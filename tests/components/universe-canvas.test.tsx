import type { ComponentProps } from "react"

import { act, render } from "@testing-library/react"
import { memo } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { UniverseCardModel } from "@/components/site/life-universe/types"

const { renderCounts } = vi.hoisted(() => ({
  renderCounts: new Map<string, number>(),
}))

vi.mock("@/components/site/life-universe/universe-card", () => ({
  UniverseCard: memo(function MockUniverseCard({
    card,
    isRelated,
  }: {
    readonly card: UniverseCardModel
    readonly isEntered?: boolean
    readonly isRelated?: boolean
    readonly isSelected: boolean
    readonly onEnter: (cardId: string) => void
    readonly onHover: (cardId: string) => void
    readonly onSelect: (cardId: string) => void
  }) {
    renderCounts.set(card.id, (renderCounts.get(card.id) ?? 0) + 1)

    return (
      <button type="button" data-related={isRelated ? "true" : "false"}>
        {card.title}
      </button>
    )
  }),
}))

import { UniverseCanvas } from "@/components/site/life-universe/universe-canvas"

const cards: ReadonlyArray<UniverseCardModel> = [
  {
    id: "card-1",
    kind: "planet",
    group: "planet",
    importance: 10,
    width: 180,
    height: 120,
    x: 120,
    y: 80,
    ring: 1,
    angle: 45,
    posture: { rotateX: 2, rotateY: -4, rotateZ: 1, translateZ: 20 },
    layoutStatus: "placed",
    category: "行星",
    title: "卡片一",
    excerpt: "第一张卡片",
    date: "2026-04-24",
    tone: "cyan",
    status: "mature",
  },
  {
    id: "card-2",
    kind: "note",
    group: "note",
    importance: 6,
    width: 140,
    height: 96,
    x: 360,
    y: 220,
    ring: 2,
    angle: 90,
    posture: { rotateX: -1, rotateY: 3, rotateZ: -2, translateZ: 8 },
    layoutStatus: "placed",
    category: "笔记",
    title: "卡片二",
    excerpt: "第二张卡片",
    date: "2026-04-23",
    tone: "violet",
    status: "seedling",
  },
]

function buildProps(
  overrides: Partial<ComponentProps<typeof UniverseCanvas>> = {}
): ComponentProps<typeof UniverseCanvas> {
  return {
    cards,
    selectedCardId: "card-1",
    relatedScopeCardId: undefined,
    detail: undefined,
    enteredCardId: undefined,
    zoom: 78,
    pan: { x: 0, y: 0 },
    hasPlanets: true,
    viewState: "overview",
    onSelectCard: () => {},
    onAskTwin: () => {},
    onEnterCard: () => {},
    onPanChange: () => {},
    onShowRelated: () => {},
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
  it("does not rerender memoized cards when parent callbacks change but card state is stable", () => {
    const { rerender } = render(<UniverseCanvas {...buildProps()} />)

    expect(renderCounts.get("card-1")).toBe(1)
    expect(renderCounts.get("card-2")).toBe(1)

    rerender(
      <UniverseCanvas
        {...buildProps({
          onAskTwin: () => {},
          onEnterCard: () => {},
          onSelectCard: () => {},
          onShowRelated: () => {},
          onWheelZoom: () => {},
        })}
      />
    )

    expect(renderCounts.get("card-1")).toBe(1)
    expect(renderCounts.get("card-2")).toBe(1)
  })

  it("marks related scope state on the viewport and cards", () => {
    const { container, getByTestId } = render(
      <UniverseCanvas {...buildProps({ relatedScopeCardId: "card-1" })} />
    )

    expect(getByTestId("universe-viewport")).toHaveAttribute("data-related-scope", "true")
    expect(container.querySelector('[data-related="true"]')).toBeTruthy()
    expect(container.querySelector('[data-related="false"]')).toBeTruthy()
  })

  it("cancels trackpad pinch wheel events on the canvas before the browser can zoom the page", () => {
    const addEventListenerSpy = vi.spyOn(HTMLElement.prototype, "addEventListener")
    const onWheelZoom = vi.fn()
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    const { getByRole } = render(
      <UniverseCanvas {...buildProps({ onWheelZoom })} />
    )
    const canvas = getByRole("region", { name: "空境宇宙画布" })

    const hasNonPassiveCanvasWheelListener = addEventListenerSpy.mock.calls.some(
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
