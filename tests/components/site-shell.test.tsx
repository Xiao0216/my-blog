import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SiteShell } from "@/components/site/site-shell"
import { siteConfig } from "@/data/site"

describe("SiteShell", () => {
  it("renders the shell landmarks and configured navigation links", () => {
    render(
      <SiteShell>
        <div>Page body</div>
      </SiteShell>
    )

    const banner = screen.getByRole("banner")
    const main = screen.getByRole("main")
    const footer = screen.getByRole("contentinfo")
    const navigation = within(banner).getByRole("navigation")

    expect(main).toHaveAttribute("id", "content")
    expect(within(main).getByText("Page body")).toBeInTheDocument()

    for (const item of siteConfig.navigation) {
      expect(
        within(navigation).getByRole("link", { name: item.label })
      ).toHaveAttribute("href", item.href)
    }

    for (const item of siteConfig.footerLinks) {
      expect(
        within(footer).getByRole("link", { name: item.label })
      ).toHaveAttribute("href", item.href)
    }
  })
})
