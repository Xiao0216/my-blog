export type NoteEntry = {
  readonly slug: string
  readonly title: string
  readonly body: string
  readonly publishedAt: string
}

export const notes: ReadonlyArray<NoteEntry> = [
  {
    slug: "healthcare-frontend-engineering-note",
    title: "医疗系统里的前端工程化",
    body: "医疗项目的前端不只是页面实现，还要把权限、脱敏、水印、文档和交付流程纳入同一套工程体系。",
    publishedAt: "2026-04-24",
  },
  {
    slug: "large-table-performance-note",
    title: "大数据表格性能优化",
    body: "千万级元数据和多患者列表场景里，虚拟滚动、缓存、懒加载和合理的接口分页比单纯堆组件更重要。",
    publishedAt: "2026-04-23",
  },
  {
    slug: "ai-tools-in-development-note",
    title: "智能工具进入日常开发",
    body: "智能工具更适合成为需求拆解、代码审查和方案对比的辅助工具，真正的价值仍来自工程师对业务边界和质量标准的判断。",
    publishedAt: "2026-04-22",
  },
]
