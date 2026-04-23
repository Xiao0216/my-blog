import { buildRssXml } from "@/lib/feed"
import { describe, expect, it } from "vitest"

describe("feed helpers", () => {
  it("builds an RSS feed with site and essay content", () => {
    const rssXml = buildRssXml()

    expect(rssXml).toContain("<title>Quiet Chapters</title>")
    expect(rssXml).toContain("<title>Making Space for Thought</title>")
    expect(rssXml).toContain("/essays/making-space-for-thought")
  })
})
