import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import ProjectsPage from "@/app/projects/page"
import { AboutPageView } from "@/components/site/about-page-view"
import { NoteTimeline } from "@/components/site/note-timeline"
import { ProjectCard } from "@/components/site/project-card"
import type { NoteEntry, ProfileData, ProjectEntry } from "@/lib/content"
import { getProjects } from "@/lib/content"

vi.mock("@/lib/content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content")>()

  return {
    ...actual,
    getProjects: vi.fn(),
  }
})

const mockedGetProjects = vi.mocked(getProjects)

const noteFixture: NoteEntry = {
  slug: "note-fixture",
  title: "Fixture note",
  body: "A short note body",
  publishedAt: "2026-04-20",
}

const projectFixture: ProjectEntry = {
  slug: "project-fixture",
  title: "Fixture project",
  description: "A short project description",
  stack: ["Next.js", "TypeScript"],
  href: "https://example.invalid/fixture-project",
  note: "A short project note",
}

const profileFixture: ProfileData = {
  name: "Fixture Name",
  roleLine: "Fixture role line",
  heroTitle: "Fixture hero title",
  heroIntro: "Fixture hero intro",
  aboutSummary: "Fixture about summary",
  longBio: ["Fixture bio paragraph one.", "Fixture bio paragraph two."],
}

afterEach(() => {
  mockedGetProjects.mockReset()
})

describe("secondary page components", () => {
  it("renders notes with semantic time and keeps an empty state", () => {
    const { rerender } = render(<NoteTimeline notes={[noteFixture]} />)

    expect(
      screen.getByRole("heading", { name: noteFixture.title })
    ).toBeInTheDocument()
    expect(screen.getByText(noteFixture.publishedAt).tagName).toBe("TIME")
    expect(screen.getByText(noteFixture.publishedAt)).toHaveAttribute(
      "dateTime",
      noteFixture.publishedAt
    )

    rerender(<NoteTimeline notes={[]} />)
    expect(screen.getByText("碎片正在路上。")).toBeInTheDocument()
  })

  it("renders project links with an accessible name and href", () => {
    render(<ProjectCard project={projectFixture} />)

    expect(
      screen.getByRole("link", { name: `查看项目：${projectFixture.title}` })
    ).toHaveAttribute("href", projectFixture.href)
  })

  it("renders a projects page empty state when there are no projects", () => {
    mockedGetProjects.mockReturnValue([])

    render(<ProjectsPage />)

    expect(screen.getByText("正在整理值得被展开讲述的项目。")).toBeInTheDocument()
  })

  it("renders about body content without duplicating intro content", () => {
    render(<AboutPageView profile={profileFixture} />)

    expect(screen.getByText(profileFixture.longBio[0])).toBeInTheDocument()
    expect(screen.getByText(profileFixture.longBio[1])).toBeInTheDocument()
    expect(screen.queryByText(profileFixture.name)).not.toBeInTheDocument()
    expect(screen.queryByText(profileFixture.aboutSummary)).not.toBeInTheDocument()
  })
})
