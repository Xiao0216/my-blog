import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SiteShell } from "@/components/site/site-shell"

describe("SiteShell", () => {
  it("renders the global navigation, content slot, and footer links", () => {
    render(
      <SiteShell>
        <div>Page body</div>
      </SiteShell>
    )

    expect(screen.getByRole("link", { name: "Essays" })).toHaveAttribute(
      "href",
      "/essays"
    )
    expect(screen.getByText("Page body")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "RSS" })).toHaveAttribute(
      "href",
      "/rss.xml"
    )
  })
})
