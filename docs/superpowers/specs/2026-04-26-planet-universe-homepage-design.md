# Planet Universe Homepage Design

## Goal

Replace the current homepage card-first star map with a planet-first universe.
The default homepage should show orbiting planets, not content cards. Cards are
temporary hover previews only. Double-clicking a planet enters its detail view.

This design keeps the existing life-universe concept, but changes the visual and
interaction model so the homepage feels like a real personal universe rather
than a dashboard of floating cards.

## Current Conflict

The current implementation renders:

- A central digital garden card.
- All published planets.
- One essay card.
- One project card.
- One note card.

That conflicts with the desired behavior. The default view should render planets
as planets. Essays, projects, notes, and memories should appear inside previews,
detail views, search, or filters, not as default homepage bodies.

The current public data contains seven published top-level planets:

- 工作与职业
- 技术与学习
- 写作与表达
- 日记与自我
- 关系与情感
- 生活与体验
- 兴趣与娱乐

Draft planets such as 健康与节奏 and 星尘 are not part of the public default
view unless their visibility policy changes later.

## Design Decision

Use a layered planet universe:

- Top-level planets are always visible as the main orbiting bodies.
- Child planets can orbit their parent top-level planet as the universe grows.
- Temporary or low-confidence areas such as 星尘, 流星, and 未命名星球 appear as
  low-emphasis small bodies or dust belts when they are public.
- Cards are not persistent canvas objects. They appear only as hover previews.

This preserves the requirement that all public planets exist in the universe
while avoiding a crowded flat layout as the planet count grows.

## Visual Model

The default view is a full-screen universe surface:

- A dark star field background.
- Orbit rings or curved paths.
- Spherical planet bodies with distinct visual treatment by theme.
- Slow orbital movement around the universe center or around a parent planet.
- Slow self-rotation on each planet.
- No visible article, project, note, or memory cards by default.

Planet scale communicates hierarchy:

- Top-level planets are the largest and easiest to target.
- Child planets are smaller and orbit their parent.
- Fragmentary planets or special areas are the smallest and visually quieter.

The universe should be inspectable, not decorative. Planets must be recognizable
interactive targets with stable hit areas and readable hover previews.

## Interaction Model

### Default Motion

Planets move continuously:

- Top-level planets orbit the central universe point.
- Child planets orbit their parent planet.
- Each planet has a gentle self-rotation.
- Motion is deterministic, not random on each render.

The layout should derive from stable planet data, including id, slug, parent,
weight, sort order, and theme. A user should build spatial memory over time.

### Hover Preview

When the pointer hovers a planet:

- The whole star map pauses.
- The hovered planet stays highlighted.
- Its orbit or related path is emphasized.
- A preview card appears beside the pointer.
- The preview follows viewport bounds so it never clips off screen.

The preview card shows:

- Planet name.
- Short summary.
- Planet type or hierarchy label.
- Public content counts when available.
- Recent public activity when available.
- A concise double-click entry hint.

When the pointer leaves the planet and preview, motion resumes and the preview
is removed.

### Double Click Entry

Double-clicking a planet enters detail:

- The selected planet becomes the camera target.
- The universe motion pauses during the transition.
- The camera zooms toward the planet.
- Unrelated planets fade or recede.
- A detail overlay opens for that planet.

The first implementation can keep the existing overlay-first detail model. A
future phase can add shareable routes such as `/planets/work`.

### Mobile Interaction

Mobile cannot rely on hover. Use tap behavior:

- Single tap selects a planet and shows the preview card.
- A visible `进入` action in the preview enters detail.
- Tapping outside clears the preview.
- Double tap may also enter, but it should not be the only path.

## Growth Strategy

The homepage must keep working when planet count increases.

### Level Of Detail

Render detail by distance and zoom:

- Far away: small glowing point.
- Medium distance: simple shaded sphere.
- Near, hovered, selected, or focused: full planet treatment.

This means all public planets can be present without all of them paying the same
rendering cost.

### Viewport Culling

Planets outside the visible viewport should not run expensive visual effects.
Their logical positions still update, but their DOM or heavy effects can be
reduced until they return to view.

### Hierarchical Clustering

When many planets belong to one parent:

- Far zoom shows the parent planet and a compact dust belt or cluster count.
- Medium zoom reveals the largest child planets.
- Near zoom reveals all child planets in that local system.

This avoids a flat solar-system view with dozens of same-size bodies.

### Search And Focus

As the universe grows, browsing alone is not enough. Keep or improve search and
filter controls so the user can jump to a planet by name, tag, content type, or
recent activity.

## Data Direction

The current `StoredPlanet` model can support the first phase, but future child
planet support needs hierarchy fields.

Recommended future shape:

```txt
Planet
- id
- slug
- name
- summary
- description
- parentPlanetId
- level
- theme
- size
- status
- visibility
- sortOrder
- weight
- orbitRadius
- orbitSpeed
- rotationSpeed
```

Initial implementation can derive missing orbit values from stable fields:

- `orbitRadius`: based on hierarchy level and weight.
- `orbitSpeed`: based on sort order and id.
- `rotationSpeed`: based on theme or id.
- `level`: top-level until hierarchy is introduced.

## Component Direction

Refactor the homepage life-universe components toward these responsibilities:

- `PlanetUniverseWorkbench`: owns selected planet, hovered planet, entered
  planet, paused state, pan, zoom, and digital twin context.
- `PlanetUniverseCanvas`: renders the moving universe, orbit paths, planets,
  and pointer interactions.
- `PlanetBody`: renders one planet body and its hit target.
- `PlanetHoverPreview`: renders the pointer-adjacent card.
- `PlanetDetailOverlay`: can be reused from the current implementation after it
  receives a planet-based model rather than a card-based model.

The existing card components should not be reused as persistent canvas nodes.
They can inform the hover preview styling, but their current always-visible role
should be removed from the default homepage.

## Accessibility

The planet universe remains keyboard usable:

- Each planet is focusable.
- Focus pauses motion and shows the same preview as hover.
- Enter opens the preview action or enters detail.
- Escape clears preview or exits detail.
- Reduced-motion users get a static universe with manual focus and no continuous
  orbit animation.

The hover preview must not be the only way to read planet information.

## Testing

Add or update tests for:

- Homepage default renders only planet bodies as primary canvas items.
- Essays, projects, notes, and memories do not render as default canvas cards.
- All public planets are represented in the planet universe.
- Hovering or focusing a planet pauses universe motion and shows a preview.
- Leaving a planet resumes motion.
- Double-clicking a planet opens detail.
- Mobile tap shows preview and the preview entry action opens detail.
- Reduced-motion mode disables continuous orbit animation.
- Large planet fixtures use LOD or clustering instead of rendering all planets
  as full-detail bodies.

## Non-Goals

This phase does not require:

- Full WebGL or Three.js rendering.
- Real astronomical simulation.
- Shareable planet routes.
- CMS hierarchy fields for child planets.
- Showing essays, projects, notes, and memories directly on the default canvas.

## Open Implementation Choice

The first implementation can use CSS and React DOM planets instead of WebGL.
This is enough to make the visual language planet-first while keeping testing
and accessibility straightforward. Three.js should be considered only if the
planet bodies need true 3D geometry, lighting, or texture inspection later.
