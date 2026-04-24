# Null Space Homepage Redesign

## Goal

Rebuild the public homepage as a near one-to-one implementation of `public/export.jpg`, while preserving the existing life-universe data model and digital-twin chat behavior.

## Reference

- Source image: `public/export.jpg`
- Reference size: `1536x864`
- Primary target viewport: desktop `1536x864`

## Visual Direction

The homepage should read as a dark spatial workbench, not a conventional blog page. The first viewport is a full-screen canvas with a black star-field background, soft vignette, glass cards, thin constellation lines, glowing nodes, and restrained purple/teal/white highlights.

The page should not show the existing sticky site header or footer on the homepage. Other routes keep the existing site shell.

## Layout

The homepage is a fixed-height immersive surface:

- Left rail: narrow vertical toolbar with rounded glass container, icon buttons, and a small orbit decoration near the bottom.
- Top brand row: `Null Space` and subtitle on the left; search/filter/new controls on the right.
- Main canvas: card-based constellation map using life planets and featured content.
- Center feature card: larger glass card for `数字花园 / 构建你的数字花园`.
- Peripheral cards: smaller tilted glass cards mapped from planets, memories, essays, projects, and notes.
- Right twin panel: `Null AI` panel with orb/avatar, capability text, chat transcript, input, and send button.
- Bottom toolbar: floating controls for pan mode, search, zoom level, reset/fullscreen, and graph mode.
- Bottom stats: small text counters for articles, connections, and possibility.

## Data Mapping

The current `HomePageView` props remain the public interface:

- `profile`: used for subtitle and supporting text.
- `planets`: rendered as constellation cards.
- `memories`: used in card excerpts and the twin context.
- `essays`, `projects`, `notes`: rendered as peripheral cards and counts.
- `twinIdentity`: used for the AI panel title and subtitle.

If there are fewer content items than visual slots, the component repeats stable fallback cards derived from profile and planets. Empty data still renders a usable empty-state canvas instead of crashing.

## Reusable Components

Create focused homepage components:

- `LifeUniverseWorkbench`: top-level client component that owns selected card, zoom, and chat state.
- `UniverseSidebar`: left icon rail and orbit decoration.
- `UniverseTopbar`: brand/search/filter/new controls.
- `UniverseCanvas`: background, lines, nodes, cards, and selected-card state.
- `UniverseCard`: reusable glass constellation card.
- `UniverseToolbar`: bottom zoom and graph controls.
- `TwinConsole`: right-side digital-twin panel and chat form.

The existing `HomePageView` becomes a thin wrapper that passes props into `LifeUniverseWorkbench`.

## Interaction Requirements

The visual clone must remain functional:

- Clicking any constellation card focuses it and visually raises its border/glow.
- Bottom zoom controls update zoom percentage and scale the canvas card group.
- Reset returns the canvas to the default zoom and selected center card.
- The twin chat form posts to `/api/twin/chat`, appends user and assistant messages, handles loading state, and shows references when available.
- Empty messages do not submit.
- Keyboard focus states remain visible for buttons and inputs.
- Mobile layout stacks into brand, canvas cards, toolbar, and twin console without text overlap.

## Testing

Use component tests for interaction behavior:

- Homepage renders the Null Space workbench structure.
- Card click changes the focused card.
- Zoom in/out/reset changes the visible zoom value.
- Empty data renders a stable empty state.
- Chat form sends a request, appends messages, and disables while loading.

Run full project verification before deployment:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `docker compose up -d --build`
- HTTP smoke checks through nginx for `/` and `/api/twin/chat`

## Deployment

After implementation, rebuild the Docker image and restart the existing Compose service. nginx should continue to proxy `blog.wenshuai.site` to `127.0.0.1:3001`.
