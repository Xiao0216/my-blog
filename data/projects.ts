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
    slug: "clinical-research-system",
    title: "临研系统",
    description:
      "面向临床研究全流程数字化管理的业务系统，覆盖研究数据采集、分析、协作与可视化。",
    stack: ["前端框架", "状态管理", "组件库", "图表可视化", "网络请求", "实时通信"],
    href: "/projects",
    note: "担任前端开发负责人，负责核心前端架构与业务落地，通过代码分割、缓存机制和实时同步能力提升海量数据处理流畅度。",
  },
  {
    slug: "cloud-slice-mini-program",
    title: "某医院云切片小程序",
    description:
      "用于移动端高清病理切片查看与识别的医院小程序，重点解决大图加载、适配与安全访问问题。",
    stack: ["小程序", "图形渲染", "响应式布局", "扫码能力", "水印组件"],
    href: "/projects",
    note: "担任前端技术负责人，独立负责高清切片扫描识别模块，基于图形渲染能力将移动端加载速度提升 60%，并搭建双重登录验证与水印能力。",
  },
  {
    slug: "ward-round-system",
    title: "查房系统",
    description:
      "服务医生查房流程的患者信息聚合与任务管理系统，支持权限控制、数据脱敏和高频信息切换。",
    stack: ["前端框架", "虚拟列表", "权限配置", "数据缓存", "图片优化"],
    href: "/projects",
    note: "担任前端核心工程师，通过数据缓存使信息加载速度提升 50%，用虚拟列表优化多患者切换流畅度 70%，并将检查报告图片等待时间缩短至 1 秒内。",
  },
  {
    slug: "data-foundation-platform",
    title: "数据基础平台",
    description:
      "面向数据资产目录、低代码查询与接口状态监控的数据中台前端平台。",
    stack: ["前端框架", "虚拟滚动", "低代码查询", "数据资产目录", "状态监控"],
    href: "/projects",
    note: "担任前端架构师，负责千万级元数据渲染、查询历史、状态监控和工程化框架搭建，通过虚拟滚动解决大数据量表格渲染瓶颈。",
  },
  {
    slug: "hospital-forum",
    title: "某医院论坛",
    description:
      "面向专业讨论与知识共享的医疗社区模块，支持实时消息、内容合规和多角色权限。",
    stack: ["前端框架", "实时通信", "角色权限", "图片懒加载", "夜间模式"],
    href: "/projects",
    note: "独立负责讨论区、知识共享模块和消息中心，通过组件化设计、敏感词过滤、图片懒加载与缓存将首页加载速度提升 50%。",
  },
]
