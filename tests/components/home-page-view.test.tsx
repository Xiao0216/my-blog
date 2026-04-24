import type { ComponentProps } from "react"

import { render, screen } from "@testing-library/react"
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
  it("renders a productized homepage with identity metadata and latest feed", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(
      screen.getByRole("heading", { name: "Fixture hero title" })
    ).toBeInTheDocument()
    expect(screen.getByText("Identity")).toBeInTheDocument()
    expect(screen.getByText("Focus")).toBeInTheDocument()
    expect(screen.getByText("Latest")).toBeInTheDocument()
    expect(screen.getByText("Essay")).toBeInTheDocument()
    expect(screen.getByText("Project")).toBeInTheDocument()
    expect(screen.getByText("Note")).toBeInTheDocument()
    expect(screen.getAllByText("A short essay description").length).toBeGreaterThan(0)
    expect(screen.getAllByText("A project note").length).toBeGreaterThan(0)
    expect(screen.getAllByText("A short note body").length).toBeGreaterThan(0)
    expect(screen.getByText("2026-03-01").tagName).toBe("TIME")
    expect(screen.getByText("2026-03-01")).toHaveAttribute(
      "dateTime",
      "2026-03-01"
    )
    expect(screen.getByText("2026-03-02").tagName).toBe("TIME")
    expect(screen.getByText("2026-03-02")).toHaveAttribute(
      "dateTime",
      "2026-03-02"
    )
    expect(screen.getByRole("link", { name: "View all essays" })).toHaveAttribute(
      "href",
      "/essays"
    )
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it("renders product empty states when notes, essays, and projects are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          notes: [],
          essays: [],
          projects: [],
        })}
      />
    )

    expect(screen.getByText("No notes yet")).toBeInTheDocument()
    expect(screen.getByText("No essays yet")).toBeInTheDocument()
    expect(screen.getByText("No projects yet")).toBeInTheDocument()
  })
})
