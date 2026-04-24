# Immersive Planet Entry

## Goal

Evolve the Null Space homepage from a fixed dashboard into a full-canvas life universe: cards are automatically arranged without overlap, the digital twin lives inside the star map as a floating avatar, and double-clicking a planet transitions into an immersive planet detail view.

## Scope

This is a focused homepage interaction upgrade. It does not replace the CMS, change the public content routes, or introduce a heavy 3D rendering stack.

The first implementation should include:

- Automatic, deterministic, non-overlapping card layout.
- Persistent CSS 3D card posture.
- Single-click focus and double-click planet entry.
- Embedded AI avatar that expands into a floating chat/search panel.
- Planet detail overlay with experience-first content.
- Performance safeguards for smooth interaction.

## Design Principles

The entire homepage is the universe. No major interaction should feel like it belongs to a separate app shell.

The layout must be stable. A user should build spatial memory around where Life, Work, Diary, Technology, projects, notes, and memories appear. Positions may respond to data changes, viewport size, and zoom level, but they must not be random on each render.

The experience should feel spatial but stay readable. CSS 3D is enough for this phase because cards remain text-heavy interactive UI. Three.js, shader materials, and force simulation are deferred until the product needs real 3D geometry.

## Automatic Layout

Replace the current hand-written `planetSlots` and `noteSlots` with a deterministic layout helper.

### Input Model

Each card receives layout metadata:

- `id`
- `kind`: `core`, `planet`, `essay`, `project`, `note`, `memory`
- `group`: parent planet or conceptual cluster
- `importance`: numeric weight used for size and ring priority
- `width` and `height`
- `status`: `seedling`, `growing`, `mature`, or `archived`
- `tone`

### Ring Strategy

The layout uses rings around the center:

- Ring 0: core digital garden card.
- Ring 1: primary life planets such as Life, Work, Diary, Technology, Relationships, Health.
- Ring 2: featured essays, projects, memories, and notes connected to primary planets.
- Ring 3: lower-priority notes, drafts, fragments, and archived material.

Each ring has a radius and minimum gap. Large and important nodes are placed first so smaller nodes adapt around them.

### Collision Resolution

After initial polar placement, run rectangle collision resolution:

- Treat each card as a rectangle expanded by a safety margin of `32px`.
- Detect overlap against already placed cards.
- If a card overlaps, move it forward along the ring by a small angular step.
- If the ring cannot fit it after a bounded number of attempts, move it to the next outer ring.
- Clamp final positions to the virtual canvas bounds.

The algorithm must be pure and deterministic. Given the same cards and viewport bucket, it returns the same positions.

## Card 3D System

Cards should have a base 3D posture before hover.

Base posture is derived from each card's position relative to the center:

- Left-side cards rotate slightly toward the center.
- Right-side cards rotate slightly toward the center.
- Upper cards tilt down a little.
- Lower cards tilt up a little.
- The core card is flatter and closer to the camera.
- Important cards get more `translateZ`.
- Seedling cards feel farther away through opacity and lower depth.

Implementation should use CSS custom properties:

- `--card-rotate-x`
- `--card-rotate-y`
- `--card-rotate-z`
- `--card-depth`
- `--selected-scale`
- `--hover-lift`

Hover adds small local tilt feedback on top of the base posture. Selection pulls the card forward and makes nearby connection lines brighter.

## Interaction Model

### Single Click

Single-click focuses a card without entering it.

Effects:

- Selected card rotates closer to front-facing.
- Selected card brightness and border increase.
- Non-selected cards remain visible but reduce brightness slightly.
- Connection lines related to the selected card are highlighted.
- The AI avatar updates its context to the selected card.
- A small contextual action group appears near the selected card: `进入`, `问 AI`, `关联`.

### Double Click

Double-click enters the selected planet or content node.

The first click may still focus immediately. The second click triggers entry, so the interface does not need to delay single-click feedback.

Desktop primary entry is double-click. Mobile uses single-click focus followed by a visible `进入` action button because double-tap is less discoverable.

### Return

Planet detail view has a visible `返回宇宙` action. Returning reverses the transition: the detail panel shrinks back toward the original card, hidden nodes reappear, and the camera returns to overview.

## Immersive Planet Entry

The entry transition should feel like moving into the planet.

Animation sequence:

1. Freeze the selected card's hover tilt.
2. Move the canvas camera so the selected card travels toward the center.
3. Increase zoom smoothly.
4. Fade, blur, and scale down unrelated cards.
5. Keep related lines briefly visible, then fade them into the background.
6. Rotate the selected card to front-facing.
7. Expand the selected card into a central glass detail panel.
8. Fade in child nodes and detail sections.

The implementation should use a finite view state:

- `overview`
- `focused`
- `entering`
- `inside`
- `leaving`

## Planet Detail Overlay

The first version is experience-first. It uses real data where available and polished fallback copy where data is missing.

The detail overlay is a large glass panel centered over the star map. It does not navigate away from `/`.

### Header

Show:

- Planet or node title.
- Type label.
- Status.
- Theme color.
- Recent update.
- Counts for memories, notes, essays, projects, or child nodes.

### Main Content

Use a tab-like layout without making the screen feel like an admin UI:

- `概览`: what this planet means.
- `最近变化`: recent activity or fallback narrative.
- `关键记忆`: important memories, values, preferences, or polished fallback cards.
- `关联内容`: connected essays, projects, notes, and nearby planets.

### Actions

Provide:

- `返回宇宙`
- `问 AI`
- `只看关联`
- `打开完整页`

`打开完整页` links to an existing route when a matching essay, project, or note route exists. Otherwise it renders disabled with explanatory helper text.

## Embedded Digital Twin

Remove the fixed right-side `TwinConsole` region from the homepage layout.

Replace it with an in-canvas digital twin component:

- Collapsed state: circular avatar floating over the star map.
- Expanded state: glass chat/search panel floating over the star map.
- Position: default near the right side of the canvas, but it should avoid covering the selected card or detail panel when possible.
- In planet detail mode, the avatar drifts near the detail panel's lower-right edge.

### Collapsed State

The avatar should:

- Have a subtle breathing glow.
- Tilt slightly toward pointer movement.
- Show a small unread/thinking indicator when needed.
- Keep its state independent from the star map layout so chat typing does not re-render all cards.

### Expanded State

The panel should:

- Animate from the avatar using scale, opacity, and border-radius changes.
- Provide chat and search in one input.
- Preserve message history when collapsed.
- Use the current selected or entered planet as context.
- Send messages to `/api/twin/chat` with the same fallback behavior as the current implementation.

The panel remains a floating object in the universe, not a side rail.

## Data Strategy

Use real homepage props where available:

- `planets`
- `memories`
- `essays`
- `notes`
- `projects`
- `profile`
- `twinIdentity`

When data is missing, use designed fallback content. Fallback copy must sound product-ready and specific to the current planet.

Examples:

- "最近还没有公开记忆，但这个行星已经可以承载你的行为记录。"
- "这里会逐步沉淀项目复盘、协作方式和长期判断。"
- "新的日记片段会围绕这个行星形成时间线。"

## Performance Requirements

The interaction should remain smooth on ordinary laptops and mobile devices.

Implementation requirements:

- Layout calculation is a pure helper and runs inside `useMemo`.
- Card components are memoized where practical.
- Chat input state is isolated from the full star map render path.
- Animated properties are limited to `transform`, `opacity`, and short-lived `filter`.
- Wheel and drag updates are throttled with `requestAnimationFrame`.
- Use `will-change` only during active transitions or hover-sensitive elements.
- During planet entry, unrelated cards may be hidden or unmounted after fade-out.
- Respect `prefers-reduced-motion` with simpler opacity transitions.
- Avoid adding Three.js, Framer Motion, D3 force, or gesture libraries in this phase unless CSS/React proves insufficient.

## Accessibility

The star map remains keyboard usable:

- Cards are buttons with accessible labels.
- Double-click entry also has a keyboard and visible button path.
- `Enter` or `Space` focuses a card.
- A visible `进入` action can enter the focused card.
- `Escape` closes the AI panel or returns from planet detail when inside.
- Focus remains visible in both dark and light themes.
- The floating AI panel uses proper form controls and submit behavior.

Reduced motion mode should keep all features accessible without relying on spatial animation.

## Component Changes

Expected component evolution:

- `LifeUniverseWorkbench`: owns view state, selected card, entered card, camera, and high-level event handlers.
- `UniverseLayout`: pure layout helper for rings and collision resolution.
- `UniverseCanvas`: renders the camera layer, cards, lines, and detail overlay.
- `UniverseCard`: renders 3D posture, focus state, and entry affordance.
- `PlanetDetailOverlay`: new component for the immersive detail panel.
- `TwinOrb`: new embedded AI avatar and expanded floating panel.
- `TwinConsole`: either removed from the homepage path or refactored into reusable message list and input primitives used by `TwinOrb`.

## Testing

Component tests should cover:

- Layout helper returns non-overlapping card rectangles.
- Layout helper is deterministic for the same input.
- Single-click focuses a card and updates AI context.
- Double-click enters planet detail.
- Return exits detail and restores overview.
- Floating AI avatar expands and collapses.
- Chat still posts to `/api/twin/chat`.
- Empty data still renders a usable universe with fallback detail content.
- Reduced motion mode does not remove entry and return controls.

Run full verification before deployment:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `docker compose up -d --build`
- HTTP smoke checks through nginx for `/` and `/api/twin/chat`

## Out Of Scope

These are intentionally deferred:

- Persistent manual card positions.
- True 3D planets rendered with WebGL.
- Shader-based glass refraction.
- Multi-user collaboration.
- Full planet CMS routes.
- Voice input.
- File attachments.
