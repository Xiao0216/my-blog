# Productized Blog Redesign

## Goal

Refactor the current personal blog frontend from a soft, chapter-like visual style into a cleaner product-oriented personal site. The site should feel mature, structured, and easy to scan while keeping the existing content model: essays, notes, projects, and about.

## Selected Direction

The selected visual direction is **clean product portfolio**:

- Use a white or near-white canvas with dark neutral text.
- Prefer clear borders, restrained contrast, and minimal shadows.
- Reduce oversized decorative elements and abstract illustration.
- Use tighter spacing and stronger information hierarchy.
- Keep the experience content-first, not marketing-heavy.

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
- Keep navigation links visible and readable on desktop and mobile.
- Use a subtle bottom border and translucent background only where it improves legibility.
- Avoid large stacked brand treatment that consumes vertical space.

### Homepage

The first viewport should communicate what the site is and provide useful entry points immediately.

Layout:

- Left side: concise identity statement, intro copy, and a few small descriptors.
- Right side: a structured "latest" panel with recent essay, project, and note entries.
- Below first viewport: three content sections for essays, projects, and notes.

The homepage should not rely on the current decorative `HeroIllustration`. If an image is not meaningful, remove the visual block rather than replacing it with another abstract decoration.

### Cards And Lists

Cards should read as structured content panels:

- Border radius no larger than 8px.
- Thin border, minimal or no shadow.
- Compact metadata line.
- Clear title scale that fits card context.
- Tags or stack items should use small neutral chips.

Homepage content previews can use cards or list rows, but repeated items should stay visually consistent across essays, projects, and notes.

## Visual System

### Color

Use a restrained neutral palette:

- Background: near white.
- Foreground: deep neutral gray.
- Muted text: mid gray.
- Border: light neutral gray.
- Accent: dark neutral or a single restrained color for links and focus states.

Dark mode should remain supported, but it should mirror the same product-like restraint rather than introducing a separate dramatic theme.

### Typography

Typography should support scanning:

- Reduce hero-scale type outside the homepage hero.
- Use strong but not theatrical headings.
- Keep body text comfortable for reading.
- Avoid excessive letter spacing except for small metadata labels.

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

Dependencies:

- Existing `profile`, `essays`, `notes`, and `projects` props.
- Existing `Reveal` can stay if it does not create layout complexity.
- `HeroIllustration` should be removed from the homepage.

### `SectionHeading`

Responsibilities:

- Provide compact section labels, headings, and intro text.
- Support homepage and index pages without oversized type.

### `EssayCard`, `ProjectCard`, `NoteTimeline`

Responsibilities:

- Use the updated panel/card treatment.
- Preserve existing links, outbound-link safety behavior, metadata, and tags.

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
- Global palette no longer reads as warm hand-written journal styling.
- Existing routes, content, RSS, sitemap, and link behavior remain intact.
- Full verification commands pass or any remaining failures are documented with exact output.
