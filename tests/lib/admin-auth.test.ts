import { afterEach, describe, expect, it, vi } from "vitest"

async function loadAuth() {
  vi.resetModules()
  return import("@/lib/admin-auth")
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("admin auth", () => {
  it("accepts the configured admin password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "strong-password")
    const auth = await loadAuth()

    expect(auth.verifyAdminPassword("strong-password")).toBe(true)
    expect(auth.verifyAdminPassword("wrong-password")).toBe(false)
  })

  it("rejects login when ADMIN_PASSWORD is missing", async () => {
    const auth = await loadAuth()

    expect(auth.verifyAdminPassword("anything")).toBe(false)
  })

  it("creates signed session values and rejects tampering", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "strong-password")
    const auth = await loadAuth()
    const sessionValue = auth.createAdminSessionCookieValue(1_776_988_800_000)

    expect(
      auth.verifyAdminSessionCookieValue(sessionValue, 1_776_988_801_000)
    ).toBe(true)
    expect(
      auth.verifyAdminSessionCookieValue(`${sessionValue}tampered`, 1_776_988_801_000)
    ).toBe(false)
  })

  it("rejects expired sessions", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "strong-password")
    const auth = await loadAuth()
    const sessionValue = auth.createAdminSessionCookieValue(1_776_988_800_000)

    expect(
      auth.verifyAdminSessionCookieValue(sessionValue, 1_777_075_201_000)
    ).toBe(false)
  })

  it("allows only safe internal admin next paths", async () => {
    const auth = await loadAuth()

    expect(auth.getSafeAdminNextPath("/admin")).toBe("/admin")
    expect(auth.getSafeAdminNextPath("/admin/inbox")).toBe("/admin/inbox")
    expect(auth.getSafeAdminNextPath("/admin/inbox?error=1")).toBe(
      "/admin/inbox"
    )
    expect(auth.getSafeAdminNextPath("/admin/login")).toBe("/admin")
    expect(auth.getSafeAdminNextPath("/administer")).toBe("/admin")
    expect(auth.getSafeAdminNextPath("/admin.evil")).toBe("/admin")
    expect(auth.getSafeAdminNextPath("https://evil.test/admin/inbox")).toBe(
      "/admin"
    )
    expect(auth.getSafeAdminNextPath("/essays")).toBe("/admin")
  })
})
