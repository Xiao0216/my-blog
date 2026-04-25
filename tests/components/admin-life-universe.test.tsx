import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AdminShell } from "@/components/admin/admin-ui"

vi.mock("@/lib/admin-guard", () => ({
  requireAdminSession: vi.fn(async () => undefined),
}))

let tempDir = ""

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-admin-life-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  rmSync(tempDir, { recursive: true, force: true })
  vi.resetModules()
})

describe("life universe admin UI", () => {
  it("adds planets, memories, and twin identity to admin navigation", () => {
    render(
      <AdminShell>
        <div>Admin body</div>
      </AdminShell>
    )

    const navigation = within(screen.getByRole("banner")).getByRole("navigation")

    expect(within(navigation).getByRole("link", { name: "Planets" })).toHaveAttribute(
      "href",
      "/admin/planets"
    )
    expect(
      within(navigation).getByRole("link", { name: "Memories" })
    ).toHaveAttribute("href", "/admin/memories")
    expect(within(navigation).getByRole("link", { name: "Twin" })).toHaveAttribute(
      "href",
      "/admin/twin"
    )
  })

  it("renders life universe admin pages", async () => {
    const [{ default: AdminPlanetsPage }, { default: AdminMemoriesPage }, { default: AdminTwinPage }] =
      await Promise.all([
        import("@/app/admin/(protected)/planets/page"),
        import("@/app/admin/(protected)/memories/page"),
        import("@/app/admin/(protected)/twin/page"),
      ])

    const { rerender } = render(
      await AdminPlanetsPage({ searchParams: Promise.resolve({}) })
    )

    expect(screen.getByRole("heading", { name: "Planets" })).toBeInTheDocument()

    rerender(await AdminMemoriesPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByRole("heading", { name: "Memories" })).toBeInTheDocument()

    rerender(await AdminTwinPage({ searchParams: Promise.resolve({}) }))
    expect(
      screen.getByRole("heading", { name: "Twin Identity" })
    ).toBeInTheDocument()
  })
})
