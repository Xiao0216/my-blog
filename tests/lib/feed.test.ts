import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

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

    expect(rssXml).toContain("<title>縉紳</title>")
    expect(rssXml).toContain("<title>医疗系统前端工程化实践</title>")
    expect(rssXml).toContain("/essays/healthcare-frontend-engineering")
  })

  it("normalizes a scheme-less site url for RSS links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "  example.com  ")
    const { buildRssXml } = await loadFeedHelpers()

    const rssXml = buildRssXml()

    expect(rssXml).toContain("<link>https://example.com/</link>")
    expect(rssXml).toContain(
      "<link>https://example.com/essays/healthcare-frontend-engineering</link>"
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
          url: "https://example.com/essays/healthcare-frontend-engineering",
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

  it("excludes draft essays from RSS and sitemap", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "blog-feed-"))
    vi.stubEnv("BLOG_DATABASE_PATH", join(tempDir, "blog.sqlite"))

    try {
      const db = await import("@/lib/cms/db")
      db.initializeCmsDatabase()
      db.saveEssay({
        slug: "hidden-draft",
        title: "Hidden draft",
        description: "Drafts should not leak",
        content: "# Hidden",
        publishedAt: "2026-04-24",
        readingTime: "1 min read",
        tags: ["Draft"],
        status: "draft",
      })
      db.saveEssay({
        slug: "visible-from-db",
        title: "Visible from DB",
        description: "Published database essay",
        content: "# Visible",
        publishedAt: "2026-04-25",
        readingTime: "1 min read",
        tags: ["Published"],
        status: "published",
      })

      const { buildRssXml } = await loadFeedHelpers()
      const sitemapModule = await loadSitemapModule()

      const rssXml = buildRssXml()
      const sitemapUrls = sitemapModule.default().map((entry) => entry.url).join("\n")

      expect(rssXml).toContain("visible-from-db")
      expect(rssXml).not.toContain("hidden-draft")
      expect(sitemapUrls).toContain("visible-from-db")
      expect(sitemapUrls).not.toContain("hidden-draft")
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
