import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import AboutPage from "@/app/(site)/about/page"
import ProjectsPage from "@/app/(site)/projects/page"
import { AboutPageView } from "@/components/site/about-page-view"
import { NoteTimeline } from "@/components/site/note-timeline"
import { ProjectCard } from "@/components/site/project-card"
import type { NoteEntry, ProfileData, ProjectEntry } from "@/lib/content"
import { getProfile, getProjects } from "@/lib/content"

vi.mock("@/components/site/page-intro", () => ({
  PageIntro: ({
    eyebrow,
    title,
    description,
  }: {
    eyebrow: string
    title: string
    description: string
  }) => (
    <div data-testid="page-intro-sentinel">
      <span>{`eyebrow:${eyebrow}`}</span>
      <span>{`title:${title}`}</span>
      <span>{`description:${description}`}</span>
    </div>
  ),
}))

vi.mock("@/lib/content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content")>()

  return {
    ...actual,
    getProfile: vi.fn(),
    getProjects: vi.fn(),
  }
})

const mockedGetProfile = vi.mocked(getProfile)
const mockedGetProjects = vi.mocked(getProjects)

const noteFixture: NoteEntry = {
  slug: "note-fixture",
  title: "测试笔记",
  body: "一段简短笔记内容",
  publishedAt: "2026-04-20",
}

const projectFixture: ProjectEntry = {
  slug: "project-fixture",
  title: "测试项目",
  description: "一段项目描述",
  stack: ["前端框架", "脚本语言"],
  href: "https://example.invalid/fixture-project",
  note: "一段项目备注",
}

const protocolRelativeProjectFixture: ProjectEntry = {
  ...projectFixture,
  slug: "protocol-relative-project",
  title: "协议相对项目",
  href: "//example.com/protocol-relative-project",
}

const profileFixture: ProfileData = {
  name: "测试姓名",
  roleLine: "测试角色",
  heroTitle: "测试首页标题",
  heroIntro: "测试首页简介",
  aboutSummary: "测试关于摘要",
  longBio: ["第一段测试简介。", "第二段测试简介。"],
}

beforeEach(() => {
  mockedGetProfile.mockReturnValue(profileFixture)
  mockedGetProjects.mockReturnValue([projectFixture])
})

afterEach(() => {
  mockedGetProfile.mockReset()
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
    expect(screen.getByText("还没有笔记。")).toBeInTheDocument()
  })

  it("renders project links with an accessible name and href", () => {
    render(<ProjectCard project={projectFixture} />)

    const projectLink = screen.getByRole("link", {
      name: `查看项目：${projectFixture.title}`,
    })

    expect(projectLink).toHaveAttribute("href", projectFixture.href)
    expect(projectLink).toHaveAttribute("target", "_blank")
    expect(projectLink).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("treats protocol-relative project urls as safe external links", () => {
    render(<ProjectCard project={protocolRelativeProjectFixture} />)

    const projectLink = screen.getByRole("link", {
      name: `查看项目：${protocolRelativeProjectFixture.title}`,
    })

    expect(projectLink).toHaveAttribute(
      "href",
      protocolRelativeProjectFixture.href
    )
    expect(projectLink).toHaveAttribute("target", "_blank")
    expect(projectLink).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders a projects page empty state when there are no projects", () => {
    mockedGetProjects.mockReturnValue([])

    render(<ProjectsPage />)

    expect(screen.getByText("正在整理值得被展开讲述的项目。")).toBeInTheDocument()
  })

  it("renders a projects page from the default project fixture", () => {
    render(<ProjectsPage />)

    expect(
      screen.getByRole("heading", { name: projectFixture.title })
    ).toBeInTheDocument()
  })

  it("renders about body content without duplicating intro content", () => {
    render(<AboutPageView profile={profileFixture} />)

    expect(screen.getByText(profileFixture.longBio[0])).toBeInTheDocument()
    expect(screen.getByText(profileFixture.longBio[1])).toBeInTheDocument()
    expect(screen.queryByText(profileFixture.name)).not.toBeInTheDocument()
    expect(screen.queryByText(profileFixture.aboutSummary)).not.toBeInTheDocument()
  })

  it("renders the about page intro and body from the route layer", () => {
    render(<AboutPage />)

    expect(screen.getByTestId("page-intro-sentinel")).toBeInTheDocument()
    expect(screen.getByText("eyebrow:关于")).toBeInTheDocument()
    expect(screen.getByText(`title:${profileFixture.name}`)).toBeInTheDocument()
    expect(
      screen.getByText(`description:${profileFixture.aboutSummary}`)
    ).toBeInTheDocument()
    expect(screen.getByText(profileFixture.longBio[0])).toBeInTheDocument()
  })
})
