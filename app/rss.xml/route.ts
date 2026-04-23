import { buildRssXml } from "@/lib/feed"

export function GET() {
  return new Response(buildRssXml(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}
