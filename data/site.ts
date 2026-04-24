import { normalizeSiteUrl } from "@/lib/site-url"

export type NavigationLink = {
  readonly href: string
  readonly label: string
}

export type SiteConfig = {
  readonly title: string
  readonly description: string
  readonly siteUrl: string
  readonly email: string
  readonly navigation: ReadonlyArray<NavigationLink>
  readonly footerLinks: ReadonlyArray<NavigationLink>
}

export type ProfileData = {
  readonly name: string
  readonly roleLine: string
  readonly heroTitle: string
  readonly heroIntro: string
  readonly aboutSummary: string
  readonly longBio: ReadonlyArray<string>
}

export const siteConfig: SiteConfig = {
  title: "縉紳",
  description:
    "Web 前端开发工程师，关注医疗系统、数据平台、小程序、工程化与性能优化。",
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? ""),
  email: "jinshen0216@gmail.com",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/essays", label: "Essays" },
    { href: "/notes", label: "Notes" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ],
  footerLinks: [
    { href: "mailto:jinshen0216@gmail.com", label: "Email" },
    { href: "/rss.xml", label: "RSS" },
  ],
}

export const profile: ProfileData = {
  name: "縉紳",
  roleLine: "Web 前端开发工程师",
  heroTitle: "面向医疗与数据场景，交付稳定、可维护的前端产品。",
  heroIntro:
    "2020 年开始从事前端开发，长期参与医疗系统、数据平台、H5 与小程序建设，熟悉 Vue 技术栈、工程化体系、ECharts 可视化、WebSocket 实时通信与性能优化。",
  aboutSummary:
    "2020 年开始从事前端开发，具备从需求梳理、组件封装、接口协作到上线交付的完整经验，关注稳定交付、可维护架构和业务效率提升。",
  longBio: [
    "我从 2020 年开始从事 Web 前端开发，主要参与医疗信息化系统、数据基础平台、H5 页面、小程序和企业级业务产品建设。工作中既关注界面体验，也重视需求理解、流程合规、稳定交付和后续维护。",
    "技术上主要使用 Vue、JavaScript、HTML、CSS、Ajax、Node.js 等前端技术，结合 Pinia、Naive UI、ECharts、WebGL、WebSocket、虚拟列表、图片懒加载和缓存策略解决复杂业务场景中的性能与交互问题。",
    "项目协作中，我习惯先和项目经理、后端工程师、UI 设计师明确边界，再推进组件封装、接口联调、权限控制、文档沉淀和上线交付。过去的项目覆盖临床研究、云切片、查房、数据资产、医疗论坛等场景。",
    "我毕业于太原科技大学通信工程专业，本科学历，2020 年 6 月毕业。持有锐捷 RCNA 网络工程师认证、锐捷 RCNP 高级网络工程师认证和网络工程师职业资格证书。邮箱：jinshen0216@gmail.com。",
  ],
}
