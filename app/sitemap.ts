import type { MetadataRoute } from "next"

import { siteConfig } from "@/data/site"
import { getAllEssaySlugs } from "@/lib/content"

function toAbsoluteUrl(path: string): string {
  return new URL(path, siteConfig.siteUrl).toString()
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-04-23")
  const staticRoutes = ["/", "/about", "/essays", "/notes", "/projects"]
  const essayRoutes = getAllEssaySlugs().map((slug) => `/essays/${slug}`)

  return [...staticRoutes, ...essayRoutes].map((path) => ({
    url: toAbsoluteUrl(path),
    lastModified,
  }))
}
