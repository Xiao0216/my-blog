import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { HomePageView } from "@/components/site/home-page-view"
import {
  getEssaySummaries,
  getFeaturedNotes,
  getProfile,
  getProjects,
} from "@/lib/content"

describe("HomePageView", () => {
  it("renders the hero and each narrative chapter", () => {
    render(
      <HomePageView
        essays={getEssaySummaries().slice(0, 2)}
        notes={getFeaturedNotes(3)}
        profile={getProfile()}
        projects={getProjects().slice(0, 2)}
      />
    )

    expect(
      screen.getByRole("heading", {
        name: "把代码、文字与日常感受，慢慢写成自己的空间。",
      })
    ).toBeInTheDocument()
    expect(screen.getByText("第一章")).toBeInTheDocument()
    expect(screen.getByText("第二章")).toBeInTheDocument()
    expect(screen.getByText("第三章")).toBeInTheDocument()
    expect(screen.getByText("第四章")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "进入文章" })).toHaveAttribute(
      "href",
      "/essays"
    )
  })
})
