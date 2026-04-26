# Operations

This document covers production setup, admin usage, AI configuration, SQLite data safety, and release checks for AI Blog.

## Runtime Environment

Production runtime variables belong outside git. The Docker Compose setup reads `/etc/ai-blog/ai-blog.env`.

Example:

```bash
NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site
ADMIN_PASSWORD=replace-with-a-long-random-password
OPENAI_API_KEY=replace-with-provider-key
OPENAI_MODEL=replace-with-model-name
OPENAI_BASE_URL=https://api.openai.com/v1
```

Optional values:

```bash
BLOG_DATABASE_PATH=/app/data/blog.sqlite
OPENAI_API_BASE_URL=https://api.openai.com/v1
```

Use `OPENAI_BASE_URL` for new deployments. `OPENAI_API_BASE_URL` is kept as a compatibility alias and is only read when `OPENAI_BASE_URL` is empty.

## Docker Deployment

Build and start:

```bash
docker compose up -d --build
```

Check health:

```bash
docker compose ps
curl -fsS http://127.0.0.1:3001/ >/dev/null
```

View logs:

```bash
docker compose logs -f web
```

Restart after environment changes:

```bash
docker compose up -d --force-recreate web
```

The container listens on port `3000`. Compose binds it to `127.0.0.1:3001` on the host. Keep nginx or any public reverse proxy pointed at the host port.

## Admin Usage

Open `/admin/login` and sign in with `ADMIN_PASSWORD`.

Admin sections:

- `/admin` - dashboard metrics and logout.
- `/admin/inbox` - paste plain text and let the model classify it into records and projected content.
- `/admin/essays` - create and edit public or draft essays.
- `/admin/projects` - create and edit public or draft projects.
- `/admin/notes` - create and edit public or draft notes.
- `/admin/planets` - manage public life-universe planets.
- `/admin/memories` - manage public, assistant-only, and private memories.
- `/admin/profile` - edit public profile data.
- `/admin/twin` - edit digital twin identity, tone, privacy, and uncertainty rules.

Admin sessions are signed with `ADMIN_PASSWORD`. Rotating the password invalidates existing admin cookies.

## AI Configuration

The app calls an OpenAI-compatible Responses API endpoint:

```txt
{OPENAI_BASE_URL}/responses
```

When `OPENAI_BASE_URL` is not set, the app uses `OPENAI_API_BASE_URL`. When neither is set, it uses `https://api.openai.com/v1`.

Behavior by feature:

- Digital twin chat: works without model credentials by returning fallback answers based on local context.
- AI inbox: requires `OPENAI_API_KEY` and `OPENAI_MODEL`; missing credentials return a visible admin error.

After changing AI credentials, verify both paths:

```bash
curl -fsS http://127.0.0.1:3001/ >/dev/null
```

Then open `/admin/inbox`, submit a short private test note, and confirm that the record is saved as draft or assistant-visible content.

## SQLite Backup

SQLite data lives at `data/blog.sqlite` in local development and `/app/data/blog.sqlite` in Docker. Compose mounts `./data` to `/app/data`, so host backups can read from `data/blog.sqlite`.

Create a backup directory:

```bash
mkdir -p backups
```

Preferred backup when the `sqlite3` CLI is available:

```bash
sqlite3 data/blog.sqlite ".backup 'backups/blog-$(date -u +%Y%m%dT%H%M%SZ).sqlite'"
```

Fallback backup when the app is stopped:

```bash
docker compose stop web
cp data/blog.sqlite "backups/blog-$(date -u +%Y%m%dT%H%M%SZ).sqlite"
docker compose up -d web
```

Verify a backup file exists and is non-empty:

```bash
ls -lh backups/blog-*.sqlite
```

Keep at least one recent backup before each deploy and before manual database edits.

## Restore Procedure

Stop the app:

```bash
docker compose stop web
```

Move the current database out of the way:

```bash
mv data/blog.sqlite "data/blog.restore-source-$(date -u +%Y%m%dT%H%M%SZ).sqlite"
```

Restore the chosen backup:

```bash
cp backups/blog-YYYYMMDDTHHMMSSZ.sqlite data/blog.sqlite
```

Start the app and smoke test:

```bash
docker compose up -d web
curl -fsS http://127.0.0.1:3001/ >/dev/null
curl -fsS http://127.0.0.1:3001/essays >/dev/null
```

## Schema And Migration Notes

There is no separate migration runner yet. The SQLite schema and idempotent seed/update behavior live in `lib/cms/db.ts`.

Before changing schema code:

1. Back up `data/blog.sqlite`.
2. Add or update focused database tests in `tests/lib/cms-db.test.ts`.
3. Run `npm test tests/lib/cms-db.test.ts`.
4. Run the full verification suite before deployment.

For production schema changes, deploy only after testing against a copy of the production database.

## Secret Rotation Checklist

Rotate secrets when a key is exposed, a teammate leaves, or before a public launch.

### OpenAI Key

1. Create a new provider key.
2. Update `OPENAI_API_KEY` in `/etc/ai-blog/ai-blog.env`.
3. Restart the container:

```bash
docker compose up -d --force-recreate web
```

4. Verify `/admin/inbox` with a short private test note.
5. Revoke the old provider key.

### Admin Password

1. Generate a long replacement password.
2. Update `ADMIN_PASSWORD` in `/etc/ai-blog/ai-blog.env`.
3. Restart the container:

```bash
docker compose up -d --force-recreate web
```

4. Log out or clear the old admin cookie.
5. Log in at `/admin/login` with the new password.

## Release Checklist

Run before deployment:

```bash
npm test
npm run typecheck
npm run lint
NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site npm run build
```

Back up the database:

```bash
mkdir -p backups
sqlite3 data/blog.sqlite ".backup 'backups/blog-$(date -u +%Y%m%dT%H%M%SZ).sqlite'"
```

Deploy:

```bash
docker compose up -d --build
```

Smoke test:

```bash
curl -fsS http://127.0.0.1:3001/ >/dev/null
curl -fsS http://127.0.0.1:3001/essays >/dev/null
curl -fsS http://127.0.0.1:3001/rss.xml >/dev/null
```
