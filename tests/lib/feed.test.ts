import { afterEach, describe, expect, it, vi } from "vitest"

async function loadFeedHelpers() {
  vi.resetModules()
  return import("@/lib/feed")
}

async function loadSitemapModule() {
  vi.resetModules()
  return import("@/app/sitemap")
}

describe("feed helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it("builds an RSS feed with site and essay content", async () => {
    const { buildRssXml } = await loadFeedHelpers()
    const rssXml = buildRssXml()

    expect(rssXml).toContain("<title>Quiet Chapters</title>")
    expect(rssXml).toContain("<title>Making Space for Thought</title>")
    expect(rssXml).toContain("/essays/making-space-for-thought")
  })

  it("normalizes a scheme-less site url for RSS links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "  example.com  ")
    const { buildRssXml } = await loadFeedHelpers()

    const rssXml = buildRssXml()

    expect(rssXml).toContain("<link>https://example.com/</link>")
    expect(rssXml).toContain(
      "<link>https://example.com/essays/making-space-for-thought</link>"
    )
  })

  it("normalizes a scheme-less site url for sitemap links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", " example.com ")
    const sitemapModule = await loadSitemapModule()

    const entries = sitemapModule.default()

    expect(entries[0]?.url).toBe("https://example.com/")
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://example.com/essays/making-space-for-thought",
        }),
      ])
    )
  })

  it("strips path, search, and hash from the configured site url", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/blog?foo=1#bar")
    const { buildRssXml } = await loadFeedHelpers()
    const sitemapModule = await loadSitemapModule()

    const rssXml = buildRssXml()
    const entries = sitemapModule.default()

    expect(rssXml).toContain("<link>https://example.com/</link>")
    expect(entries[0]?.url).toBe("https://example.com/")
  })
})
