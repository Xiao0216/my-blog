# Productized Blog Redesign

## Goal

Refactor the current personal blog frontend from a soft, chapter-like visual style into a cleaner product-oriented personal site. The site should feel mature, structured, and easy to scan while keeping the existing content model: essays, notes, projects, and about.

## Selected Direction

The selected visual direction is **clean product portfolio**:

- Use a zinc or slate neutral system rather than pure black.
- Use a white or zinc-50 canvas with zinc-900 foreground text and zinc-500 secondary text.
- Prefer clear borders, restrained contrast, and ring-like definition instead of visible shadows.
- Reduce oversized decorative elements and abstract illustration.
- Use tighter spacing and stronger information hierarchy.
- Keep the experience content-first, not marketing-heavy.
- Make the site feel closer to a carefully built SaaS tool than a casual personal homepage.

## Scope

This redesign covers the homepage and shared presentation components that shape the rest of the site:

- Global theme tokens and reusable utility classes in `app/globals.css`.
- Site header and shell rhythm.
- Homepage layout in `components/site/home-page-view.tsx`.
- Shared section headings and cards used by essays, projects, and notes.
- Existing routes and content data remain unchanged.

This work does not add CMS features, new content types, authentication, analytics, or animation systems.

## Page Structure

### Header

The header should become compact and utility-like:

- Keep the site name as the main brand mark.
- Present the header more like a product status bar than a personal masthead.
- Use a subtle 1px bottom border and `backdrop-blur-md`.
- Place the mono-like brand mark on the left, navigation in the center or balanced across available space, and a small product-like signal on the right.
- The right-side signal can be an "Open for work" status dot or a compact command-style affordance, but it should not imply working keyboard functionality unless implemented.
- Avoid large stacked brand treatment that consumes vertical space.
- Keep navigation links visible and readable on desktop and mobile.

### Homepage

The first viewport should communicate what the site is and provide useful entry points immediately.

Layout:

- Left side: concise identity statement, intro copy, and a metadata stack.
- Right side: a structured feed panel with recent essay, project, and note entries.
- Below first viewport: three content sections for essays, projects, and notes.

The desktop layout should lean toward a dashboard ratio: about 40% identity and 60% feed. The identity side should avoid oversized hero typography. Use a compact strong intro, then metadata such as role, focus, location, or current status where the existing content supports it. Do not invent unverifiable personal facts.

The feed side should resemble a Linear or GitHub activity list:

- One row per entry.
- A small icon or compact type marker for essay, project, or note.
- Title and short supporting text in the middle.
- Date or metadata aligned to the right where space allows.

The homepage should not rely on the current decorative `HeroIllustration`. If an image is not meaningful, remove the visual block rather than replacing it with another abstract decoration.

### Cards And Lists

Cards should read as structured content panels:

- Border radius no larger than 8px.
- Thin border, minimal or no shadow.
- Transparent or white backgrounds are preferred over tinted card surfaces.
- Compact metadata line.
- Clear title scale that fits card context.
- Tags or stack items should use small neutral chips such as zinc-100 text on zinc-600.
- Hover states should not lift cards. Prefer border darkening, row background change, or title underline.

Homepage content previews can use cards or list rows, but repeated items should stay visually consistent across essays, projects, and notes.

## Visual System

### Color

Use a restrained neutral palette:

- Background: `zinc-50` or equivalent near white.
- Panel background: white or transparent depending on context.
- Foreground: `zinc-900` or equivalent deep neutral gray.
- Muted text: `zinc-500` or equivalent mid gray.
- Border: `zinc-200/60` in light mode and `zinc-800/50` in dark mode.
- Accent: dark neutral or a single restrained color for links and focus states.

Dark mode should remain supported, using `zinc-950` or equivalent rather than pure black. It should mirror the same product-like restraint rather than introducing a separate dramatic theme.

Do not add a Tailwind `boxShadow` preset for this redesign. The implementation should avoid decorative shadows. If a surface needs separation, use a 1px border, subtle ring, or at most Tailwind's existing `shadow-sm` where it is visually necessary and still restrained.

### Typography

Typography should support scanning:

- Reduce hero-scale type outside the homepage hero.
- Use strong but not theatrical headings.
- Prefer Inter, Geist, or the existing configured sans font if it already maps to a similar product-like face.
- Use clear weight contrast: headings around 600, body around 400.
- Keep body text comfortable for reading.
- Avoid negative letter spacing and excessive letter spacing except for small metadata labels.

### Spacing

Spacing should feel deliberate and dense enough for repeated browsing:

- Lower section padding compared with the current `story-section`.
- Keep a consistent max width.
- Use grid layouts for overview sections.
- Avoid decorative whitespace that does not serve comprehension.

## Components

### `HomePageView`

Responsibilities:

- Present the productized hero and latest-content panel.
- Render essays, notes, and projects in consistent preview sections.
- Handle empty states with simple inline panels.
- Avoid fake dashboard data. Metadata must come from existing content or deliberately generic labels.

Dependencies:

- Existing `profile`, `essays`, `notes`, and `projects` props.
- Existing `Reveal` should be removed or reduced. If retained, it must feel fast and unobtrusive, closer to 0.2s than a slow staged reveal.
- `HeroIllustration` should be removed from the homepage.

### `SectionHeading`

Responsibilities:

- Provide compact section labels, headings, and intro text.
- Support homepage and index pages without oversized type.

### `EssayCard`, `ProjectCard`, `NoteTimeline`

Responsibilities:

- Use the updated panel/card treatment.
- Preserve existing links, outbound-link safety behavior, metadata, and tags.
- Use product-like hover states based on border, background, or text treatment rather than lift or heavy shadow.
- Empty states should be explicit and polished: a compact icon or marker plus concise "No entries yet" copy.

### Shared Product Classes

Use shared classes in `app/globals.css` to keep product surfaces consistent and avoid repeated component-level class strings:

- `.product-panel` for bordered panels.
- `.interactive-row` for feed/list rows.
- `.metadata-label` for compact uppercase metadata.
- `.neutral-chip` for tags and stack items.

These should be implemented in Tailwind's CSS-first style inside `@layer components`. They do not require adding Tailwind config presets.

## Testing

The redesign changes presentation rather than data behavior, but existing component tests should still pass.

Verification commands:

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

If tests assert specific class names or DOM structure, update them only where the assertion reflects old presentation details rather than meaningful behavior.

## Acceptance Criteria

- Homepage no longer uses the abstract decorative hero illustration.
- First viewport clearly explains the site and exposes recent content.
- Cards use compact product-style panels with radius at or below 8px.
- Header reads as a compact product status bar, not a large personal masthead.
- Homepage uses a 40/60 identity-and-feed structure on desktop where viewport width allows it.
- Feed rows use a Linear/GitHub-like scan pattern with type marker, title, metadata, and subtle hover state.
- Global palette uses zinc or slate-like neutrals and no longer reads as warm hand-written journal styling.
- The redesign does not introduce decorative box-shadow presets.
- Existing routes, content, RSS, sitemap, and link behavior remain intact.
- Full verification commands pass or any remaining failures are documented with exact output.
