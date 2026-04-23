import { siteConfig } from "@/data/site"
import { getEssaySummaries } from "@/lib/content"
import { toAbsoluteSiteUrl } from "@/lib/site-url"

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function toRssPubDate(dateText: string): string {
  const publishedDate = new Date(dateText)

  if (Number.isNaN(publishedDate.getTime())) {
    return new Date().toUTCString()
  }

  return publishedDate.toUTCString()
}

export function buildRssXml(): string {
  const essays = getEssaySummaries()
  const channelTitle = escapeXml(siteConfig.title)
  const channelDescription = escapeXml(siteConfig.description)
  const channelLink = escapeXml(siteConfig.siteUrl)

  const items = essays
    .map((essay) => {
      const link = toAbsoluteSiteUrl(`/essays/${essay.slug}`, siteConfig.siteUrl)
      const escapedLink = escapeXml(link)

      return [
        "<item>",
        `<title>${escapeXml(essay.title)}</title>`,
        `<link>${escapedLink}</link>`,
        `<guid>${escapedLink}</guid>`,
        `<pubDate>${toRssPubDate(essay.publishedAt)}</pubDate>`,
        `<description>${escapeXml(essay.description)}</description>`,
        "</item>",
      ].join("")
    })
    .join("")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<rss version=\"2.0\">",
    "<channel>",
    `<title>${channelTitle}</title>`,
    `<link>${channelLink}</link>`,
    `<description>${channelDescription}</description>`,
    items,
    "</channel>",
    "</rss>",
  ].join("")
}
