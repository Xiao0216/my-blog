# SQLite Admin CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-admin SQLite CMS so profile, essays, projects, and notes can be edited from `/admin` and reflected on the public blog immediately.

**Architecture:** Keep the public content API in `lib/content.ts` stable while moving its source of truth to SQLite through a focused CMS data layer. Use Next.js server components and server actions for admin pages, with HMAC-signed HttpOnly cookies for admin sessions.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Tailwind CSS, `node:sqlite`, Vitest.

---

## File Structure

- `lib/cms/schema.ts`: shared CMS types, validators, input parsing, and markdown rendering helpers.
- `lib/cms/db.ts`: SQLite connection, schema initialization, idempotent seed, public reads, admin reads/writes.
- `lib/admin-auth.ts`: password verification, HMAC session cookie signing, session parsing.
- `lib/content.ts`: keep existing exported API, delegate reads to `lib/cms/db.ts`.
- `components/admin/admin-ui.tsx`: reusable admin forms, tables, and layout primitives.
- `app/admin/**`: login, dashboard, profile, essays, projects, and notes pages with server actions.
- `app/essays/[slug]/page.tsx`: runtime essay lookup and safe markdown-compatible rendering.
- `app/rss.xml/route.ts`, `app/sitemap.ts`: force runtime reads where needed.
- `tests/lib/cms-db.test.ts`: DB init, seed idempotency, public filtering, CRUD persistence.
- `tests/lib/admin-auth.test.ts`: password and signed cookie behavior.
- `tests/lib/admin-validation.test.ts`: slug/status/date/input validation.
- `.gitignore`: ignore local SQLite database files.

## Task 1: SQLite Schema, Seed, And Public Reads

**Files:**
- Create: `lib/cms/schema.ts`
- Create: `lib/cms/db.ts`
- Test: `tests/lib/cms-db.test.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Write failing database tests**

```ts
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

let dbPath = ""
let tempDir = ""

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-cms-"))
  dbPath = join(tempDir, "blog.sqlite")
  process.env.BLOG_DATABASE_PATH = dbPath
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  rmSync(tempDir, { recursive: true, force: true })
})

describe("cms database", () => {
  it("initializes tables and seeds current public content once", async () => {
    const db = await import("@/lib/cms/db")

    db.initializeCmsDatabase()
    db.initializeCmsDatabase()

    expect(db.getPublicProfile().name).toBe("縉紳")
    expect(db.getPublicEssays().map((essay) => essay.slug)).toEqual([
      "healthcare-frontend-engineering",
      "large-data-frontend-performance",
    ])
    expect(db.getPublicProjects()).toHaveLength(5)
    expect(db.getPublicNotes()).toHaveLength(3)
  })

  it("excludes draft content from public reads", async () => {
    const db = await import("@/lib/cms/db")

    db.initializeCmsDatabase()
    db.saveEssay({
      slug: "draft-essay",
      title: "Draft essay",
      description: "Hidden draft",
      content: "# Draft",
      publishedAt: "2026-04-24",
      readingTime: "1 min read",
      tags: ["Draft"],
      status: "draft",
    })

    expect(db.getPublicEssays().map((essay) => essay.slug)).not.toContain(
      "draft-essay"
    )
    expect(db.getAllEssaySlugs()).not.toContain("draft-essay")
  })

  it("persists edited content immediately", async () => {
    const db = await import("@/lib/cms/db")

    db.initializeCmsDatabase()
    db.saveNote({
      slug: "fresh-note",
      title: "Fresh note",
      body: "Saved from admin",
      publishedAt: "2026-04-24",
      status: "published",
    })

    expect(db.getPublicNotes()[0]).toMatchObject({
      slug: "fresh-note",
      title: "Fresh note",
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/lib/cms-db.test.ts`

Expected: FAIL because `@/lib/cms/db` does not exist.

- [ ] **Step 3: Implement schema and SQLite data layer**

Create `lib/cms/schema.ts` with shared types, JSON parse/stringify helpers, slug/status/date validation, and newline/comma parsing.

Create `lib/cms/db.ts` with:
- `initializeCmsDatabase()`
- `getPublicProfile()`
- `getPublicEssays()`
- `getEssayBySlug(slug)`
- `getAllEssaySlugs()`
- `getPublicProjects()`
- `getPublicNotes()`
- `saveEssay(input)`
- `saveProject(input)`
- `saveNote(input)`
- `saveProfile(input)`
- delete and status toggle helpers used by admin pages.

Use `node:sqlite`, `CREATE TABLE IF NOT EXISTS`, and `INSERT OR IGNORE` seed behavior. Extract MDX text from `content/essays/*.mdx` as seed article content and never overwrite existing rows.

- [ ] **Step 4: Ignore local SQLite files**

Add to `.gitignore`:

```gitignore
data/*.sqlite
data/*.sqlite-*
```

- [ ] **Step 5: Run tests**

Run: `npm test tests/lib/cms-db.test.ts`

Expected: PASS.

## Task 2: Public Content API And Essay Rendering

**Files:**
- Modify: `lib/content.ts`
- Modify: `app/essays/[slug]/page.tsx`
- Modify: `app/essays/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/notes/page.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `app/rss.xml/route.ts`
- Modify: `app/sitemap.ts`
- Test: `tests/lib/content.test.ts`
- Test: `tests/lib/essay-documents.test.ts`
- Test: `tests/lib/feed.test.ts`

- [ ] **Step 1: Update failing tests for runtime DB content**

Adjust existing tests so `getAllEssaySlugs()` is no longer expected to equal the static MDX registry. Add a draft exclusion assertion through the DB helper.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test tests/lib/content.test.ts tests/lib/essay-documents.test.ts tests/lib/feed.test.ts`

Expected: FAIL while `lib/content.ts` still reads static fixtures.

- [ ] **Step 3: Delegate public helpers to SQLite**

Update `lib/content.ts` so existing exported types and functions remain stable but read via `lib/cms/db.ts`. Return cloned arrays/objects to preserve mutation-safety behavior.

- [ ] **Step 4: Render stored essay content safely**

Update `app/essays/[slug]/page.tsx` to:
- export `dynamic = "force-dynamic"`
- remove `generateStaticParams`
- fetch `getEssayDocumentBySlug(slug)` at runtime
- render stored markdown-compatible text with a local safe renderer that supports headings, paragraphs, bullet lists, and blockquotes as React elements.

- [ ] **Step 5: Force runtime reads for public content routes**

Export `dynamic = "force-dynamic"` from content listing pages, RSS route, and sitemap where necessary.

- [ ] **Step 6: Run tests**

Run: `npm test tests/lib/content.test.ts tests/lib/essay-documents.test.ts tests/lib/feed.test.ts`

Expected: PASS.

## Task 3: Admin Auth And Validation

**Files:**
- Create: `lib/admin-auth.ts`
- Test: `tests/lib/admin-auth.test.ts`
- Test: `tests/lib/admin-validation.test.ts`

- [ ] **Step 1: Write failing auth and validation tests**

Test that correct `ADMIN_PASSWORD` creates a session, wrong/missing passwords fail, tampered cookies fail, invalid slugs fail, invalid statuses fail, and required titles are rejected.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test tests/lib/admin-auth.test.ts tests/lib/admin-validation.test.ts`

Expected: FAIL because auth and validation exports are missing.

- [ ] **Step 3: Implement auth helpers**

Create HMAC helpers with `node:crypto`:
- `verifyAdminPassword(password)`
- `createAdminSessionCookieValue(now?)`
- `verifyAdminSessionCookieValue(value, now?)`
- `adminCookieOptions()`

Use `ADMIN_PASSWORD` as part of the HMAC secret. Return false if the env var is missing.

- [ ] **Step 4: Implement validation helpers**

In `lib/cms/schema.ts`, expose parsing functions for profile, essay, project, and note form data. Return `{ ok: true, value }` or `{ ok: false, errors }` with field-level messages.

- [ ] **Step 5: Run tests**

Run: `npm test tests/lib/admin-auth.test.ts tests/lib/admin-validation.test.ts`

Expected: PASS.

## Task 4: Admin UI And Server Actions

**Files:**
- Create: `components/admin/admin-ui.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/profile/page.tsx`
- Create: `app/admin/essays/page.tsx`
- Create: `app/admin/projects/page.tsx`
- Create: `app/admin/notes/page.tsx`

- [ ] **Step 1: Add protected admin shell**

Create an admin layout that checks the signed cookie server-side and redirects unauthenticated users to `/admin/login`.

- [ ] **Step 2: Add login and logout actions**

Create server actions that verify `ADMIN_PASSWORD`, set/clear an HttpOnly cookie, and redirect to `/admin` after login.

- [ ] **Step 3: Add dashboard**

Show published/draft counts and latest updated rows for essays, projects, and notes.

- [ ] **Step 4: Add profile edit page**

Use a single form for profile fields. Submit through a server action that validates, saves, and revalidates public paths.

- [ ] **Step 5: Add essays CRUD page**

Use compact list + inline edit/create forms. Include status toggle and delete confirmation.

- [ ] **Step 6: Add projects CRUD page**

Use compact list + inline edit/create forms. Parse stack as comma-separated text.

- [ ] **Step 7: Add notes CRUD page**

Use compact list + inline edit/create forms. Include status toggle and delete confirmation.

## Task 5: Full Verification, Commit, And Deploy Prep

**Files:**
- Modify as needed based on verification output.

- [ ] **Step 1: Run complete test suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site npm run build`

Expected: PASS.

- [ ] **Step 5: Commit implementation**

Run:

```bash
git add .
git commit -m "feat: add sqlite admin cms"
```

- [ ] **Step 6: Prepare deployment**

Merge this branch back to the main repo, set `ADMIN_PASSWORD` in `/etc/systemd/system/ai-blog.service`, rebuild, restart `ai-blog`, and verify `/admin/login`.

## Self-Review

- Spec coverage: SQLite storage, idempotent seed, public filtering, single-admin auth, protected admin pages, CRUD, runtime public reads, RSS/sitemap filtering, deployment steps are covered.
- Placeholder scan: no `TBD` or deferred requirements remain.
- Type consistency: public content function names match the existing `lib/content.ts` API and the design spec.
