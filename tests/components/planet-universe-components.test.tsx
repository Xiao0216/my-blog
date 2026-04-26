import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type {
  PlanetPreviewModel,
  PlanetUniverseBodyModel,
} from "@/components/site/life-universe/types"
import { PlanetBody } from "@/components/site/life-universe/planet-body"
import { PlanetHoverPreview } from "@/components/site/life-universe/planet-hover-preview"

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

const preview: PlanetPreviewModel = {
  title: "工作与职业",
  meta: "2 条公开记忆 · 1 条助手记忆",
  summary: "工作、项目和职业成长。",
  hint: "双击进入行星",
}

describe("PlanetBody", () => {
  it('renders a focusable button named "工作与职业 行星"', () => {
    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={vi.fn()}
        onHover={vi.fn()}
        onLeave={vi.fn()}
        onSelect={vi.fn()}
      />
    )

    const body = screen.getByRole("button", { name: "工作与职业 行星" })

    expect(body).toHaveAttribute("data-planet-id", "planet-1")
    expect(body).toHaveProperty("tabIndex", 0)
  })

  it('pointerMove calls onHover("planet-1", { x: clientX, y: clientY })', () => {
    const onHover = vi.fn()

    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={vi.fn()}
        onHover={onHover}
        onLeave={vi.fn()}
        onSelect={vi.fn()}
      />
    )

    fireEvent.pointerMove(screen.getByRole("button"), {
      clientX: 123,
      clientY: 456,
    })

    expect(onHover).toHaveBeenCalledWith("planet-1", { x: 123, y: 456 })
  })

  it('click calls onSelect("planet-1", point)', () => {
    const onSelect = vi.fn()

    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={vi.fn()}
        onHover={vi.fn()}
        onLeave={vi.fn()}
        onSelect={onSelect}
      />
    )

    fireEvent.click(screen.getByRole("button"))

    expect(onSelect).toHaveBeenCalledWith("planet-1", { x: 0, y: 0 })
  })

  it('doubleClick calls onEnter("planet-1")', () => {
    const onEnter = vi.fn()

    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={onEnter}
        onHover={vi.fn()}
        onLeave={vi.fn()}
        onSelect={vi.fn()}
      />
    )

    fireEvent.doubleClick(screen.getByRole("button"))

    expect(onEnter).toHaveBeenCalledWith("planet-1")
  })

  it('pointerLeave calls onLeave("planet-1")', () => {
    const onLeave = vi.fn()

    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={vi.fn()}
        onHover={vi.fn()}
        onLeave={onLeave}
        onSelect={vi.fn()}
      />
    )

    fireEvent.pointerLeave(screen.getByRole("button"))

    expect(onLeave).toHaveBeenCalledWith("planet-1")
  })

  it("calls onHover on focus and onLeave on blur", () => {
    const onHover = vi.fn()
    const onLeave = vi.fn()

    render(
      <PlanetBody
        planet={planet}
        isFocused={false}
        isHovered={false}
        renderLevel="full"
        onEnter={vi.fn()}
        onHover={onHover}
        onLeave={onLeave}
        onSelect={vi.fn()}
      />
    )

    const body = screen.getByRole("button", { name: "工作与职业 行星" })

    fireEvent.focus(body)
    fireEvent.blur(body)

    expect(onHover).toHaveBeenCalledWith("planet-1", { x: 0, y: 0 })
    expect(onLeave).toHaveBeenCalledWith("planet-1")
  })
})

describe("PlanetHoverPreview", () => {
  it('renders role dialog named "工作与职业 预览"', () => {
    render(
      <PlanetHoverPreview
        anchor={{ x: 300, y: 240 }}
        preview={preview}
        onEnter={vi.fn()}
      />
    )

    const dialog = screen.getByRole("dialog", { name: "工作与职业 预览" })

    expect(dialog).toHaveTextContent(preview.summary)
    expect(dialog).toHaveStyle({ left: "300px", top: "240px" })
    expect(
      screen.getByRole("button", { name: "进入 工作与职业" })
    ).toBeInTheDocument()
  })

  it('the "进入 工作与职业" button calls onEnter', () => {
    const onEnter = vi.fn()

    render(
      <PlanetHoverPreview
        anchor={{ x: 300, y: 240 }}
        preview={preview}
        onEnter={onEnter}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "进入 工作与职业" }))

    expect(onEnter).toHaveBeenCalledWith()
  })
})
