# Blog Profile Content Design

## Goal

Replace the template-like blog content with a public professional profile for 縉紳, focused on frontend engineering, healthcare systems, data platforms, mini-program development, performance optimization, and engineering execution.

## Public Identity

- Name: 縉紳
- Role: Web 前端开发工程师
- Email: `jinshen0216@gmail.com`
- Work start: 2020
- Education: 太原科技大学，通信工程，本科，2020.06 毕业

The site should present these facts as a professional portfolio. It should avoid exposing unnecessary resume fields such as gender on prominent public pages.

## Content Strategy

Use the existing site structure:

- Homepage: concise professional positioning and selected project/activity feed.
- About: professional bio, education, skills, certifications, and work history.
- Projects: real project portfolio entries.
- Notes: short technical observations or career updates.
- Essays: two starter technical articles replacing the current template essays.

The tone should be direct, credible, and product-like. Avoid exaggerated claims, but keep the quantitative results already supplied by the user when they are tied to specific work outcomes.

## Homepage

Update `data/site.ts`:

- Site title and profile name become `縉紳`.
- Description summarizes frontend engineering work in healthcare and data scenarios.
- Email becomes `jinshen0216@gmail.com`.
- Hero title should position 縉紳 as a frontend engineer who ships healthcare and data products.
- Hero intro should mention Vue, mini-programs, engineering systems, visualization, performance, and cross-team delivery.
- About summary should summarize 2020-present frontend experience and focus on stable business delivery.

## About Page

Use `profile.longBio` to hold a compact professional profile:

- Paragraph 1: frontend engineer since 2020, with experience in healthcare systems, data platforms, H5, mini-programs, and enterprise products.
- Paragraph 2: technical strengths include Vue, Pinia, Naive UI, WebGL, WebSocket, ECharts, performance optimization, componentization, and engineering documentation.
- Paragraph 3: collaboration and execution strengths: requirements clarification, API collaboration, delivery coordination, compliance awareness, and documentation.
- Paragraph 4: education and certifications: 太原科技大学通信工程本科, RCNA, RCNP, 网络工程师职业资格证书.

## Projects

Replace template projects in `data/projects.ts` with:

1. 临研系统
   - Role: 前端开发负责人
   - Stack: Vue, Pinia, Naive UI, ECharts, Axios, WebSocket
   - Emphasis: clinical research workflow, data collection, visualization, real-time collaboration, performance optimization.

2. 某医院云切片小程序
   - Role: 前端技术负责人
   - Stack: 小程序, WebGL, 响应式布局, 扫码 SDK, 水印组件
   - Emphasis: high-resolution slice viewing, mobile performance, security login, watermarking, documentation.

3. 查房系统
   - Role: 前端核心工程师
   - Stack: Vue, 虚拟列表, 权限配置, 数据缓存, 图片优化
   - Emphasis: ward-round workflow, patient aggregation, permission control, desensitization, fast image loading.

4. 数据基础平台
   - Role: 前端架构师
   - Stack: Vue, 虚拟滚动, 低代码查询, 数据资产目录, 状态监控
   - Emphasis: large metadata rendering, query UI, data platform integration, engineering framework.

5. 某医院论坛
   - Role: 前端开发工程师
   - Stack: Vue, WebSocket, RBAC, 图片懒加载, 夜间模式
   - Emphasis: professional discussion, knowledge sharing, real-time messages, content compliance, user experience.

Use internal `href` values such as `/projects` if no public project links exist. Do not link to invalid external URLs as if they are real.

## Notes

Replace lifestyle notes with short technical notes:

- 医疗系统里的前端工程化
- 大数据表格性能优化
- AI 工具进入日常开发

Each note should be a concise observation, not a full article.

## Essays

Replace the two template essays and summaries:

- `healthcare-frontend-engineering`: 医疗系统前端工程化实践
- `large-data-frontend-performance`: 大数据场景下的前端性能优化

The essays can be starter articles, but should contain real technical direction:

- Healthcare article: requirements clarification, compliance UI, permission/watermarking, component reuse, API collaboration.
- Performance article: virtual lists, lazy loading, caching, WebSocket updates, large-table rendering, user-perceived performance.

## Acceptance Criteria

- Public site no longer reads as a generic template blog.
- Homepage, About, Projects, Notes, and Essays all use the provided career information.
- Email is publicly visible in site config/footer paths.
- No fabricated employer names or public project URLs are introduced.
- Existing tests pass after content updates.
- Production build succeeds with `NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site`.
