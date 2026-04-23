export type ProjectEntry = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly stack: ReadonlyArray<string>
  readonly href: string
  readonly note: string
}

export const projects: ReadonlyArray<ProjectEntry> = [
  {
    slug: "rain-map",
    title: "Rain Map",
    description: "一张把城市天气和通勤路线放在一起观察的小地图。",
    stack: ["Next.js", "Mapbox", "TypeScript"],
    href: "https://example.invalid/rain-map",
    note: "它把我对日常观察和界面表达的兴趣放在了同一个项目里。",
  },
  {
    slug: "margin-notes",
    title: "Margin Notes",
    description: "一个给长文做边注和二次写作的小工具。",
    stack: ["React", "SQLite", "Tailwind"],
    href: "https://example.invalid/margin-notes",
    note: "它提醒我，写作并不总是从正文开始，很多时候是从旁边的小句子开始。",
  },
  {
    slug: "still-frame",
    title: "Still Frame",
    description: "把随手拍下的生活切片做成可检索图文档案。",
    stack: ["Next.js", "Postgres", "UploadThing"],
    href: "https://example.invalid/still-frame",
    note: "这是我把“观察生活”具体落到产品形态上的一次尝试。",
  },
]
