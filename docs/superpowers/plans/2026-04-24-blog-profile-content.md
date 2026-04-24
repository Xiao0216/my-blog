# Blog Profile Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace template blog content with 縉紳's professional frontend engineering portfolio content.

**Architecture:** Keep the current data-driven content model. Update `data/*` records, replace the two MDX essays, and keep tests focused on data alignment and rendering behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, Vitest.

---

## Tasks

- [ ] Update `data/site.ts` with public identity, email, homepage copy, and About bio.
- [ ] Update `data/projects.ts` with five real project entries and internal `/projects` links.
- [ ] Update `data/notes.ts` with three technical notes.
- [ ] Replace `data/essays.ts` summaries and `content/essays/index.ts` slugs with two technical articles.
- [ ] Delete old essay MDX files and create `healthcare-frontend-engineering.mdx` and `large-data-frontend-performance.mdx`.
- [ ] Add focused content assertions to `tests/lib/content.test.ts` and `tests/lib/essay-documents.test.ts`.
- [ ] Run `npm test`, `npm run lint`, `npm run typecheck`, and `NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site npm run build`.
- [ ] Restart `ai-blog` service and verify `https://blog.wenshuai.site`.

## Acceptance Checks

- Site identity is `縉紳`.
- Footer/site email is `jinshen0216@gmail.com`.
- Projects include 临研系统、某医院云切片小程序、查房系统、数据基础平台、某医院论坛.
- Essays include 医疗系统前端工程化实践 and 大数据场景下的前端性能优化.
- No invalid external project URLs are introduced.
