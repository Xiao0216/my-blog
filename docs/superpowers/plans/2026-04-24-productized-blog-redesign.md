# Productized Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the blog frontend from a soft editorial style into a crisp product-like personal site.

**Architecture:** Keep the existing Next.js App Router and content data flow. Update visual behavior through focused component changes and shared CSS utility classes, without adding new routes or data sources.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 CSS-first theme tokens, Vitest, Testing Library.

---

## File Map

- Modify `tests/components/home-page-view.test.tsx`: lock in the productized homepage structure and removal of the decorative hero.
- Modify `tests/components/content-pages.test.tsx`: keep secondary-page behavior covered while accepting the new empty-state wording.
- Modify `app/globals.css`: replace warm journal tokens with zinc-like product tokens and add shared product classes.
- Modify `app/layout.tsx`: remove the editorial display font and use product-like sans/mono fonts.
- Modify `components/site/site-header.tsx`: rebuild the header as a compact product status bar.
- Modify `components/site/home-page-view.tsx`: replace chapter narrative layout with a 40/60 identity/feed dashboard and compact content sections.
- Modify `components/site/section-heading.tsx`: reduce heading scale and use shared metadata label styling.
- Modify `components/site/page-intro.tsx`: align index-page intros with the product visual system.
- Modify `components/site/essay-card.tsx`: convert essay cards to product panels.
- Modify `components/site/project-card.tsx`: convert project cards and chips to product panels.
- Modify `components/site/note-timeline.tsx`: convert notes to interactive rows and explicit empty state.
- Modify `app/projects/page.tsx`: use the shared empty-state style for project empty states.

## Task 1: Test The New Homepage Contract

**Files:**
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Update the homepage structure test before implementation**

Replace the first `it(...)` block with:

```tsx
it("renders a productized homepage with identity metadata and latest feed", () => {
  const { container } = render(<HomePageView {...buildProps()} />)

  expect(
    screen.getByRole("heading", { name: "Fixture hero title" })
  ).toBeInTheDocument()
  expect(screen.getByText("Identity")).toBeInTheDocument()
  expect(screen.getByText("Focus")).toBeInTheDocument()
  expect(screen.getByText("Latest")).toBeInTheDocument()
  expect(screen.getByText("Essay")).toBeInTheDocument()
  expect(screen.getByText("Project")).toBeInTheDocument()
  expect(screen.getByText("Note")).toBeInTheDocument()
  expect(screen.getByText("A short essay description")).toBeInTheDocument()
  expect(screen.getByText("A project note")).toBeInTheDocument()
  expect(screen.getByText("A short note body")).toBeInTheDocument()
  expect(screen.getByText("2026-03-01").tagName).toBe("TIME")
  expect(screen.getByText("2026-03-01")).toHaveAttribute(
    "dateTime",
    "2026-03-01"
  )
  expect(screen.getByText("2026-03-02").tagName).toBe("TIME")
  expect(screen.getByText("2026-03-02")).toHaveAttribute(
    "dateTime",
    "2026-03-02"
  )
  expect(screen.getByRole("link", { name: "View all essays" })).toHaveAttribute(
    "href",
    "/essays"
  )
  expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Update the homepage empty-state test before implementation**

Replace the second `it(...)` block with:

```tsx
it("renders product empty states when notes, essays, and projects are empty", () => {
  render(
    <HomePageView
      {...buildProps({
        notes: [],
        essays: [],
        projects: [],
      })}
    />
  )

  expect(screen.getByText("No notes yet")).toBeInTheDocument()
  expect(screen.getByText("No essays yet")).toBeInTheDocument()
  expect(screen.getByText("No projects yet")).toBeInTheDocument()
})
```

- [ ] **Step 3: Run the focused test and verify it fails for the right reason**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: FAIL because the current homepage still renders chapter labels, Chinese fallback copy, and the decorative `HeroIllustration`.

- [ ] **Step 4: Commit the red test**

```bash
git add tests/components/home-page-view.test.tsx
git commit -m "test: lock productized homepage contract"
```

## Task 2: Add Product Tokens And Shared Classes

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the font setup in `app/layout.tsx`**

Use Geist for the sans/heading variables and Geist Mono for mono. Replace the font imports and constants with:

```tsx
import { Geist, Geist_Mono } from "next/font/google"

const sansFont = Geist({
  subsets: ["latin"],
  variable: "--font-sans-body",
})

const headingFont = Geist({
  subsets: ["latin"],
  variable: "--font-heading-display",
})

const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
})
```

Keep the existing `className={cn(headingFont.variable, bodyFont.variable, monoFont.variable)}` shape by renaming `bodyFont` to `sansFont` in the `<html>` class:

```tsx
className={cn(headingFont.variable, sansFont.variable, monoFont.variable)}
```

- [ ] **Step 2: Replace CSS theme tokens in `app/globals.css`**

Update `:root`, `.dark`, `body`, and `@layer components` to use the product system:

```css
:root {
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.21 0.006 286);
  --muted: oklch(0.967 0.001 286);
  --muted-foreground: oklch(0.552 0.016 286);
  --border: oklch(0.92 0.004 286 / 0.72);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.21 0.006 286);
  --primary: oklch(0.21 0.006 286);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286);
  --secondary-foreground: oklch(0.21 0.006 286);
  --accent: oklch(0.967 0.001 286);
  --accent-foreground: oklch(0.21 0.006 286);
  --input: oklch(0.92 0.004 286);
  --ring: oklch(0.552 0.016 286);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.141 0.005 286);
  --foreground: oklch(0.985 0 0);
  --muted: oklch(0.21 0.006 286);
  --muted-foreground: oklch(0.705 0.015 286);
  --border: oklch(0.274 0.006 286 / 0.72);
  --card: oklch(0.168 0.006 286);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.141 0.005 286);
  --secondary: oklch(0.21 0.006 286);
  --secondary-foreground: oklch(0.985 0 0);
  --accent: oklch(0.21 0.006 286);
  --accent-foreground: oklch(0.985 0 0);
  --input: oklch(0.274 0.006 286);
  --ring: oklch(0.705 0.015 286);
}
```

Replace the decorative body background with:

```css
body {
  @apply bg-background text-foreground;
}
```

Replace the component utility classes with:

```css
@layer components {
  .page-frame {
    @apply mx-auto w-full max-w-6xl px-5 sm:px-6;
  }

  .story-section {
    @apply py-10 md:py-14;
  }

  .metadata-label {
    @apply font-mono text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground uppercase;
  }

  .story-label {
    @apply metadata-label;
  }

  .product-panel {
    @apply rounded-lg border border-border bg-card;
  }

  .paper-card {
    @apply product-panel;
  }

  .interactive-row {
    @apply flex items-start justify-between gap-4 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/55;
  }

  .neutral-chip {
    @apply inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground;
  }

  .soft-grid {
    @apply grid gap-4 md:grid-cols-2;
  }
}
```

- [ ] **Step 3: Run the focused homepage test**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: still FAIL because component markup has not been updated yet.

- [ ] **Step 4: Commit product tokens**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: add productized visual tokens"
```

## Task 3: Rebuild The Header As A Product Status Bar

**Files:**
- Modify: `components/site/site-header.tsx`
- Verify: `tests/components/site-shell.test.tsx`

- [ ] **Step 1: Replace `SiteHeader` markup**

Use this implementation:

```tsx
import Link from "next/link"

import { profile, siteConfig } from "@/data/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="page-frame flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-foreground"
        >
          {profile.name}
        </Link>

        <nav
          aria-label="Primary"
          className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground md:order-2 md:w-auto md:justify-center"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground md:order-3">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span>Open for work</span>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Run shell tests**

Run:

```bash
npm test -- tests/components/site-shell.test.tsx
```

Expected: PASS. The test checks landmarks and configured navigation links, which should remain intact.

- [ ] **Step 3: Commit header change**

```bash
git add components/site/site-header.tsx
git commit -m "style: productize site header"
```

## Task 4: Rebuild The Homepage Dashboard

**Files:**
- Modify: `components/site/home-page-view.tsx`
- Verify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Remove `HeroIllustration` usage**

Delete this import:

```tsx
import { HeroIllustration } from "@/components/site/hero-illustration"
```

Do not delete `components/site/hero-illustration.tsx` in this task; leaving it unused keeps the change scoped.

- [ ] **Step 2: Add local helper types and functions**

Inside `components/site/home-page-view.tsx`, after the prop types, add:

```tsx
type FeedItem = {
  type: "Essay" | "Project" | "Note"
  title: string
  description: string
  date?: string
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="product-panel flex items-center gap-3 p-4 text-sm text-muted-foreground">
      <span className="grid h-6 w-6 place-items-center rounded-md border border-border font-mono text-xs">
        —
      </span>
      <span>{label}</span>
    </div>
  )
}
```

- [ ] **Step 3: Build feed items at the start of `HomePageView`**

Inside `HomePageView`, before `return`, add:

```tsx
const feedItems: FeedItem[] = [
  essays[0] && {
    type: "Essay" as const,
    title: essays[0].title,
    description: essays[0].description,
    date: essays[0].publishedAt,
  },
  projects[0] && {
    type: "Project" as const,
    title: projects[0].title,
    description: projects[0].note,
  },
  notes[0] && {
    type: "Note" as const,
    title: notes[0].title,
    description: notes[0].body,
    date: notes[0].publishedAt,
  },
].filter((item): item is FeedItem => Boolean(item))
```

- [ ] **Step 4: Replace the homepage JSX**

Replace the entire returned JSX with a product dashboard structure:

```tsx
return (
  <div className="page-frame">
    <section className="grid gap-6 py-10 md:grid-cols-[0.8fr_1.2fr] md:py-16">
      <div className="product-panel p-5 md:p-6">
        <p className="metadata-label">Identity</p>
        <h1 className="mt-4 max-w-xl text-2xl font-semibold leading-tight text-foreground md:text-3xl">
          {profile.heroTitle}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          {profile.heroIntro}
        </p>
        <div className="mt-6 grid gap-3 text-sm">
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium text-foreground">Developer / Writer</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground">Focus</span>
            <span className="font-medium text-foreground">Code, essays, projects</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-foreground">Maintaining this archive</span>
          </div>
        </div>
      </div>

      <div className="product-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="metadata-label">Latest</p>
            <h2 className="mt-1 text-base font-semibold text-foreground">
              Recent activity
            </h2>
          </div>
          <Link
            href="/essays"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            View all essays
          </Link>
        </div>
        {feedItems.length > 0 ? (
          <div>
            {feedItems.map((item) => (
              <article key={`${item.type}-${item.title}`} className="interactive-row">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 rounded-md border border-border px-2 py-1 font-mono text-[0.68rem] font-medium text-muted-foreground">
                    {item.type}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                {item.date ? (
                  <time
                    className="hidden shrink-0 text-xs text-muted-foreground sm:block"
                    dateTime={item.date}
                  >
                    {item.date}
                  </time>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState label="No entries yet" />
          </div>
        )}
      </div>
    </section>

    <section className="story-section space-y-5">
      <SectionHeading
        chapter="Essays"
        title="正式文章"
        intro="更完整的结构、更慢的推演，以及值得留给长阅读的内容。"
      />
      <div className="soft-grid">
        {essays.length > 0 ? (
          essays.map((essay) => (
            <article key={essay.slug} className="product-panel p-5">
              <time className="metadata-label" dateTime={essay.publishedAt}>
                {essay.publishedAt}
              </time>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {essay.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {essay.description}
              </p>
            </article>
          ))
        ) : (
          <EmptyState label="No essays yet" />
        )}
      </div>
    </section>

    <section className="story-section space-y-5">
      <SectionHeading
        chapter="Projects"
        title="项目"
        intro="正在打磨、值得长期维护，或者足以说明工作方式的作品。"
      />
      <div className="soft-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <article key={project.slug} className="product-panel p-5">
              <h3 className="text-lg font-semibold text-foreground">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {project.description}
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground/80">
                {project.note}
              </p>
            </article>
          ))
        ) : (
          <EmptyState label="No projects yet" />
        )}
      </div>
    </section>

    <section className="story-section space-y-5">
      <SectionHeading
        chapter="Notes"
        title="生活碎片"
        intro="轻量记录，但依然保持可回看、可整理的结构。"
      />
      <div className="soft-grid">
        {notes.length > 0 ? (
          notes.map((note) => (
            <article key={note.slug} className="product-panel p-5">
              <time className="metadata-label" dateTime={note.publishedAt}>
                {note.publishedAt}
              </time>
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {note.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {note.body}
              </p>
            </article>
          ))
        ) : (
          <EmptyState label="No notes yet" />
        )}
      </div>
    </section>
  </div>
)
```

- [ ] **Step 5: Run the homepage test**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit homepage change**

```bash
git add components/site/home-page-view.tsx tests/components/home-page-view.test.tsx
git commit -m "feat: productize homepage dashboard"
```

## Task 5: Productize Shared Content Components

**Files:**
- Modify: `components/site/section-heading.tsx`
- Modify: `components/site/page-intro.tsx`
- Modify: `components/site/essay-card.tsx`
- Modify: `components/site/project-card.tsx`
- Modify: `components/site/note-timeline.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `tests/components/content-pages.test.tsx`

- [ ] **Step 1: Update the note empty-state assertion before implementation**

In `tests/components/content-pages.test.tsx`, replace:

```tsx
expect(screen.getByText("碎片正在路上。")).toBeInTheDocument()
```

with:

```tsx
expect(screen.getByText("No notes yet")).toBeInTheDocument()
```

- [ ] **Step 2: Run the content-page test and verify it fails**

Run:

```bash
npm test -- tests/components/content-pages.test.tsx
```

Expected: FAIL because `NoteTimeline` still renders `碎片正在路上。`.

- [ ] **Step 3: Replace `SectionHeading` markup**

Use this return value:

```tsx
return (
  <div className="space-y-2">
    <p className="metadata-label">{chapter}</p>
    <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
      {title}
    </h2>
    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
      {intro}
    </p>
  </div>
)
```

- [ ] **Step 4: Replace `PageIntro` markup**

Use this return value:

```tsx
return (
  <div className="space-y-3">
    <p className="metadata-label">{eyebrow}</p>
    <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
      {title}
    </h1>
    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
      {description}
    </p>
  </div>
)
```

- [ ] **Step 5: Replace `EssayCard` surface classes**

Change the article and inner classes to:

```tsx
<article className="product-panel p-5 transition-colors hover:border-foreground/30">
  <p className="metadata-label">
    {essay.publishedAt} · {essay.readingTime}
  </p>
  <h2 className="mt-3 text-xl font-semibold text-foreground">
    <Link href={`/essays/${essay.slug}`} className="underline-offset-4 hover:underline">
      {essay.title}
    </Link>
  </h2>
  <p className="mt-3 text-sm leading-7 text-muted-foreground">
    {essay.description}
  </p>
  <div className="mt-4 flex flex-wrap gap-2">
    {essay.tags.map((tag) => (
      <span key={tag} className="neutral-chip">
        {tag}
      </span>
    ))}
  </div>
</article>
```

- [ ] **Step 6: Replace `ProjectCard` surface classes**

Keep the external-link safety logic unchanged. Use:

```tsx
const className =
  "mt-5 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
```

and render the article as:

```tsx
<article className="product-panel p-5 transition-colors hover:border-foreground/30">
  <h2 className="text-xl font-semibold text-foreground">{project.title}</h2>
  <p className="mt-3 text-sm leading-7 text-muted-foreground">
    {project.description}
  </p>
  <p className="mt-3 text-sm leading-7 text-foreground/80">{project.note}</p>
  <div className="mt-4 flex flex-wrap gap-2">
    {project.stack.map((item) => (
      <span key={item} className="neutral-chip">
        {item}
      </span>
    ))}
  </div>
  {/* existing Link/a branch stays here */}
</article>
```

- [ ] **Step 7: Replace `NoteTimeline` markup and empty state**

Use:

```tsx
if (notes.length === 0) {
  return (
    <div className="product-panel flex items-center gap-3 p-4 text-sm text-muted-foreground">
      <span className="grid h-6 w-6 place-items-center rounded-md border border-border font-mono text-xs">
        —
      </span>
      <span>No notes yet</span>
    </div>
  )
}

return (
  <div className="product-panel overflow-hidden">
    {notes.map((note) => (
      <article key={note.slug} className="interactive-row">
        <time
          className="shrink-0 font-mono text-xs text-muted-foreground"
          dateTime={note.publishedAt}
        >
          {note.publishedAt}
        </time>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {note.title}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">{note.body}</p>
        </div>
      </article>
    ))}
  </div>
)
```

- [ ] **Step 8: Update project page empty state style**

In `app/projects/page.tsx`, replace the empty state paragraph with:

```tsx
<p className="product-panel p-5 text-sm text-muted-foreground">
  正在整理值得被展开讲述的项目。
</p>
```

- [ ] **Step 9: Run content-page tests**

Run:

```bash
npm test -- tests/components/content-pages.test.tsx
```

Expected: PASS.

- [ ] **Step 10: Commit shared component changes**

```bash
git add components/site/section-heading.tsx components/site/page-intro.tsx components/site/essay-card.tsx components/site/project-card.tsx components/site/note-timeline.tsx app/projects/page.tsx tests/components/content-pages.test.tsx
git commit -m "style: productize content components"
```

## Task 6: Full Verification And Visual Run

**Files:**
- No planned file edits unless verification exposes issues.

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: exit code 0.

- [ ] **Step 5: Start the dev server for review**

Run:

```bash
npm run dev
```

Expected: Next.js dev server starts and prints a local URL. If port 3000 is busy, use the alternate port printed by Next.js.

- [ ] **Step 6: Commit any verification fixes**

If verification required fixes:

```bash
git add <changed-files>
git commit -m "fix: complete productized redesign verification"
```

If no fixes were needed, do not create an empty commit.

## Self-Review Checklist

- Spec coverage: homepage no longer uses `HeroIllustration`; header becomes status-bar-like; cards use radius at or below 8px; zinc-like tokens are defined; no new Tailwind box-shadow preset is introduced.
- Test coverage: homepage behavior and empty states are covered; secondary components preserve link safety and semantic time tests.
- Type consistency: `FeedItem`, `EmptyState`, `.product-panel`, `.interactive-row`, `.metadata-label`, and `.neutral-chip` are defined before use.
- Scope: no CMS, analytics, auth, or content model changes are included.
