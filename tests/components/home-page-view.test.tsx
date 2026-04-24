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

describe("HomePageView", () => {
  it("renders a life universe canvas and digital twin panel", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(screen.getByRole("heading", { name: "人生宇宙" })).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Life universe canvas" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("complementary", { name: "Digital twin" })
    ).toHaveTextContent("Fixture Twin")
    expect(screen.getByRole("button", { name: "聚焦 Work" })).toBeInTheDocument()
    expect(screen.getByText("Direct engineering style")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "发送给数字分身" })).toBeInTheDocument()
    expect(container.querySelector('[data-universe-lines="true"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })

  it("renders life universe empty states when planets and memories are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          planets: [],
          memories: [],
        })}
      />
    )

    expect(screen.getAllByText("No planets in this universe yet").length).toBeGreaterThan(0)
    expect(screen.getAllByText("No public memories attached yet").length).toBeGreaterThan(0)
  })

  it("renders linked legacy content counts while migration stays incremental", () => {
    render(<HomePageView {...buildProps()} />)

    expect(screen.getByText("1 essays")).toBeInTheDocument()
    expect(screen.getByText("1 projects")).toBeInTheDocument()
    expect(screen.getByText("1 notes")).toBeInTheDocument()
  })
})
