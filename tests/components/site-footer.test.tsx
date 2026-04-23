import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/data/site", () => ({
  profile: {
    name: "Fixture Name",
  },
  siteConfig: {
    footerLinks: [
      { href: "https://example.com", label: "External" },
      { href: "mailto:test@example.com", label: "Email" },
      { href: "javascript:alert(1)", label: "Unsafe" },
      { href: "/rss.xml", label: "RSS" },
    ],
  },
}))

import { SiteFooter } from "@/components/site/site-footer"

describe("SiteFooter", () => {
  it("opens http links safely and leaves unsafe protocols non-clickable", () => {
    render(<SiteFooter />)

    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "target",
      "_blank"
    )
    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    )
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:test@example.com"
    )
    expect(screen.queryByRole("link", { name: "Unsafe" })).not.toBeInTheDocument()
    expect(screen.getByText("Unsafe")).toBeInTheDocument()
  })
})
