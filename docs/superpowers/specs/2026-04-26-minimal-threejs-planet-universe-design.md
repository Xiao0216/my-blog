# Minimal Three.js Planet Universe Design

## Goal

Evolve the current planet-first homepage from CSS/DOM planet bodies into a
minimal, high-end Three.js star map. The homepage should feel quiet, spatial,
and tactile: sparse warm stars, matte low-saturation planets, subtle orbit
lines, and restrained hover feedback.

This design replaces the current DOM-rendered planet bodies, but keeps the
existing life-universe data, hover preview behavior, digital twin, and planet
detail overlay.

## Visual Direction

The desired look is minimal and premium, not dense science fiction.

Principles:

- Show all public planets, but keep the composition sparse.
- Use deep charcoal backgrounds rather than pure black.
- Use warm white stars, not cold white or neon particles.
- Use Morandi-like low-saturation planet colors.
- Make planet surfaces matte, like ceramic or jade.
- Keep orbit lines thin, soft, and low opacity.
- Use very slow motion and subtle hover scale.
- Show information only on hover/focus.
- Keep enough empty space for the scene to breathe.

Non-goals:

- No busy starfield with hundreds of bright particles.
- No high-saturation cyberpunk palette.
- No space station debris, asteroids, or decorative clutter in this phase.
- No article-style data model copied from the reference.
- No Framer Motion dependency for cards.
- No complex bloom, post-processing, texture compression, or shader-heavy
  pipeline in the first implementation.

## Public Planet Policy

All public planets must be represented in the homepage universe.

Density rules:

- `1-8` public planets: render all as primary 3D planets.
- `9-16` public planets: render all, but lower-priority planets become smaller,
  farther, and quieter.
- `17+` public planets: render all public planets logically, but low-priority
  bodies may appear as distant point planets or compact minor bodies.

The homepage must not hard-hide public planets simply to keep the count at five
or six. The visual system should preserve the premium sparse feel through scale,
distance, opacity, and level of detail.

## Layer Structure

The scene has these layers:

1. Background layer: deep charcoal radial background and a small number of warm
   star points.
2. Connection layer: optional, very faint straight lines between nearby or
   related planets.
3. Orbit layer: thin low-opacity orbit paths around the central space.
4. Planet layer: matte 3D planet bodies, optional minimal rings, and subtle
   atmospheric glow.
5. DOM UI layer: hover preview card, existing toolbar, digital twin orb, and
   planet detail overlay.

Only the planet/star/orbit scene moves into WebGL. The surrounding UI stays in
React DOM for accessibility, testing, and layout control.

## Color System

Use restrained colors:

```txt
background.deep   #0a0a0c
background.center #121214
background.edge   #050507

star.bright       #fff8f0
star.dim          rgba(255, 248, 240, 0.6)
star.glow         rgba(255, 248, 240, 0.15)
```

Planet schemes:

```txt
sage  surface #6a8a8a  shadow #4a6a6a  glow #8aaaaa
mist  surface #9a8ab0  shadow #7a6a90  glow #baaacd
warm  surface #b8a090  shadow #988070  glow #d8c8b8
slate surface #7a9ab0  shadow #5a7a90  glow #9abbd0
rose  surface #b09098  shadow #907078  glow #d0b0b8
```

Map existing planet themes into these schemes:

- `cyan`, `teal`, `emerald` -> `sage`
- `violet` -> `mist`
- `blue` -> `slate`
- unknown themes -> `warm`

The palette must not become dominated by one hue. Adjacent planets should cycle
through different schemes when possible.

## Three.js Architecture

Add a WebGL scene using:

- `three`
- `@react-three/fiber`

Avoid `@react-three/drei` in the first pass unless it materially reduces code
for a specific primitive. Built-in Three.js geometries are enough for the first
implementation.

Main components:

- `PlanetUniverseScene`: React client component that owns the Canvas, mouse
  tracking, hovered planet id, paused state, and scene event bridge.
- `MinimalPlanetMesh`: renders one matte planet sphere, optional thin ring,
  subtle atmospheric glow, and invisible hit target.
- `MinimalStarField`: renders a small deterministic warm star field.
- `MinimalOrbitPaths`: renders thin orbit paths for public planets.
- `MinimalConnections`: renders very faint relationship lines when useful.
- `PlanetHoverPreview`: remains DOM-based and is reused or restyled.

The existing `PlanetUniverseBodyModel` can be extended or transformed into a
Three.js-specific view model. Do not replace the CMS data model.

## Planet Scene Model

Derive a stable scene model from public planets:

```txt
MinimalPlanetBody
- id
- planetId
- slug
- name
- summary
- description
- colorScheme
- size
- position
- orbitRadius
- orbitSpeed
- rotationSpeed
- hasRing
- renderLevel
- publicMemoryCount
- assistantMemoryCount
```

Rules:

- Positions must be deterministic from stable planet fields.
- No `Math.random()` in render-time layout.
- Public planets with higher weight are larger and closer.
- Lower-priority planets are smaller, farther, and lower opacity.
- Ring presence is deterministic, for example every third planet or selected
  high-weight planets.
- Star positions are deterministic from a fixed seed.

## Motion

Default motion:

- Each planet self-rotates very slowly.
- Planets drift or orbit slowly around the central scene.
- Orbit motion is subtle enough that the user can read the composition.

Hover/focus motion:

- Hovering or focusing any planet pauses global orbit and rotation.
- The hovered planet scales up gently, around `1.12-1.15`.
- Non-hovered planets become quieter, not hidden.
- The hover preview appears near the pointer.

Reduced motion:

- Respect `prefers-reduced-motion`.
- Disable automatic orbit and rotation.
- Keep hover/focus preview and detail entry usable.

## Interactions

Desktop:

- Pointer hover over a 3D planet pauses the scene and opens the hover card.
- Pointer leave resumes motion and hides the card.
- Double click enters the existing planet detail overlay.
- Wheel/zoom behavior should stay controlled and should not zoom the whole page.

Mobile:

- Single tap selects a planet and opens the preview card.
- Preview includes an `进入` action.
- Double tap may enter, but must not be the only mobile entry path.

Keyboard and accessibility:

- Canvas alone is not enough. Keep a DOM-accessible fallback list or invisible
  focusable controls for all public planets.
- Focusing a planet control pauses the scene and opens the same preview.
- Enter opens detail.
- Escape closes preview or detail.

## Hover Preview Card

The card should stay minimal:

- Width around `240-280px`.
- Transparent dark glass background.
- Thin low-contrast border.
- Small title, short summary, meta line, and entry hint.
- No emoji status badges.
- No dense tags by default.
- Pointer-following position should be bounded to the viewport.

The card remains DOM-based because it must be readable, accessible, and easy to
test.

## Performance

First implementation constraints:

- Keep star count low, around `25-60`.
- Planet geometry should use reasonable segments, for example `48x48` or lower
  for quiet planets.
- Use memoized deterministic canvas textures only if needed for matte surface
  texture.
- Avoid post-processing in the first pass.
- Avoid large external image textures.
- Avoid rendering more detailed geometry for distant point planets.

Fallback:

- If WebGL is unavailable, render the current DOM planet fallback or a static
  accessible planet list.

## Testing

Add or update tests for:

- Three.js dependencies are present.
- The homepage renders a WebGL planet scene container.
- All public planets have corresponding scene bodies or accessible controls.
- Hovering/focusing a planet pauses motion and shows the preview.
- Double-clicking/keyboard entering a planet opens detail.
- Reduced motion disables automatic animation.
- Scene model is deterministic for the same planet input.
- Crowded public planet fixtures produce lower-detail distant bodies.
- Production build succeeds.

Use component tests for state and DOM behavior. Use Playwright or a browser smoke
test for the WebGL canvas path when implementing the scene, because jsdom cannot
prove that WebGL pixels render correctly.

## Migration Plan

Phase 1:

- Add Three.js dependencies.
- Build deterministic minimal scene model.
- Add WebGL scene component behind the existing homepage workbench.
- Keep current DOM planet fallback available.
- Reuse existing hover preview and detail overlay.

Phase 2:

- Replace CSS/DOM planet bodies with the WebGL scene in the default homepage.
- Keep DOM accessibility controls.
- Keep current tests passing or update them to the WebGL scene behavior.

Phase 3:

- Tune visual quality: matte texture, subtle rings, warm star field, and
  restrained connection lines.
- Add browser screenshot/pixel verification for nonblank canvas rendering.

## Open Decisions

- The first implementation should use `@react-three/fiber` directly. `drei`
  remains optional and should only be introduced if a concrete component needs
  it.
- Do not add bloom/post-processing until the basic minimal scene is accepted in
  the browser.
- Continue showing all public planets. Visual hierarchy handles density.
