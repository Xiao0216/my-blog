export type LifeUniverseGalaxySlug =
  | "work"
  | "technology"
  | "writing"
  | "diary"
  | "relationships"
  | "life"
  | "interests"

export type LifeUniverseContentTypeSlug =
  | "article"
  | "diary"
  | "project"
  | "memory"
  | "photo"
  | "fragment"
  | "list"

export type LifeUniverseSpecialAreaSlug =
  | "stardust"
  | "meteor"
  | "unnamed-planet"
  | "black-box"

export type LifeUniverseGalaxy = {
  readonly slug: LifeUniverseGalaxySlug
  readonly name: string
  readonly summary: string
  readonly description: string
  readonly suggestedPlanets: ReadonlyArray<string>
  readonly x: number
  readonly y: number
  readonly size: "small" | "medium" | "large"
  readonly theme: string
  readonly sortOrder: number
  readonly weight: number
}

export type LifeUniverseContentType = {
  slug: LifeUniverseContentTypeSlug
  label: string
  description: string
}

export type LifeUniverseSpecialArea = {
  readonly slug: LifeUniverseSpecialAreaSlug
  readonly label: string
  readonly description: string
  readonly visibility: "public" | "private"
}

export type LifeUniverseTaxonomy = {
  galaxies: Array<LifeUniverseGalaxy & { suggestedPlanets: string[] }>
  contentTypes: LifeUniverseContentType[]
  specialAreas: LifeUniverseSpecialArea[]
}

export const LIFE_UNIVERSE_GALAXIES: ReadonlyArray<LifeUniverseGalaxy> = [
  {
    slug: "work",
    name: "工作与职业",
    summary: "过往工作、项目经历、职业成长、协作复盘和求职准备。",
    description:
      "记录职业历史、工作方式、项目交付、团队协作、阶段复盘和未来职业选择。",
    suggestedPlanets: ["过往工作", "医疗项目", "前端交付", "数据平台", "协作复盘", "职业成长", "求职准备"],
    x: 160,
    y: -140,
    size: "large",
    theme: "cyan",
    sortOrder: 1,
    weight: 10,
  },
  {
    slug: "technology",
    name: "技术与学习",
    summary: "前端、工程化、性能优化、AI 工具、读书学习和实验记录。",
    description:
      "沉淀技术学习、工程判断、工具实践、阅读笔记和可复用的实验经验。",
    suggestedPlanets: ["Vue", "JavaScript", "工程化", "性能优化", "ECharts", "WebSocket", "AI 工具", "读书学习", "实验记录"],
    x: -40,
    y: 320,
    size: "large",
    theme: "blue",
    sortOrder: 2,
    weight: 9,
  },
  {
    slug: "writing",
    name: "写作与表达",
    summary: "正式文章、随笔、观点、摘录、灵感、草稿和发布复盘。",
    description:
      "收纳公开表达、写作素材、观点整理、灵感片段和从草稿到发布的过程。",
    suggestedPlanets: ["正式文章", "随笔", "观点", "摘录", "灵感", "草稿", "发布复盘"],
    x: 420,
    y: 170,
    size: "medium",
    theme: "violet",
    sortOrder: 3,
    weight: 7,
  },
  {
    slug: "diary",
    name: "日记与自我",
    summary: "日常记录、情绪、健康、习惯、阶段复盘、个人目标和自我观察。",
    description:
      "记录日常状态、身体和情绪信号、习惯变化、个人目标以及阶段性自我理解。",
    suggestedPlanets: ["每日记录", "情绪", "健康", "习惯", "阶段复盘", "个人目标", "自我观察"],
    x: -260,
    y: 120,
    size: "large",
    theme: "teal",
    sortOrder: 4,
    weight: 8,
  },
  {
    slug: "relationships",
    name: "关系与情感",
    summary: "感情、朋友、家庭、重要对话、感谢、遗憾和边界感。",
    description:
      "保存亲密关系、朋友、家庭、重要对话、情绪记忆、感谢、遗憾和个人边界。",
    suggestedPlanets: ["感情", "朋友", "家庭", "重要对话", "感谢", "遗憾", "边界感"],
    x: -500,
    y: -160,
    size: "medium",
    theme: "emerald",
    sortOrder: 5,
    weight: 7,
  },
  {
    slug: "life",
    name: "生活与体验",
    summary: "旅游、城市、饮食、租房、消费、生活方式和周末记录。",
    description:
      "记录具体生活体验，包括去过的地方、吃过的东西、住处、消费选择和普通周末。",
    suggestedPlanets: ["旅游", "城市", "饮食", "租房", "消费", "生活方式", "周末记录"],
    x: 300,
    y: -260,
    size: "medium",
    theme: "teal",
    sortOrder: 6,
    weight: 7,
  },
  {
    slug: "interests",
    name: "兴趣与娱乐",
    summary: "游戏、影视、音乐、运动、收藏、折腾的小东西和短期兴趣。",
    description:
      "保存兴趣爱好、娱乐体验、游戏和影视记录、音乐运动、收藏以及阶段性折腾。",
    suggestedPlanets: ["游戏", "影视", "音乐", "运动", "收藏", "折腾的小东西", "短期兴趣"],
    x: -360,
    y: 300,
    size: "medium",
    theme: "violet",
    sortOrder: 7,
    weight: 6,
  },
]

export const LIFE_UNIVERSE_CONTENT_TYPES: ReadonlyArray<LifeUniverseContentType> = [
  { slug: "article", label: "文章", description: "成熟的公开写作。" },
  { slug: "diary", label: "日记", description: "按时间记录的个人状态和经历。" },
  { slug: "project", label: "项目", description: "工作、产品或个人构建记录。" },
  { slug: "memory", label: "记忆", description: "具体经历、偏好、事实或里程碑。" },
  { slug: "photo", label: "照片", description: "视觉记忆、旅行或生活影像。" },
  { slug: "fragment", label: "碎片", description: "短笔记、灵感、摘录或未完成观察。" },
  { slug: "list", label: "清单", description: "计划、推荐、任务、书单、游戏或目标列表。" },
]

export const LIFE_UNIVERSE_SPECIAL_AREAS: ReadonlyArray<LifeUniverseSpecialArea> = [
  {
    slug: "stardust",
    label: "星尘",
    description: "还没有明确归属的临时碎片。",
    visibility: "public",
  },
  {
    slug: "meteor",
    label: "流星",
    description: "短期兴趣或可能消失的阶段性关注。",
    visibility: "public",
  },
  {
    slug: "unnamed-planet",
    label: "未命名星球",
    description: "重复出现但尚未正式命名的新主题。",
    visibility: "public",
  },
  {
    slug: "black-box",
    label: "黑匣子",
    description: "私密或敏感内容，不进入公开展示和公开 AI 上下文。",
    visibility: "private",
  },
]

export function getLifeUniverseGalaxy(slug: string) {
  return LIFE_UNIVERSE_GALAXIES.find((galaxy) => galaxy.slug === slug)
}

export function isBlackBoxArea(slug: string) {
  return slug === "black-box"
}

export function getLifeUniverseTaxonomy(): LifeUniverseTaxonomy {
  return {
    galaxies: LIFE_UNIVERSE_GALAXIES.map((galaxy) => ({
      ...galaxy,
      suggestedPlanets: [...galaxy.suggestedPlanets],
    })),
    contentTypes: LIFE_UNIVERSE_CONTENT_TYPES.map((type) => ({ ...type })),
    specialAreas: LIFE_UNIVERSE_SPECIAL_AREAS.map((area) => ({ ...area })),
  }
}
