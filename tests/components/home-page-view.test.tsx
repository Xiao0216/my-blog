import type { ComponentProps } from "react"

import { within } from "@testing-library/dom"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { HomePageView } from "@/components/site/home-page-view"
import { LIFE_UNIVERSE_GALAXIES } from "@/lib/life-universe/taxonomy"

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
      heroTitle: "测试首页标题",
      heroIntro: "测试首页简介",
      aboutSummary: "测试关于摘要",
    },
    notes: [
      {
        slug: "note-1",
        title: "笔记样例",
        body: "一段简短笔记内容",
        publishedAt: "2026-03-01",
      },
      {
        slug: "note-2",
        title: "第二条笔记样例",
        body: "第二段笔记内容",
        publishedAt: "2026-03-03",
      },
      {
        slug: "note-3",
        title: "第三条笔记样例",
        body: "第三段笔记内容",
        publishedAt: "2026-03-04",
      },
    ],
    essays: [
      {
        slug: "essay-1",
        title: "文章样例",
        description: "一段文章摘要",
        publishedAt: "2026-03-02",
      },
    ],
    projects: [
      {
        slug: "project-1",
        title: "项目样例",
        description: "一段项目描述",
        note: "项目备注",
      },
    ],
    planets: [
      {
        id: 1,
        slug: "work",
        name: "工作",
        summary: "工作与交付",
        description: "工作如何发生",
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
        name: "生活",
        summary: "生活与节奏",
        description: "日常生活感受",
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
        name: "想法",
        summary: "想法与综合",
        description: "想法连接的地方",
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
        name: "系统",
        summary: "系统与运行",
        description: "运行习惯",
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
        name: "写作",
        summary: "写作与叙事",
        description: "发布练习",
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
        name: "研究",
        summary: "研究与信号",
        description: "下一步探索方向",
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
        planetName: "工作",
        title: "直接的工程风格",
        content: "我偏好直接、务实的工程笔记。",
        type: "preference",
        occurredAt: "2026-04-24",
        visibility: "public",
        importance: 9,
        tags: ["工程"],
        source: "夹具",
      },
    ],
    twinIdentity: {
      displayName: "测试分身",
      subtitle: "测试数字分身",
      avatarDescription: "测试头像",
      firstPersonStyle: "第一人称测试风格",
      thirdPersonStyle: "代理测试风格",
      values: ["清晰"],
      communicationRules: ["直接表达"],
      privacyRules: ["不使用私密记忆"],
      uncertaintyRules: ["说明不确定性"],
    },
    ...overrides,
  }
}

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

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
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

function cardsOverlap(
  first: LayoutRect,
  second: LayoutRect,
  margin = LAYOUT_MARGIN
) {
  return !(
    first.x + first.width + margin < second.x - margin ||
    second.x + second.width + margin < first.x - margin ||
    first.y + first.height + margin < second.y - margin ||
    second.y + second.height + margin < first.y - margin
  )
}

describe("HomePageView", () => {
  it("renders the seven taxonomy galaxies without changing homepage controls", () => {
    render(<HomePageView {...buildProps({ planets: buildGalaxyPlanets() })} />)

    for (const galaxy of LIFE_UNIVERSE_GALAXIES) {
      expect(
        screen.getByRole("button", { name: `聚焦 ${galaxy.name}` })
      ).toBeInTheDocument()
    }

    expect(screen.getByRole("button", { name: "搜索空间" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "筛选空间" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "新建" })).toHaveAttribute(
      "href",
      "/admin/inbox"
    )
    expect(screen.getByRole("button", { name: "抓手模式" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "画布搜索" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "连接视图" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "展开数字分身" })
    ).toBeInTheDocument()
  })

  it("renders the localized workbench and embedded twin orb", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(screen.getByText("空境")).toBeInTheDocument()
    expect(screen.getByText("思考型博客")).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "空境宇宙画布" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("complementary", { name: "数字分身" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "聚焦 工作" })
    ).toBeInTheDocument()
    expect(screen.getAllByText("构建你的数字花园").length).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: "展开数字分身" })
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-universe-lines="true"]')
    ).toHaveAttribute("aria-hidden", "true")
  })

  it("focuses constellation cards when they are selected", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.click(screen.getByRole("button", { name: "聚焦 生活" }))

    expect(screen.getByTestId("selected-card-title")).toHaveTextContent("生活")
    expect(screen.getByRole("button", { name: "聚焦 生活" })).toHaveAttribute(
      "data-selected",
      "true"
    )
    expect(screen.getByRole("button", { name: "聚焦 工作" })).toHaveAttribute(
      "data-selected",
      "false"
    )
  })

  it("shows persistent 3D posture and opens selected card actions from the menu button", () => {
    render(<HomePageView {...buildProps()} />)

    const workCard = screen.getByRole("button", { name: "聚焦 工作" })

    fireEvent.click(workCard)

    expect(workCard.getAttribute("style")).toContain("--card-rotate-x")
    expect(workCard.getAttribute("style")).toContain("--card-rotate-y")
    expect(workCard.getAttribute("style")).toContain("--card-depth")

    expect(screen.queryByTestId("planet-action-group")).not.toBeInTheDocument()
    fireEvent.mouseEnter(workCard)
    expect(screen.queryByTestId("planet-action-group")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "打开 工作 操作菜单" }))

    expect(screen.getByRole("menu", { name: "工作 操作" })).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: "进入 工作" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: "询问 工作" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: "查看 工作 关联" })
    ).toBeInTheDocument()
  })

  it("enters a planet detail overlay on double click and returns to the universe", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))

    const dialog = screen.getByRole("dialog", { name: "工作 行星详情" })

    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog.closest('[data-testid="universe-viewport"]')).toBeNull()
    expect(screen.getByText("概览")).toBeInTheDocument()
    expect(screen.getByText("最近变化")).toBeInTheDocument()
    expect(screen.getByText("关键记忆")).toBeInTheDocument()
    expect(screen.getByText("关联内容")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "返回宇宙" })).toHaveFocus()
    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-view-state",
      "inside"
    )

    fireEvent.click(screen.getByRole("button", { name: "返回宇宙" }))

    expect(
      screen.queryByRole("dialog", { name: "工作 行星详情" })
    ).not.toBeInTheDocument()
    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-view-state",
      "overview"
    )
  })

  it("moves the camera during planet entry and restores it on return", () => {
    render(<HomePageView {...buildProps()} />)

    const viewport = screen.getByTestId("universe-viewport")
    expect(viewport).toHaveAttribute("data-camera-mode", "overview")

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))

    expect(viewport).toHaveAttribute("data-camera-mode", "inside")

    fireEvent.click(screen.getByRole("button", { name: "返回宇宙" }))

    expect(viewport).toHaveAttribute("data-camera-mode", "overview")
  })

  it("uses Escape to collapse the digital twin before leaving planet detail", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))
    fireEvent.click(screen.getByRole("button", { name: "问分身" }))

    expect(
      screen.getByRole("dialog", { name: "数字分身对话" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("dialog", { name: "工作 行星详情" })
    ).not.toHaveAttribute("aria-modal", "true")

    fireEvent.keyDown(window, { key: "Escape" })

    expect(
      screen.queryByRole("dialog", { name: "数字分身对话" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("dialog", { name: "工作 行星详情" })
    ).toHaveAttribute("aria-modal", "true")

    fireEvent.keyDown(window, { key: "Escape" })

    expect(
      screen.queryByRole("dialog", { name: "工作 行星详情" })
    ).not.toBeInTheDocument()
  })

  it("renders polished fallback detail content when public memory data is empty", () => {
    render(<HomePageView {...buildProps({ memories: [] })} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))

    expect(
      screen.getByText(
        "最近还没有公开记忆，但这个行星已经可以承载你的行为记录。"
      )
    ).toBeInTheDocument()
  })

  it("exposes an enabled full-page link for detail cards with real routes", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(
      screen.getByRole("button", { name: "聚焦 文章样例" })
    )

    expect(screen.getByRole("link", { name: "打开完整页" })).toHaveAttribute(
      "href",
      "/essays/essay-1"
    )
  })

  it("applies a related-only state when the detail overlay requests related content", async () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))
    fireEvent.click(screen.getByRole("button", { name: "只看关联" }))

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "工作 行星详情" })
      ).not.toBeInTheDocument()
    })

    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-related-scope",
      "true"
    )
    expect(screen.getByTestId("universe-viewport")).toHaveAttribute(
      "data-related-scope",
      "true"
    )
    expect(screen.getByRole("button", { name: "聚焦 工作" })).toHaveAttribute(
      "data-related",
      "true"
    )
    expect(screen.getByRole("button", { name: "聚焦 生活" })).toHaveAttribute(
      "data-related",
      "false"
    )
    expect(
      container.querySelector(
        '[data-testid="mobile-universe-card"][data-card-id="planet-1"]'
      )
    ).toHaveAttribute("data-related", "true")
    expect(
      container.querySelector(
        '[data-testid="mobile-universe-card"][data-card-id="planet-2"]'
      )
    ).toHaveAttribute("data-related", "false")
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
              planetName: "工作",
              title: "工作记忆",
              content: "工作详情",
              type: "preference",
              occurredAt: "2026-04-24",
              visibility: "public",
              importance: 9,
              tags: ["work"],
              source: "夹具",
            },
            {
              id: 2,
              planetId: 2,
              planetSlug: "life",
              planetName: "生活",
              title: "生活记忆",
              content: "生活详情",
              type: "preference",
              occurredAt: "2026-04-24",
              visibility: "public",
              importance: 8,
              tags: ["life"],
              source: "夹具",
            },
          ],
        })}
      />
    )

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 生活" }))

    expect(screen.getByText("生活记忆")).toBeInTheDocument()
    expect(screen.queryByText("工作记忆")).not.toBeInTheDocument()
  })

  it("keeps overlay wheel and drag interactions from mutating the canvas state", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))

    const dialog = screen.getByRole("dialog", { name: "工作 行星详情" })
    const viewport = screen.getByTestId("universe-viewport")
    const zoomValue = screen.getByTestId("zoom-value")
    const initialZoom = zoomValue.textContent
    const initialTransform = viewport.getAttribute("style")

    fireEvent.wheel(dialog, { deltaY: -120 })
    fireEvent.mouseDown(dialog, { clientX: 100, clientY: 120 })
    fireEvent.mouseMove(dialog, { clientX: 136, clientY: 158 })
    fireEvent.mouseUp(dialog)

    expect(zoomValue).toHaveTextContent(initialZoom ?? "")
    expect(viewport.getAttribute("style")).toBe(initialTransform)
  })

  it("isolates background controls while the detail overlay is open", () => {
    render(<HomePageView {...buildProps()} />)

    fireEvent.doubleClick(screen.getByRole("button", { name: "聚焦 工作" }))

    const interactiveShell = screen.getByTestId("universe-interactive-shell")

    expect(screen.getByRole("button", { name: "返回宇宙" })).toHaveFocus()
    expect(interactiveShell).toHaveAttribute("aria-hidden", "true")
    expect(interactiveShell).toHaveAttribute("inert")
    expect(
      within(interactiveShell).queryByRole("button", { name: "展开数字分身" })
    ).toBeNull()
    expect(
      within(interactiveShell).queryByRole("button", { name: "放大画布" })
    ).toBeNull()
  })

  it("does not show hover action groups over the universe", () => {
    render(<HomePageView {...buildProps()} />)

    expect(screen.queryByTestId("planet-action-group")).not.toBeInTheDocument()

    for (const card of screen.getAllByTestId("universe-card")) {
      fireEvent.mouseEnter(card)
      expect(
        screen.queryByTestId("planet-action-group")
      ).not.toBeInTheDocument()
    }
  })

  it("keeps card dates in the card content flow", () => {
    render(<HomePageView {...buildProps()} />)

    const dateNodes = screen.getAllByTestId("universe-card-date")

    expect(dateNodes.length).toBeGreaterThan(0)
    expect(
      dateNodes.every((dateNode) => !dateNode.className.includes("absolute"))
    ).toBe(true)
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

  it("applies wheel zoom on animation frame instead of synchronously", async () => {
    const frameQueue: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frameQueue.push(callback)
      return frameQueue.length
    })
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    render(<HomePageView {...buildProps()} />)

    fireEvent.wheel(
      screen.getByRole("region", { name: "空境宇宙画布" }),
      {
        deltaY: -120,
      }
    )

    expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")

    await act(async () => {
      frameQueue.shift()?.(16.7)
    })

    await waitFor(() => {
      expect(screen.getByTestId("zoom-value")).toHaveTextContent("86%")
    })
  })

  it("accumulates trackpad wheel deltas before zooming once per animation frame", async () => {
    const frameQueue: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frameQueue.push(callback)
      return frameQueue.length
    })
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    render(<HomePageView {...buildProps()} />)

    const canvas = screen.getByRole("region", {
      name: "空境宇宙画布",
    })

    fireEvent.wheel(canvas, { deltaY: -30 })
    fireEvent.wheel(canvas, { deltaY: -90 })

    expect(frameQueue).toHaveLength(1)
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")

    await act(async () => {
      frameQueue.shift()?.(16.7)
    })

    await waitFor(() => {
      expect(screen.getByTestId("zoom-value")).toHaveTextContent("86%")
    })
  })

  it("switches between 空境明暗主题", () => {
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
    expect(
      screen.getByRole("button", { name: "切换黑夜模式" })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "切换黑夜模式" }))

    expect(screen.getByTestId("null-space-shell")).toHaveAttribute(
      "data-theme",
      "dark"
    )
  })

  it("zooms the universe camera without scaling the viewport shell", async () => {
    render(<HomePageView {...buildProps()} />)

    const canvas = screen.getByRole("region", {
      name: "空境宇宙画布",
    })
    const viewport = screen.getByTestId("universe-viewport")
    const camera = screen.getByTestId("universe-camera")

    fireEvent.wheel(canvas, { deltaY: -120 })
    await waitFor(() => {
      expect(screen.getByTestId("zoom-value")).toHaveTextContent("86%")
    })

    expect(viewport).toHaveStyle({
      transform: "translate(-50%, -50%)",
    })
    expect(camera).toHaveStyle({
      transform: "translate(0px, 0px) scale(1.1025641025641026)",
    })
  })

  it("pans the universe camera when dragging from the canvas or a card", async () => {
    render(<HomePageView {...buildProps()} />)

    const canvas = screen.getByRole("region", {
      name: "空境宇宙画布",
    })
    const camera = screen.getByTestId("universe-camera")

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 120 })
    fireEvent.mouseMove(canvas, { clientX: 136, clientY: 158 })
    fireEvent.mouseUp(canvas)

    await waitFor(() => {
      expect(camera).toHaveStyle({
        transform: "translate(36px, 38px) scale(1)",
      })
    })

    fireEvent.click(screen.getByRole("button", { name: "重置画布视角" }))
    expect(camera).toHaveStyle({
      transform: "translate(0px, 0px) scale(1)",
    })

    const workCard = screen.getByRole("button", { name: "聚焦 工作" })
    fireEvent.mouseDown(workCard, { clientX: 200, clientY: 220 })
    fireEvent.mouseMove(canvas, { clientX: 236, clientY: 258 })
    fireEvent.mouseUp(canvas)

    await waitFor(() => {
      expect(camera).toHaveStyle({
        transform: "translate(36px, 38px) scale(1)",
      })
    })
  })

  it("renders card maturity states and material tilt feedback", () => {
    render(<HomePageView {...buildProps()} />)

    const gardenCard = screen.getByRole("button", {
      name: "聚焦 构建你的数字花园",
    })
    const noteCard = screen.getByRole("button", { name: "聚焦 笔记样例" })

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

  it("scales card typography so compact cards still show their middle text", () => {
    render(<HomePageView {...buildProps()} />)

    const noteCard = screen.getByRole("button", { name: "聚焦 笔记样例" })
    const noteTitle = within(noteCard).getByText("笔记样例")

    expect(noteCard).toHaveAttribute("data-compact", "true")
    expect(noteTitle.className).toContain("text-[0.72rem]")
    expect(within(noteCard).getByText("一段简短笔记内容")).toBeInTheDocument()
  })

  it("renders a CSS-driven ambient field so the constellation is not static", () => {
    render(<HomePageView {...buildProps()} />)

    const ambientField = screen.getByTestId("universe-ambient-field")
    const nodes = document.querySelectorAll(".constellation-node")

    expect(ambientField).toHaveAttribute("aria-hidden", "true")
    expect(ambientField.querySelectorAll("span").length).toBeGreaterThan(3)
    expect(nodes.length).toBeGreaterThan(3)
  })

  it("renders layout-driven cards without overlap metadata collisions", () => {
    render(<HomePageView {...buildProps()} />)

    const cards = screen.getAllByTestId("universe-card")
    const layoutRects = cards.map(parseLayoutRect)

    expect(cards.length).toBeGreaterThan(8)
    expect(cards.every((card) => card.getAttribute("data-ring"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-x"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-y"))).toBe(true)
    expect(cards.every((card) => card.getAttribute("data-layout-width"))).toBe(
      true
    )
    expect(cards.every((card) => card.getAttribute("data-layout-height"))).toBe(
      true
    )
    expect(cards.every((card) => card.getAttribute("data-layout-status"))).toBe(
      true
    )
    expect(
      cards.every(
        (card) => card.getAttribute("data-layout-status") !== "overlap-fallback"
      )
    ).toBe(true)

    for (let index = 0; index < layoutRects.length; index += 1) {
      for (
        let nextIndex = index + 1;
        nextIndex < layoutRects.length;
        nextIndex += 1
      ) {
        expect(cardsOverlap(layoutRects[index], layoutRects[nextIndex])).toBe(
          false
        )
      }
    }
  })

  it("renders stable localized empty states when planets and memories are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          planets: [],
          memories: [],
        })}
      />
    )

    expect(
      screen.getByText("这个宇宙还没有星球。")
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "展开数字分身" }))
    expect(
      screen.getByText("还没有关联公开记忆。")
    ).toBeInTheDocument()
  })

  it("renders content counts in the bottom status line", () => {
    render(<HomePageView {...buildProps()} />)

    expect(screen.getByText("1 文章")).toBeInTheDocument()
    expect(screen.getByText("6 连接")).toBeInTheDocument()
    expect(screen.getByText("无限可能")).toBeInTheDocument()
  })

  it("keeps card layout stable while typing in the twin panel", () => {
    render(<HomePageView {...buildProps()} />)

    const before = screen
      .getAllByTestId("universe-card")
      .map(
        (card) =>
          `${card.getAttribute("data-layout-x")}:${card.getAttribute("data-layout-y")}`
      )

    fireEvent.click(screen.getByRole("button", { name: "展开数字分身" }))
    fireEvent.change(screen.getByPlaceholderText("搜索或和数字分身聊聊..."), {
      target: { value: "输入不应该移动卡片" },
    })

    const after = screen
      .getAllByTestId("universe-card")
      .map(
        (card) =>
          `${card.getAttribute("data-layout-x")}:${card.getAttribute("data-layout-y")}`
      )

    expect(after).toEqual(before)
  })

  it("sends twin chat messages and renders references", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: "智能回复样例",
        mode: "fallback",
        references: [
          {
            kind: "memory",
            id: "memory-1",
            title: "记忆样例",
            excerpt: "引用摘要",
          },
        ],
      }),
    })
    vi.stubGlobal("fetch", fetchMock)
    render(<HomePageView {...buildProps()} />)

    fireEvent.click(screen.getByRole("button", { name: "展开数字分身" }))
    fireEvent.change(screen.getByPlaceholderText("搜索或和数字分身聊聊..."), {
      target: { value: "你好" },
    })
    fireEvent.click(screen.getByRole("button", { name: "发送给数字分身" }))

    expect(screen.getByText("思考中")).toBeInTheDocument()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/twin/chat",
        expect.objectContaining({ method: "POST" })
      )
    })
    expect(await screen.findByText("智能回复样例")).toBeInTheDocument()
    expect(screen.getByText("记忆样例")).toBeInTheDocument()
  })

  it("renders explicit mobile card actions and mobile enter opens detail", () => {
    render(<HomePageView {...buildProps()} />)

    expect(
      screen.getByRole("button", { name: "移动端进入 工作" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "移动端询问 工作" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "移动端查看 工作 关联" })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "移动端进入 工作" }))

    expect(
      screen.getByRole("dialog", { name: "工作 行星详情" })
    ).toBeInTheDocument()
  })

  it("expands the embedded twin orb and sends chat in the selected card context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: "上下文回复样例",
        mode: "fallback",
        references: [],
      }),
    })
    vi.stubGlobal("fetch", fetchMock)
    render(<HomePageView {...buildProps()} />)

    fireEvent.click(screen.getByRole("button", { name: "聚焦 工作" }))
    fireEvent.click(screen.getByRole("button", { name: "展开数字分身" }))

    expect(
      screen.getByRole("dialog", { name: "数字分身对话" })
    ).toHaveTextContent("当前上下文：工作")
    expect(
      screen.getByPlaceholderText("搜索或和数字分身聊聊...")
    ).toHaveFocus()

    fireEvent.change(screen.getByPlaceholderText("搜索或和数字分身聊聊..."), {
      target: { value: "总结这个行星" },
    })
    fireEvent.click(screen.getByRole("button", { name: "发送给数字分身" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
    const request = fetchMock.mock.calls[0]?.[1]
    const body = JSON.parse(String(request?.body))

    expect(body.message).toBe("总结这个行星")
    expect(body.contextCard.title).toBe("工作")
    expect(body.focusedPlanetId).toBe(1)
    expect(await screen.findByText("上下文回复样例")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "收起数字分身" }))
    expect(
      screen.queryByRole("dialog", { name: "数字分身对话" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "展开数字分身" })).toHaveFocus()
  })
})
