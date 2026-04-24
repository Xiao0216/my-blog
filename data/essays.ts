export type EssaySummary = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly publishedAt: string
  readonly readingTime: string
  readonly tags: ReadonlyArray<string>
}

export const essaySummaries: ReadonlyArray<EssaySummary> = [
  {
    slug: "healthcare-frontend-engineering",
    title: "医疗系统前端工程化实践",
    description:
      "从需求澄清、权限控制、水印脱敏、组件复用到接口联调，梳理医疗系统前端交付中的工程化重点。",
    publishedAt: "2026-04-24",
    readingTime: "7 min read",
    tags: ["Healthcare", "Vue", "Engineering"],
  },
  {
    slug: "large-data-frontend-performance",
    title: "大数据场景下的前端性能优化",
    description:
      "围绕虚拟列表、懒加载、缓存、WebSocket 实时更新和表格渲染，记录数据平台与医疗系统里的性能优化方法。",
    publishedAt: "2026-04-23",
    readingTime: "6 min read",
    tags: ["Performance", "Data", "Frontend"],
  },
]
