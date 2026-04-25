import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AdminShell } from "@/components/admin/admin-ui"

const { requireAdminSessionMock } = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(async () => undefined),
}))

vi.mock("@/lib/admin-guard", () => ({
  requireAdminSession: requireAdminSessionMock,
}))

let tempDir = ""

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-admin-life-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
  requireAdminSessionMock.mockClear()
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
    expect(within(navigation).getByRole("link", { name: "Inbox" })).toHaveAttribute(
      "href",
      "/admin/inbox"
    )
    expect(within(navigation).getByRole("link", { name: "Twin" })).toHaveAttribute(
      "href",
      "/admin/twin"
    )
  })

  it("renders life universe admin pages", async () => {
    const [
      { default: AdminPlanetsPage },
      { default: AdminMemoriesPage },
      { default: AdminTwinPage },
      { default: AdminInboxPage },
    ] = await Promise.all([
        import("@/app/admin/(protected)/planets/page"),
        import("@/app/admin/(protected)/memories/page"),
        import("@/app/admin/(protected)/twin/page"),
        import("@/app/admin/(protected)/inbox/page"),
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

    rerender(await AdminInboxPage())
    expect(screen.getByRole("heading", { name: "AI Inbox" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "AI 保存" })).toBeInTheDocument()
  })

  it("guards protected admin pages with route-specific return paths", async () => {
    const [
      { default: AdminDashboardPage },
      { default: AdminPlanetsPage },
      { default: AdminMemoriesPage },
      { default: AdminTwinPage },
      { default: AdminInboxPage },
      { default: AdminProfilePage },
      { default: AdminEssaysPage },
      { default: AdminProjectsPage },
      { default: AdminNotesPage },
    ] = await Promise.all([
      import("@/app/admin/(protected)/page"),
      import("@/app/admin/(protected)/planets/page"),
      import("@/app/admin/(protected)/memories/page"),
      import("@/app/admin/(protected)/twin/page"),
      import("@/app/admin/(protected)/inbox/page"),
      import("@/app/admin/(protected)/profile/page"),
      import("@/app/admin/(protected)/essays/page"),
      import("@/app/admin/(protected)/projects/page"),
      import("@/app/admin/(protected)/notes/page"),
    ])
    const emptySearchParams = Promise.resolve({})
    const pages = [
      { path: "/admin", load: () => AdminDashboardPage() },
      {
        path: "/admin/planets",
        load: () => AdminPlanetsPage({ searchParams: emptySearchParams }),
      },
      {
        path: "/admin/memories",
        load: () => AdminMemoriesPage({ searchParams: emptySearchParams }),
      },
      {
        path: "/admin/twin",
        load: () => AdminTwinPage({ searchParams: emptySearchParams }),
      },
      {
        path: "/admin/inbox",
        load: () => AdminInboxPage(),
      },
      {
        path: "/admin/profile",
        load: () => AdminProfilePage({ searchParams: emptySearchParams }),
      },
      {
        path: "/admin/essays",
        load: () => AdminEssaysPage({ searchParams: emptySearchParams }),
      },
      {
        path: "/admin/projects",
        load: () => AdminProjectsPage({ searchParams: emptySearchParams }),
      },
      {
        path: "/admin/notes",
        load: () => AdminNotesPage({ searchParams: emptySearchParams }),
      },
    ]

    for (const page of pages) {
      requireAdminSessionMock.mockClear()

      await page.load()

      expect(requireAdminSessionMock).toHaveBeenCalledTimes(1)
      expect(requireAdminSessionMock).toHaveBeenCalledWith(page.path)
    }
  })
})
