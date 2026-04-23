export type NavigationLink = {
  href: string
  label: string
}

export type SiteConfig = {
  title: string
  description: string
  siteUrl: string
  email: string
  navigation: NavigationLink[]
  footerLinks: NavigationLink[]
}

export type ProfileData = {
  name: string
  roleLine: string
  heroTitle: string
  heroIntro: string
  aboutSummary: string
  longBio: string[]
}

export const siteConfig: SiteConfig = {
  title: "Quiet Chapters",
  description: "一个把代码、写作与生活观察慢慢展开的个人空间。",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@localhost.test",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/essays", label: "Essays" },
    { href: "/notes", label: "Notes" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ],
  footerLinks: [
    { href: "mailto:hello@localhost.test", label: "Email" },
    { href: "/rss.xml", label: "RSS" },
  ],
}

export const profile: ProfileData = {
  name: "Quiet Chapters",
  roleLine: "开发者 / 写作者 / 观察生活的人",
  heroTitle: "把代码、文字与日常感受，慢慢写成自己的空间。",
  heroIntro:
    "这里记录长期思考、生活碎片，以及那些愿意反复打磨的作品。",
  aboutSummary:
    "我习惯在技术、写作和日常观察之间来回穿梭，把真正重要的东西一点点写清楚。",
  longBio: [
    "写代码的时候，我关心结构、节奏和长期维护；写文字的时候，我关心那些被匆忙生活忽略掉的小波动。",
    "这个网站会同时容纳正式文章、短碎片和正在生长的项目，让它们像同一本私人刊物里的不同章节。",
  ],
}
