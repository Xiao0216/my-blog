import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Reveal } from "@/components/site/reveal"

describe("Reveal", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("keeps content visible in server-rendered markup", () => {
    const markup = renderToStaticMarkup(
      <Reveal>
        <span>Visible content</span>
      </Reveal>
    )

    expect(markup).toContain("Visible content")
    expect(markup).not.toContain("opacity-0")
    expect(markup).not.toContain("translate-y-6")
  })

  it("disables motion when the user prefers reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    )

    render(
      <Reveal>
        <span>Visible content</span>
      </Reveal>
    )

    const wrapper = screen.getByText("Visible content").parentElement

    expect(wrapper).not.toHaveClass("transition-all")
    expect(wrapper).not.toHaveClass("translate-y-6")
  })
})
