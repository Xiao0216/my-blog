import type { MetadataRoute } from "next"

import { siteConfig } from "@/data/site"
import { getAllEssaySlugs } from "@/lib/content"
import { toAbsoluteSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const staticRoutes = ["/", "/about", "/essays", "/notes", "/projects"]
  const essayRoutes = getAllEssaySlugs().map((slug) => `/essays/${slug}`)

  return [...staticRoutes, ...essayRoutes].map((path) => ({
    url: toAbsoluteSiteUrl(path, siteConfig.siteUrl),
    lastModified,
  }))
}
