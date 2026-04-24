# SQLite Admin CMS Design

## Goal

Add a first-phase admin backend so the blog is no longer only edited through static files. The admin should let one trusted administrator manage profile, essays, projects, and notes through protected pages. Content should be stored in SQLite and become visible on the public site immediately after saving, without requiring a rebuild.

## Scope

This phase includes:

- SQLite-backed content storage.
- Database initialization and seed from the current in-repo content.
- Single-admin login with an environment password.
- Admin pages for profile, essays, projects, and notes.
- Server-side CRUD operations for managed content.
- Public pages reading from SQLite.

This phase does not include:

- Public registration.
- Multiple admins or role permissions.
- Comments or guestbook submissions.
- Image upload.
- Rich text editor.
- Markdown live preview.
- Git auto-commit from the admin UI.
- Online style/theme editing.

## Storage

Use SQLite as the source of truth for editable content.

Default database path:

- `data/blog.sqlite`

The path can be overridden with:

- `BLOG_DATABASE_PATH`

The database file must not be committed to git.

## Environment

Required for admin access:

- `ADMIN_PASSWORD`

Optional:

- `BLOG_DATABASE_PATH`

Production behavior:

- If `ADMIN_PASSWORD` is missing, login must fail and admin write access must be unavailable.
- Public pages should still render seeded or existing database content.

## Authentication

Use a single administrator password.

Flow:

- `/admin/login` renders a password form.
- On successful login, the server sets an HttpOnly cookie.
- `/admin/**` pages and all write actions require the cookie.
- Logout clears the cookie.

Cookie requirements:

- HttpOnly.
- SameSite=Lax.
- Secure in production.
- Signed or HMAC-protected using the admin password as part of the secret material.

The admin UI should not expose the password, token, or session value to client JavaScript.

## Data Model

### Profile

Table: `profile`

Fields:

- `id`
- `name`
- `role_line`
- `email`
- `hero_title`
- `hero_intro`
- `about_summary`
- `long_bio_json`
- `skills_json`
- `certifications_json`
- `updated_at`

There should be one active profile row.

### Essays

Table: `essays`

Fields:

- `id`
- `slug`
- `title`
- `description`
- `content`
- `published_at`
- `reading_time`
- `tags_json`
- `status`
- `created_at`
- `updated_at`

Status values:

- `published`
- `draft`

Only `published` essays appear on public pages, RSS, and sitemap.

### Projects

Table: `projects`

Fields:

- `id`
- `slug`
- `title`
- `description`
- `note`
- `stack_json`
- `href`
- `sort_order`
- `status`
- `created_at`
- `updated_at`

Only `published` projects appear on public pages.

### Notes

Table: `notes`

Fields:

- `id`
- `slug`
- `title`
- `body`
- `published_at`
- `status`
- `created_at`
- `updated_at`

Only `published` notes appear on public pages.

## Seeding

On first database initialization:

- Seed profile from `data/site.ts`.
- Seed essays from `data/essays.ts` and the current MDX files.
- Seed projects from `data/projects.ts`.
- Seed notes from `data/notes.ts`.

Seed behavior must be idempotent:

- Do not duplicate rows if initialization runs more than once.
- Existing rows should not be overwritten after the admin has edited them.

The static files remain in the repo as seed fixtures and fallback references, but public reads should use SQLite after initialization.

## Public Site Behavior

Update the content helper layer so existing public components keep their current API shape:

- `getProfile()`
- `getEssaySummaries()`
- `getEssayDocumentBySlug()`
- `getAllEssaySlugs()`
- `getProjects()`
- `getAllNotes()`
- `getFeaturedNotes()`

The public site should not need to know whether content came from static seed files or SQLite.

Article rendering:

- Store essay content as Markdown or MDX-like text in SQLite.
- For this phase, render it as Markdown-compatible prose with headings, paragraphs, and blockquotes.
- Avoid arbitrary executable MDX from the admin UI.

## Admin UI

The admin UI should match the current product-like visual system:

- Compact header.
- Bordered panels.
- Clear form labels.
- Dense but readable tables.
- No marketing hero sections.

Pages:

- `/admin/login`
- `/admin`
- `/admin/profile`
- `/admin/essays`
- `/admin/projects`
- `/admin/notes`

Dashboard:

- Show counts for published essays, projects, and notes.
- Show last updated content rows.
- Link to management pages.

List pages:

- Show title, status, date/order, and actions.
- Actions: edit, delete, publish/draft toggle.

Forms:

- Use normal inputs and textareas.
- Tags and stacks use comma-separated input.
- Long biography, skills, and certifications use newline-separated input.

Deletion:

- Hard delete is acceptable in this phase.
- UI must require a confirmation step before deleting.

## Validation

Server actions or route handlers must validate:

- Required fields are present.
- Slugs are non-empty and URL-safe.
- Dates are valid ISO-like strings where required.
- JSON-backed arrays are parsed from comma/newline input into arrays.
- Status is either `published` or `draft`.

Validation errors should be shown in the admin UI.

## Routing And Rendering

Because content changes at runtime:

- Public content routes that read SQLite should avoid build-time-only assumptions.
- Essay detail pages should support runtime lookup by slug.
- Sitemap and RSS should read published SQLite essays.

If static generation conflicts with runtime content, prefer dynamic rendering for affected routes.

## Testing

Add tests for:

- Database initialization creates required tables.
- Seed runs idempotently.
- Content helpers return seeded data with the existing API shape.
- Draft essays are excluded from public list, RSS, and sitemap.
- Admin auth accepts the correct password and rejects incorrect or missing passwords.
- Admin validation rejects invalid slugs and missing required fields.

Run before completion:

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site npm run build`

## Deployment

Deployment steps:

- Add `ADMIN_PASSWORD` to `/etc/systemd/system/ai-blog.service`.
- Ensure `data/blog.sqlite` is writable by the service user.
- Add `data/*.sqlite` to `.gitignore`.
- Rebuild production with `NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site`.
- Restart `ai-blog`.
- Verify public pages and `/admin/login`.

## Acceptance Criteria

- Admin login works only with `ADMIN_PASSWORD`.
- Logged-out users cannot access `/admin` management pages.
- Admin can create, edit, publish/draft, and delete essays.
- Admin can create, edit, publish/draft, and delete projects.
- Admin can create, edit, publish/draft, and delete notes.
- Admin can edit profile content.
- Public homepage updates after admin content changes without a rebuild.
- RSS and sitemap include only published essays from SQLite.
- Existing professional profile content is seeded into SQLite.
- Full verification commands pass.
