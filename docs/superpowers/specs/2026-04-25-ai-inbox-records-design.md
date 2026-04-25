# AI Inbox Records Design

## Goal

Add an AI-assisted admin inbox for a personal blog. The owner can paste plain text, let AI classify it, and have the system save it directly into the right backend content target.

The design introduces `records` as the unified source table for AI-captured content while keeping the existing `memories`, `notes`, `essays`, and `projects` tables as public/admin display projections. This keeps the current site stable while creating a path for future content types such as photos and lists.

## Scope

This phase includes:

- A new protected `/admin/inbox` page.
- The public universe `New` button linking to `/admin/inbox`.
- Login redirect support so unauthenticated visits to `/admin/inbox` return there after login.
- A new `records` table as the unified source for AI-assisted capture.
- Plain-text-only AI capture.
- Immediate transactional projection to current content tables for supported types.
- Pending projection support for future types.
- Conservative default visibility and publish status.
- Tests for parsing, validation, projection, atomic failure, and login routing.

This phase does not include:

- Image upload.
- URL fetching.
- File import.
- Rich text editing.
- Batch import.
- A manual AI review screen before save.
- Public rendering directly from `records`.
- Reverse synchronization from projected tables back to `records`.

## Product Decisions

The inbox is an owner-only workflow. The blog has a single editor, and every write path remains protected by the existing admin password.

The public universe `New` button should link directly to `/admin/inbox`. If the owner is not logged in, admin protection sends them to `/admin/login?next=/admin/inbox`; after a successful login, the page returns to `/admin/inbox`.

AI saves directly. It does not show an intermediate confirmation screen in this phase. To keep this safe, all AI-created public-facing content defaults to non-public states:

- Memories default to `assistant` visibility.
- Notes, essays, and projects default to `draft`.
- Future types default to `pending_projection`.

AI cannot make pasted content public by returning `public` or `published`. The server overrides AI output with these safe defaults.

## Architecture

`/admin/inbox` is the only AI-assisted capture entry point in this phase. Existing admin pages remain focused on editing specific content types.

The save path is:

1. The owner pastes plain text into `/admin/inbox`.
2. The server validates the admin session.
3. The server sends the source text, current planets, taxonomy types, and default rules to the AI classifier.
4. The AI returns structured JSON.
5. The server validates and normalizes the JSON.
6. The server opens a SQLite transaction.
7. The server writes one row to `records`.
8. For supported types, the server writes the projected row to the matching existing table.
9. The server updates the `records` projection fields.
10. The server commits the transaction.

Any AI failure, invalid JSON, validation failure, or projection failure aborts the full operation. No partial writes are accepted.

## Records Data Model

Add a `records` table with fields:

- `id`
- `source_text`
- `target_type`
- `title`
- `body`
- `summary`
- `tags_json`
- `galaxy_slug`
- `planet_id`
- `occurred_at`
- `visibility`
- `status`
- `confidence`
- `ai_reasoning`
- `projection_status`
- `projection_table`
- `projection_id`
- `created_at`
- `updated_at`

Allowed `target_type` values:

- `memory`
- `note`
- `essay`
- `project`
- `photo`
- `list`

Allowed `projection_status` values:

- `projected`
- `pending_projection`
- `failed`

`failed` is reserved for future explicit failure tracking. In this phase, normal AI capture failures do not write a row.

## Type Rules

### Default Capture Planet

Low-confidence records need a real `planet_id` because the current memory model attaches every memory to a planet.

The implementation should provide a default capture planet with slug `stardust` and name `星尘` if one does not already exist. It represents unclassified fragments, not a normal homepage galaxy.

Rules:

- The default capture planet is available to admin memory forms and AI inbox projection.
- It should not appear as a primary public homepage galaxy in this phase.
- Assistant retrieval must still be able to use assistant-visible memories attached to it.
- If an existing `stardust` planet is present, reuse it instead of creating a duplicate.

This keeps low-confidence captures usable for the AI twin without forcing them into one of the seven stable life galaxies.

### Memory

Memory records project to `memories`.

Defaults:

- `visibility = assistant`
- `source = ai-inbox`
- `importance` comes from AI when valid, otherwise a safe middle value.
- `planet_id` comes from AI when valid, otherwise the stardust/default planet.

Low-confidence, unclear, or incomplete AI output is normalized into a memory record with assistant visibility and the stardust/default planet.

### Note

Note records project to `notes`.

Defaults:

- `status = draft`
- `published_at` uses the inferred date when valid, otherwise the current date.

### Essay

Essay records project to `essays`.

Defaults:

- `status = draft`
- `reading_time` is generated from content length or a conservative fallback.
- `published_at` uses the inferred date when valid, otherwise the current date.

### Project

Project records project to `projects`.

Defaults:

- `status = draft`
- `sort_order` uses a safe default.
- `href` uses the existing project fallback path unless AI returns a valid internal or external link.

### Photo

Photo records do not project in this phase because there is no upload, asset storage, or photo display model yet.

They save only to `records` with:

- `projection_status = pending_projection`
- `projection_table = null`
- `projection_id = null`

### List

List records do not project in this phase because there is no dedicated list display or management model yet.

They save only to `records` with:

- `projection_status = pending_projection`
- `projection_table = null`
- `projection_id = null`

## AI Contract

The AI classifier must return structured JSON only. The server treats the response as untrusted input.

Expected fields:

- `targetType`
- `title`
- `body`
- `summary`
- `tags`
- `galaxySlug`
- `planetSlug` or `planetId`
- `occurredAt`
- `confidence`
- `reasoning`
- Optional type-specific fields such as `readingTime`, `stack`, `href`, or `importance`

The prompt should include:

- The pasted source text.
- Supported target types.
- Current published/admin planets.
- The life-universe taxonomy.
- Default visibility and status rules.
- A requirement to avoid public publishing decisions.
- A requirement to return valid JSON.

## Validation And Normalization

Server validation must ensure:

- `targetType` is one of the supported values.
- `title` and `body` are non-empty for projected types.
- Dates are valid `YYYY-MM-DD` values before use.
- Tags are string arrays after normalization.
- Planet references match an existing planet before use.
- Status and visibility follow server-owned defaults.
- Confidence is a number in the accepted range.

If classification is low-confidence or incomplete, the server normalizes the capture to:

- `target_type = memory`
- `visibility = assistant`
- `planet_id = stardust/default planet`
- `projection_status = projected`

The normalizer should record the reason in `ai_reasoning`.

## Admin Inbox UI

`/admin/inbox` uses the existing admin visual system.

The page includes:

- Page title: `AI Inbox`.
- Short description explaining that pasted text is classified and saved by AI.
- A large textarea for plain-text input.
- A submit button labeled `AI 保存`.
- A loading state while classification and save are running.
- A success result panel showing target type, title, status or visibility, planet, tags, confidence, projection status, and edit destination.
- A recent records list showing the latest captures, target type, title, projection status, and creation time.
- Error feedback that preserves the pasted text for retry.

Projected records link to their existing management areas:

- `memory` -> `/admin/memories`
- `note` -> `/admin/notes`
- `essay` -> `/admin/essays`
- `project` -> `/admin/projects`

Future records without projection stay visible in the recent records list.

## Login Flow

The admin guard should preserve the protected destination:

- Visiting `/admin/inbox` without a valid session redirects to `/admin/login?next=/admin/inbox`.
- Login validates the password.
- If `next` is a safe internal admin path, login redirects there.
- If `next` is missing or unsafe, login redirects to `/admin`.

The admin session cookie remains scoped to `/admin`.

## Error Handling

AI capture fails without database writes when:

- `OPENAI_API_KEY` or the configured model is missing.
- The AI request fails.
- The AI response is not valid JSON.
- Required normalized fields are still invalid.
- The target projection cannot be written.
- The transaction cannot commit.

The page should display a concise error and keep the source text in the textarea.

## Testing Strategy

Add focused coverage for:

- `records` schema creation.
- Saving and listing recent records.
- AI response parsing and normalization.
- Invalid AI output failing without writes.
- Low-confidence output normalizing to assistant memory on the stardust/default planet.
- Memory projection into `memories`.
- Note projection into `notes` with draft status.
- Essay projection into `essays` with draft status.
- Project projection into `projects` with draft status.
- Photo and list records saving as `pending_projection`.
- Transaction rollback when projection fails.
- `/admin/inbox` admin protection.
- `/admin/login?next=/admin/inbox` returning to the inbox after login.
- Public universe `New` linking to `/admin/inbox`.
- Admin inbox rendering success and failure feedback.

## Acceptance Criteria

- The owner can click `New` from the universe and arrive at `/admin/inbox` after password login when needed.
- The owner can paste plain text and submit it for AI-assisted save.
- Supported content types write both `records` and the matching projection table in one transaction.
- Photo and list captures write only `records` with `pending_projection`.
- AI-created memories default to assistant visibility.
- AI-created notes, essays, and projects default to draft status.
- AI cannot make pasted content public through its response.
- Failed captures leave no partial database writes.
- Recent AI captures are visible from `/admin/inbox`.
