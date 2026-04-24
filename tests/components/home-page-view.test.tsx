import type { ComponentProps } from "react"

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
    ...overrides,
  }
}

describe("HomePageView", () => {
  it("renders an interactive spatial knowledge canvas", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(
      screen.getByRole("heading", { name: "Fixture hero title" })
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "知识星图" })).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Spatial knowledge canvas" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "放大" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "缩小" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "重置视角" })).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: "聚焦 Essay fixture" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "聚焦 Project fixture" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "聚焦 Note fixture" })
    ).toBeInTheDocument()
    expect(screen.getByText("移动星图流")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "聚焦 Project fixture" }))

    expect(screen.getByRole("complementary", { name: "Focused node" })).toHaveTextContent(
      "Project fixture"
    )
    expect(screen.getByRole("complementary", { name: "Focused node" })).toHaveTextContent(
      "A project note"
    )
    expect(screen.getByRole("link", { name: "打开 Project fixture" })).toHaveAttribute(
      "href",
      "/projects"
    )
    expect(container.querySelector('[data-spatial-lines="true"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })

  it("renders spatial empty states when notes, essays, and projects are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          notes: [],
          essays: [],
          projects: [],
        })}
      />
    )

    expect(screen.getAllByText("No notes in orbit").length).toBeGreaterThan(0)
    expect(screen.getAllByText("No essays in orbit").length).toBeGreaterThan(0)
    expect(screen.getAllByText("No projects in orbit").length).toBeGreaterThan(0)
  })
})
