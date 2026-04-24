import type { ComponentProps } from "react"

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { HomePageView } from "@/components/site/home-page-view"

type HomePageViewProps = ComponentProps<typeof HomePageView>

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
    expect(screen.getByText("2 连接")).toBeInTheDocument()
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
