# Spatial Canvas Blog Design

## Goal

Rebuild the public homepage into a dark spatial canvas blog. The site should feel like an explorable knowledge space rather than a productized resume page, while keeping the existing SQLite admin CMS as the content source.

## Experience

Desktop visitors land on a full-viewport canvas. Essays, projects, and notes appear as glass nodes scattered across a coordinate field. Related nodes are connected by thin glowing lines. The user can drag to pan, use the wheel to zoom, hover nodes for physical feedback, and click a node to focus it in a detail panel.

Mobile visitors get a vertical constellation stream instead of forced pan/zoom. Nodes keep the same spatial and glass language, but interaction is tap-to-focus and scroll-first.

## Visual System

- Dark base only for the homepage spatial experience.
- Glass panels with 1px translucent borders, subtle blur, and restrained glow.
- Fine grid, star/noise texture, and graph lines to create depth.
- No ordinary card grid on the homepage.
- No marketing hero layout.
- No decorative blobs or one-note purple/blue gradients.

## Content Mapping

- Essays: larger anchor nodes, link to `/essays/[slug]`.
- Projects: medium system nodes, link to `/projects`.
- Notes: small signal nodes, link to `/notes`.
- Profile: fixed identity console overlay, not a large hero card.
- Focus panel: shows selected node type, title, description/body, date if present, and a clear open link.

## Interaction Rules

- Pan: pointer drag on desktop.
- Zoom: wheel with bounded scale.
- Focus: click/tap a node.
- Reset: small control returns viewport to origin.
- Accessibility: every node remains a real link or button with readable labels; nonessential graphic lines are `aria-hidden`.

## Scope

This phase includes:

- Homepage spatial canvas.
- Mobile constellation stream fallback.
- Dark immersive homepage styling.
- Existing public detail/list pages remain available.
- Existing admin CMS remains unchanged.

This phase does not include:

- WebGL shader implementation.
- AI assistant.
- Edge runtime migration.
- Vector search.
- Changing SQLite admin CRUD.

## Acceptance Criteria

- Homepage no longer presents product dashboard cards.
- Homepage renders a spatial canvas with essay, project, and note nodes.
- Desktop supports pan, zoom, focus, and reset.
- Mobile layout remains usable without precision drag/zoom.
- Admin routes remain visually isolated from the public shell.
- Tests, lint, typecheck, and production build pass.
