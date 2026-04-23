import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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

  it("renders project and about content", () => {
    render(
      <>
        <ProjectCard project={getProjects()[0]} />
        <AboutPageView profile={getProfile()} />
      </>
    )

    expect(screen.getByText("Rain Map")).toBeInTheDocument()
    expect(screen.getByText("Quiet Chapters")).toBeInTheDocument()
  })
})
