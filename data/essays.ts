export type EssaySummary = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingTime: string
  tags: string[]
}

export const essaySummaries: EssaySummary[] = [
  {
    slug: "making-space-for-thought",
    title: "Making Space for Thought",
    description: "给注意力留出空地，写作和开发才会重新有呼吸感。",
    publishedAt: "2026-04-18",
    readingTime: "6 min read",
    tags: ["Writing", "Focus"],
  },
  {
    slug: "quiet-loops-at-night",
    title: "Quiet Loops at Night",
    description: "那些在深夜里反复调试的循环，常常也在悄悄改变人。",
    publishedAt: "2026-04-12",
    readingTime: "5 min read",
    tags: ["Code", "Craft"],
  },
]
