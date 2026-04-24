# Spatial Canvas Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current product-style homepage with an interactive dark spatial canvas where essays, projects, and notes appear as connected knowledge nodes.

**Architecture:** Keep `app/(site)/page.tsx` and the SQLite content helpers unchanged at the data boundary. Rebuild `components/site/home-page-view.tsx` as a client component that derives canvas nodes from existing props and handles pan, zoom, focus, and mobile fallback locally.

**Tech Stack:** Next.js App Router, React client component state, TypeScript, Tailwind CSS, Vitest + Testing Library.

---

### Task 1: Define Homepage Behavior With Tests

**Files:**
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Replace product homepage expectations**

Write tests that expect:
- a `知识星图` heading
- a canvas region named `Spatial knowledge canvas`
- controls named `放大`, `缩小`, and `重置视角`
- essay/project/note nodes
- a focus panel that updates after clicking a node
- mobile stream labels and empty states

- [ ] **Step 2: Run the test**

Run: `npm test tests/components/home-page-view.test.tsx`

Expected: FAIL because the current homepage still renders product panels.

### Task 2: Implement Spatial Canvas Homepage

**Files:**
- Modify: `components/site/home-page-view.tsx`

- [ ] **Step 1: Convert component to client component**

Add `"use client"` and local React state for pan, zoom, dragging, and selected node.

- [ ] **Step 2: Build node model**

Map essays, projects, and notes to stable coordinates, sizes, labels, descriptions, and links.

- [ ] **Step 3: Render desktop canvas**

Render a dark viewport, graph SVG lines, glass nodes, identity console, coordinate readout, and focus panel.

- [ ] **Step 4: Render mobile constellation stream**

Render nodes as a vertical connected stream below the same identity console, with tap/click focus.

- [ ] **Step 5: Run component test**

Run: `npm test tests/components/home-page-view.test.tsx`

Expected: PASS.

### Task 3: Tune Global Homepage Atmosphere

**Files:**
- Modify: `app/globals.css`
- Modify: `components/site/site-shell.tsx` if spacing conflicts appear

- [ ] **Step 1: Add spatial utility classes**

Add reusable CSS for background grid/noise, glass node, and reduced-motion handling.

- [ ] **Step 2: Verify public pages still render**

Run: `npm test tests/components/content-pages.test.tsx tests/components/site-shell.test.tsx`

Expected: PASS.

### Task 4: Full Verification And Deployment

**Files:**
- Modify as needed based on verification output.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site npm run build`

Expected: PASS.

- [ ] **Step 4: Commit and deploy**

Commit with `feat: add spatial canvas homepage`, restart `ai-blog`, and verify homepage/admin login over HTTP.

## Self-Review

- Spec coverage: homepage canvas, mobile fallback, dark glass visual system, focus interaction, and backend preservation are covered.
- Placeholder scan: no deferred implementation placeholders.
- Type consistency: component props remain compatible with `app/(site)/page.tsx`.
