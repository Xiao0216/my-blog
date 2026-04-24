# Null Space Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as a Null Space style full-screen life-universe workbench based on `public/export.jpg`.

**Architecture:** Keep `app/(site)/page.tsx` and `HomePageView` as the public data boundary, then move the interactive homepage into smaller client components under `components/site/life-universe/`. Component state lives in `LifeUniverseWorkbench`: selected card, zoom, and twin chat messages. Styles are shared through Tailwind classes and a few named CSS utilities in `app/globals.css`.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Tailwind CSS 4, lucide-react icons, Vitest, Testing Library, Docker Compose deployment.

---

### Task 1: Interaction Tests

**Files:**
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Replace homepage expectations with Null Space workbench expectations**

Use Testing Library to assert the rendered homepage has:

```tsx
expect(screen.getByText("Null Space")).toBeInTheDocument()
expect(screen.getByText("A Thoughtful Blog")).toBeInTheDocument()
expect(screen.getByRole("region", { name: "Null Space universe canvas" })).toBeInTheDocument()
expect(screen.getByRole("complementary", { name: "Null AI digital twin" })).toHaveTextContent("Fixture Twin")
expect(screen.getByRole("button", { name: "聚焦 Work" })).toBeInTheDocument()
expect(screen.getByRole("button", { name: "发送给 Null AI" })).toBeInTheDocument()
```

- [ ] **Step 2: Add a focus interaction test**

Render two planets, click the second card, and assert:

```tsx
await user.click(screen.getByRole("button", { name: "聚焦 Life" }))
expect(screen.getByTestId("selected-card-title")).toHaveTextContent("Life")
expect(screen.getByRole("button", { name: "聚焦 Life" })).toHaveAttribute("data-selected", "true")
```

- [ ] **Step 3: Add zoom and reset interaction tests**

Click zoom in, zoom out, and reset controls:

```tsx
expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")
await user.click(screen.getByRole("button", { name: "放大画布" }))
expect(screen.getByTestId("zoom-value")).toHaveTextContent("88%")
await user.click(screen.getByRole("button", { name: "缩小画布" }))
expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")
await user.click(screen.getByRole("button", { name: "重置画布视角" }))
expect(screen.getByTestId("zoom-value")).toHaveTextContent("78%")
```

- [ ] **Step 4: Add chat interaction test**

Mock `global.fetch`, type a message, submit, and assert:

```tsx
expect(fetch).toHaveBeenCalledWith(
  "/api/twin/chat",
  expect.objectContaining({ method: "POST" })
)
expect(await screen.findByText("AI fixture reply")).toBeInTheDocument()
expect(screen.getByText("Memory fixture")).toBeInTheDocument()
```

- [ ] **Step 5: Run the focused tests and verify failure**

Run:

```bash
npm test tests/components/home-page-view.test.tsx
```

Expected before implementation: tests fail because the Null Space component structure and labels do not exist yet.

### Task 2: Component Extraction

**Files:**
- Create: `components/site/life-universe/types.ts`
- Create: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `components/site/home-page-view.tsx`

- [ ] **Step 1: Define local view types**

Move homepage prop-related types into `types.ts`:

```ts
export type HomePageProfile = {
  heroTitle: string
  heroIntro: string
  aboutSummary: string
}
```

Also export `HomePageNote`, `HomePageEssay`, `HomePageProject`, `HomePageViewProps`, `Viewport`, `ChatMessage`, and `UniverseCardModel`.

- [ ] **Step 2: Create `LifeUniverseWorkbench`**

Implement a client component that receives `HomePageViewProps`, owns state for `selectedCardId`, `zoom`, `chatMessages`, `draftMessage`, and `isSending`, and renders the final child component slots with the labels from Task 1.

- [ ] **Step 3: Slim `HomePageView`**

Replace the current large component with:

```tsx
import { LifeUniverseWorkbench } from "@/components/site/life-universe/life-universe-workbench"
import type { HomePageViewProps } from "@/components/site/life-universe/types"

export type { HomePageViewProps }

export function HomePageView(props: HomePageViewProps) {
  return <LifeUniverseWorkbench {...props} />
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test tests/components/home-page-view.test.tsx
```

Expected: structure tests begin passing, visual-specific and interaction-specific tests still fail until child components are built.

### Task 3: Workbench Visual Components

**Files:**
- Create: `components/site/life-universe/universe-sidebar.tsx`
- Create: `components/site/life-universe/universe-topbar.tsx`
- Create: `components/site/life-universe/universe-canvas.tsx`
- Create: `components/site/life-universe/universe-card.tsx`
- Create: `components/site/life-universe/universe-toolbar.tsx`
- Modify: `components/site/life-universe/life-universe-workbench.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Build `UniverseSidebar`**

Render the left glass rail with lucide icons for close/spark, home, orbit, edit, box, heart, book, and user. Include a small orbit decoration with `aria-hidden="true"`.

- [ ] **Step 2: Build `UniverseTopbar`**

Render `Null Space`, `A Thoughtful Blog`, and right controls for search, filter, and `New`.

- [ ] **Step 3: Build `UniverseCard`**

Render reusable glass cards with category, title, excerpt, date, optional planet glow, `data-selected`, and `onFocus`.

- [ ] **Step 4: Build `UniverseCanvas`**

Create a fixed scene approximating the reference positions. Use a center feature card plus peripheral cards from content data. Render SVG constellation lines and glowing nodes behind cards. Apply `style={{ transform: \`scale(${zoom / 100})\` }}` to the card layer.

- [ ] **Step 5: Build `UniverseToolbar`**

Render bottom floating controls with accessible labels:

```text
抓手模式
画布搜索
缩小画布
放大画布
重置画布视角
连接视图
```

- [ ] **Step 6: Add CSS utilities**

Add `.null-space-shell`, `.null-space-card`, `.null-space-vignette`, `.null-space-noise`, `.null-space-grid`, and `.null-space-orbit` utilities to `app/globals.css`.

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test tests/components/home-page-view.test.tsx
```

Expected: visual structure, focus, zoom, reset, and empty-state tests pass.

### Task 4: Twin Console Interaction

**Files:**
- Create: `components/site/life-universe/twin-console.tsx`
- Modify: `components/site/life-universe/life-universe-workbench.tsx`

- [ ] **Step 1: Build `TwinConsole`**

Render the right panel with orb avatar, `Null AI` label, `BETA` badge, identity subtitle, capability list, transcript, references, input, and send button.

- [ ] **Step 2: Wire chat submission**

In `LifeUniverseWorkbench`, submit non-empty messages to `/api/twin/chat`:

```ts
const response = await fetch("/api/twin/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    message: trimmedMessage,
    history: chatMessages.map(({ role, content }) => ({ role, content })),
  }),
})
```

Append the assistant response and references. On failure, append a concise failure message instead of dropping the user message.

- [ ] **Step 3: Run focused tests**

Run:

```bash
npm test tests/components/home-page-view.test.tsx
```

Expected: all homepage interaction tests pass.

### Task 5: Integration And Deployment

**Files:**
- Modify: `components/site/site-shell.tsx` if needed to keep homepage immersive without header/footer.

- [ ] **Step 1: Keep homepage shell immersive**

If the current route still shows header/footer around the homepage, adjust the site layout so only `/` renders the full-screen homepage without the standard shell. Other pages keep header/footer.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands exit `0`.

- [ ] **Step 3: Rebuild and restart Docker**

Run:

```bash
docker compose up -d --build
docker compose ps
```

Expected: `ai-blog` is `healthy` and still mapped as `127.0.0.1:3001->3000/tcp`.

- [ ] **Step 4: Smoke test through nginx**

Run:

```bash
curl -fsS -H 'Host: blog.wenshuai.site' http://127.0.0.1/ | grep -E 'Null Space|Null AI|数字花园'
curl -fsS -H 'Host: blog.wenshuai.site' http://127.0.0.1/api/twin/chat \
  -H 'content-type: application/json' \
  --data '{"message":"你好","history":[]}' | grep -E '"answer"|"references"'
```

Expected: homepage contains the new workbench labels and chat API returns JSON.
