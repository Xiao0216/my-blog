import type { ComponentProps } from "react"

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { HomePageView } from "@/components/site/home-page-view"

type HomePageViewProps = ComponentProps<typeof HomePageView>
type LayoutRect = {
  height: number
  status: string
  width: number
  x: number
  y: number
}

const LAYOUT_MARGIN = 32

function buildProps(
  overrides: Partial<HomePageViewProps> = {}
): HomePageViewProps {
  return {
    profile: {
      heroTitle: "Fixture hero title",
      heroIntro: "Fixture hero intro",
      aboutSummary: "Fixture about summary",
    },
    notes: [
      {
        slug: "note-1",
        title: "Note fixture",
        body: "A short note body",
        publishedAt: "2026-03-01",
      },
      {
        slug: "note-2",
        title: "Second note fixture",
        body: "A second note body",
        publishedAt: "2026-03-03",
      },
      {
        slug: "note-3",
        title: "Third note fixture",
        body: "A third note body",
        publishedAt: "2026-03-04",
      },
    ],
    essays: [
      {
        slug: "essay-1",
        title: "Essay fixture",
        description: "A short essay description",
        publishedAt: "2026-03-02",
      },
    ],
    projects: [
      {
        slug: "project-1",
        title: "Project fixture",
        description: "A short project description",
        note: "A project note",
      },
    ],
    planets: [
      {
        id: 1,
        slug: "work",
        name: "Work",
        summary: "Work and delivery",
        description: "How work happens",
        x: 120,
        y: -80,
        size: "large",
        theme: "cyan",
        status: "published",
        sortOrder: 1,
        weight: 9,
      },
      {
        id: 2,
        slug: "life",
        name: "Life",
        summary: "Life and rhythm",
        description: "How daily life feels",
        x: -180,
        y: 120,
        size: "medium",
        theme: "teal",
        status: "published",
        sortOrder: 2,
        weight: 8,
      },
      {
        id: 3,
        slug: "ideas",
        name: "Ideas",
        summary: "Ideas and synthesis",
        description: "Where ideas connect",
        x: 40,
        y: 150,
        size: "medium",
        theme: "violet",
        status: "published",
        sortOrder: 3,
        weight: 7,
      },
      {
        id: 4,
        slug: "systems",
        name: "Systems",
        summary: "Systems and operations",
        description: "Operational habits",
        x: -60,
        y: -40,
        size: "medium",
        theme: "emerald",
        status: "published",
        sortOrder: 4,
        weight: 6,
      },
      {
        id: 5,
        slug: "writing",
        name: "Writing",
        summary: "Writing and narrative",
        description: "Publishing practice",
        x: 200,
        y: 90,
        size: "medium",
        theme: "blue",
        status: "published",
        sortOrder: 5,
        weight: 5,
      },
      {
        id: 6,
        slug: "research",
        name: "Research",
        summary: "Research and signals",
        description: "What to explore next",
        x: -220,
        y: 60,
        size: "medium",
        theme: "cyan",
        status: "published",
        sortOrder: 6,
        weight: 4,
      },
    ],
    memories: [
      {
        id: 1,
        planetId: 1,
        planetSlug: "work",
        planetName: "Work",
        title: "Direct engineering style",
        content: "I prefer direct, practical engineering notes.",
        type: "preference",
        occurredAt: "2026-04-24",
        visibility: "public",
        importance: 9,
        tags: ["engineering"],
        source: "fixture",
      },
    ],
    twinIdentity: {
      displayName: "Fixture Twin",
      subtitle: "Fixture digital twin",
      avatarDescription: "Fixture avatar",
      firstPersonStyle: "First person fixture style",
      thirdPersonStyle: "Proxy fixture style",
      values: ["Clarity"],
      communicationRules: ["Be direct"],
      privacyRules: ["No private memory"],
      uncertaintyRules: ["State uncertainty"],
    },
    ...overrides,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

function parseLayoutRect(card: HTMLElement): LayoutRect {
  return {
    height: Number(card.getAttribute("data-layout-height")),
    status: card.getAttribute("data-layout-status") ?? "",
    width: Number(card.getAttribute("data-layout-width")),
    x: Number(card.getAttribute("data-layout-x")),
    y: Number(card.getAttribute("data-layout-y")),
  }
}

function cardsOverlap(first: LayoutRect, second: LayoutRect, margin = LAYOUT_MARGIN) {
  return !(
    first.x + first.width + margin < second.x - margin ||
    second.x + second.width + margin < first.x - margin ||
    first.y + first.height + margin < second.y - margin ||
    second.y + second.height + margin < first.y - margin
  )
}

describe("HomePageView", () => {
  it("renders the Null Space workbench and digital twin console", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(screen.getByText("Null Space")).toBeInTheDocument()
    expect(screen.getByText("A Thoughtful Blog")).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Null Space universe canvas" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("complementary", { name: "Null AI digital twin" })
    ).toHaveTextContent("Fixture Twin")
    expect(screen.getByRole("button", { name: "聚焦 Work" })).toBeInTheDocument()
    expect(screen.getAllByText("构建你的数字花园").length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: "发送给 Null AI" })).toBeInTheDocument()
    expect(container.querySelector('[data-universe-lines="true"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })

  it("focuses constellation cards when they are selected", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.click(screen.getByRole("button", { name: "聚焦 Life" }))

    expect(screen.getByTestId("selected-card-title")).toHaveTextContent("Life")
    expect(screen.getByRole("button", { name: "聚焦 Life" })).toHaveAttribute(
      "data-selected",
      "true"
    )
    expect(screen.getByRole("button", { name: "聚焦 Work" })).toHaveAttribute(
      "data-selected",
      "false"
    )
  })

  it("shows persistent 3D posture and focus actions for the selected card", () => {
    render(<HomePageView {...buildProps()} />)

    const workCard = screen.getByRole("button", { name: "聚焦 Work" })

    fireEvent.click(workCard)

    expect(workCard.getAttribute("style")).toContain("--card-rotate-x")
    expect(workCard.getAttribute("style")).toContain("--card-rotate-y")
    expect(workCard.getAttribute("style")).toContain("--card-depth")

    expect(screen.getByRole("button", { name: "进入 Work" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "询问 Work" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "查看 Work 关联" })).toBeInTheDocument()
  })

  it("enters a planet detail overlay on double click and returns to the universe", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Work" }))

    const dialog = screen.getByRole("dialog", { name: "Work 行星详情" })

    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog.closest('[data-testid="universe-viewport"]')).toBeNull()
    expect(screen.getByText("概览")).toBeInTheDocument()
    expect(screen.getByText("最近变化")).toBeInTheDocument()
    expect(screen.getByText("关键记忆")).toBeInTheDocument()
    expect(screen.getByText("关联内容")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "返回宇宙" })).toHaveFocus()
    expect(screen.getByTestId("null-space-shell")).toHaveAttribute("data-view-state", "inside")

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
    render(<HomePageView {...buildProps({ memories: [] })} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Work" }))

    expect(
      screen.getByText("最近还没有公开记忆，但这个行星已经可以承载你的行为记录。")
    ).toBeInTheDocument()
  })

  it("shows only public memories for the entered planet", () => {
    render(
      <HomePageView
        {...buildProps({
          memories: [
            {
              id: 1,
              planetId: 1,
              planetSlug: "work",
              planetName: "Work",
              title: "Work memory",
              content: "Work detail",
              type: "preference",
              occurredAt: "2026-04-24",
              visibility: "public",
              importance: 9,
              tags: ["work"],
              source: "fixture",
            },
            {
              id: 2,
              planetId: 2,
              planetSlug: "life",
              planetName: "Life",
              title: "Life memory",
              content: "Life detail",
              type: "preference",
              occurredAt: "2026-04-24",
              visibility: "public",
              importance: 8,
              tags: ["life"],
              source: "fixture",
            },
          ],
        })}
      />
    )

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 Life" }))

    expect(screen.getByText("Life memory")).toBeInTheDocument()
    expect(screen.queryByText("Work memory")).not.toBeInTheDocument()
  })

  it("keeps the selected card action group inside the viewport for right-edge cards", () => {
    render(<HomePageView {...buildProps()} />)

    const cards = screen.getAllByTestId("universe-card")
    const rightMostCard = cards.reduce((currentRightMost, card) => {
      const currentRightEdge =
        Number(currentRightMost.getAttribute("data-layout-x")) +
        Number(currentRightMost.getAttribute("data-layout-width"))
      const nextRightEdge =
        Number(card.getAttribute("data-layout-x")) + Number(card.getAttribute("data-layout-width"))

      return nextRightEdge > currentRightEdge ? card : currentRightMost
    })

    fireEvent.click(rightMostCard)

    const actionGroup = screen.getByTestId("planet-action-group")
    const actionGroupX = Number(actionGroup.getAttribute("data-layout-x"))
    const actionGroupWidth = 180

    expect(actionGroupX).toBeGreaterThanOrEqual(0)
    expect(actionGroupX).toBeLessThanOrEqual(960 - actionGroupWidth)
    expect(actionGroupX + actionGroupWidth).toBeLessThanOrEqual(960)
  })

  it("zooms and resets the universe canvas", () => {
    render(<HomePageView {...buildProps()} />)

    expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")

    fireEvent.click(screen.getByRole("button", { name: "放大画布" }))
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("88%")

    fireEvent.click(screen.getByRole("button", { name: "缩小画布" }))
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")

    fireEvent.click(screen.getByRole("button", { name: "重置画布视角" }))
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")
  })

  it("switches between dark and light Null Space themes", () => {
    render(<HomePageView {...buildProps()} />)

    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-theme",
      "dark"
    )

    fireEvent.click(screen.getByRole("button", { name: "切换白天模式" }))

    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-theme",
      "light"
    )
    expect(screen.getByRole("button", { name: "切换黑夜模式" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "切换黑夜模式" }))

    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-theme",
      "dark"
    )
  })

  it("supports wheel zoom and drag panning on the universe canvas", () => {
    render(<HomePageView {...buildProps()} />)

    const canvas = screen.getByRole("region", {
      name: "Null Space universe canvas",
    })
    const viewport = screen.getByTestId("universe-viewport")

    fireEvent.wheel(canvas, { deltaY: -120 })
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("86%")

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 120 })
    fireEvent.mouseMove(canvas, { clientX: 136, clientY: 158 })
    fireEvent.mouseUp(canvas)

    expect(viewport).toHaveStyle({
      transform: "translate(calc(-50% + 36px), calc(-50% + 38px)) scale(1.1025641025641026)",
    })

    fireEvent.click(screen.getByRole("button", { name: "重置画布视角" }))
    expect(viewport).toHaveStyle({
      transform: "translate(calc(-50% + 0px), calc(-50% + 0px)) scale(1)",
    })
  })

  it("renders card maturity states and material tilt feedback", () => {
    render(<HomePageView {...buildProps()} />)

    const gardenCard = screen.getByRole("button", { name: "聚焦 构建你的数字花园" })
    const noteCard = screen.getByRole("button", { name: "聚焦 Note fixture" })

    expect(gardenCard).toHaveAttribute("data-status", "mature")
    expect(noteCard).toHaveAttribute("data-status", "seedling")

    fireEvent.mouseMove(gardenCard, { clientX: 80, clientY: 70 })

    expect(gardenCard).toHaveStyle({
      "--tilt-x": "8deg",
      "--tilt-y": "-8deg",
    })

    fireEvent.mouseLeave(gardenCard)

    expect(gardenCard).toHaveStyle({
      "--tilt-x": "0deg",
      "--tilt-y": "0deg",
    })
  })

  it("renders layout-driven cards without overlap metadata collisions", () => {
    render(<HomePageView {...buildProps()} />)

    const cards = screen.getAllByTestId("universe-card")
    const layoutRects = cards.map(parseLayoutRect)

    expect(cards.length).toBeGreaterThan(8)
    expect(cards.every((card) => card.getAttribute("data-ring"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-x"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-y"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-width"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-height"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-status"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-status") !== "overlap-fallback")).toBe(
      true
    )

    for (let index = 0; index < layoutRects.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < layoutRects.length; nextIndex += 1) {
        expect(cardsOverlap(layoutRects[index], layoutRects[nextIndex])).toBe(false)
      }
    }
  })

  it("renders stable Null Space empty states when planets and memories are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          planets: [],
          memories: [],
        })}
      />
    )

    expect(screen.getByText("No planets in this universe yet")).toBeInTheDocument()
    expect(screen.getByText("No public memories attached yet")).toBeInTheDocument()
  })

  it("renders content counts in the bottom status line", () => {
    render(<HomePageView {...buildProps()} />)

    expect(screen.getByText("1 文章")).toBeInTheDocument()
    expect(screen.getByText("6 连接")).toBeInTheDocument()
    expect(screen.getByText("无限可能")).toBeInTheDocument()
  })

  it("sends twin chat messages and renders references", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: "AI fixture reply",
        mode: "fallback",
        references: [
          {
            kind: "memory",
            id: "memory-1",
            title: "Memory fixture",
            excerpt: "Reference excerpt",
          },
        ],
      }),
    })
    vi.stubGlobal("fetch", fetchMock)
    render(<HomePageView {...buildProps()} />)

    fireEvent.change(screen.getByPlaceholderText("和 Null AI 聊聊..."), {
      target: { value: "你好" },
    })
    fireEvent.click(screen.getByRole("button", { name: "发送给 Null AI" }))

    expect(screen.getByText("思考中")).toBeInTheDocument()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/twin/chat",
        expect.objectContaining({ method: "POST" })
      )
    })
    expect(await screen.findByText("AI fixture reply")).toBeInTheDocument()
    expect(screen.getByText("Memory fixture")).toBeInTheDocument()
  })
})
