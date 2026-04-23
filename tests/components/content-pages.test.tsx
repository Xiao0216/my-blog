import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import AboutPage from "@/app/about/page"
import { AboutPageView } from "@/components/site/about-page-view"
import { NoteTimeline } from "@/components/site/note-timeline"
import { ProjectCard } from "@/components/site/project-card"
import { getAllNotes, getProfile, getProjects } from "@/lib/content"

describe("secondary page components", () => {
  it("renders notes in a timeline and keeps an empty state", () => {
    const notes = getAllNotes()

    const { rerender } = render(<NoteTimeline notes={notes} />)
    expect(screen.getByText("靠窗的位置")).toBeInTheDocument()

    rerender(<NoteTimeline notes={[]} />)
    expect(screen.getByText("碎片正在路上。")).toBeInTheDocument()
  })

  it("renders project content and keeps about body content separate", () => {
    const profile = getProfile()

    render(
      <>
        <ProjectCard project={getProjects()[0]} />
        <AboutPageView profile={profile} />
      </>
    )

    expect(screen.getByText("Rain Map")).toBeInTheDocument()
    expect(screen.getByText(profile.longBio[0])).toBeInTheDocument()
    expect(screen.queryByText(profile.name)).not.toBeInTheDocument()
    expect(screen.queryByText(profile.aboutSummary)).not.toBeInTheDocument()
  })

  it("renders the about page with the shared page intro", () => {
    const profile = getProfile()

    render(<AboutPage />)

    expect(screen.getByText("About")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: profile.name })
    ).toBeInTheDocument()
    expect(screen.getByText(profile.aboutSummary)).toBeInTheDocument()
    expect(screen.getByText(profile.longBio[0])).toBeInTheDocument()
  })
})
