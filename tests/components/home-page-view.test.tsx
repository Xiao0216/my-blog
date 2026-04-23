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
  it("renders the homepage structure from minimal view-model props", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(
      screen.getByRole("heading", { name: "Fixture hero title" })
    ).toBeInTheDocument()
    expect(screen.getByText("第一章")).toBeInTheDocument()
    expect(screen.getByText("第二章")).toBeInTheDocument()
    expect(screen.getByText("第三章")).toBeInTheDocument()
    expect(screen.getByText("第四章")).toBeInTheDocument()
    expect(screen.getByText("Note fixture")).toBeInTheDocument()
    expect(screen.getByText("Essay fixture")).toBeInTheDocument()
    expect(screen.getByText("Project fixture")).toBeInTheDocument()
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
    expect(screen.getByRole("link", { name: "进入文章" })).toHaveAttribute(
      "href",
      "/essays"
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it("renders fallback copy when notes, essays, and projects are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          notes: [],
          essays: [],
          projects: [],
        })}
      />
    )

    expect(screen.getByText("更多碎片正在整理中。")).toBeInTheDocument()
    expect(screen.getByText("第一篇文章正在写完最后一段。")).toBeInTheDocument()
    expect(
      screen.getByText("正在整理值得被展开讲述的项目。")
    ).toBeInTheDocument()
  })
})
