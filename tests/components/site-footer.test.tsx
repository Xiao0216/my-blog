import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/data/site", () => ({
  profile: {
    name: "测试姓名",
  },
  siteConfig: {
    footerLinks: [
      { href: "https://example.com", label: "外部链接" },
      { href: "//cdn.example.com", label: "协议相对链接" },
      { href: "mailto:test@example.com", label: "邮箱" },
      { href: "javascript:alert(1)", label: "不安全链接" },
      { href: "/rss.xml", label: "订阅源" },
    ],
  },
}))

import { SiteFooter } from "@/components/site/site-footer"

describe("SiteFooter", () => {
  it("opens http links safely and leaves unsafe protocols non-clickable", () => {
    render(<SiteFooter />)

    expect(screen.getByRole("link", { name: "外部链接" })).toHaveAttribute(
      "target",
      "_blank"
    )
    expect(screen.getByRole("link", { name: "外部链接" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    )
    expect(screen.getByRole("link", { name: "邮箱" })).toHaveAttribute(
      "href",
      "mailto:test@example.com"
    )
    expect(
      screen.getByRole("link", { name: "协议相对链接" })
    ).toHaveAttribute("target", "_blank")
    expect(
      screen.getByRole("link", { name: "协议相对链接" })
    ).toHaveAttribute("rel", "noopener noreferrer")
    expect(
      screen.queryByRole("link", { name: "不安全链接" })
    ).not.toBeInTheDocument()
    expect(screen.getByText("不安全链接")).toBeInTheDocument()
  })
})
