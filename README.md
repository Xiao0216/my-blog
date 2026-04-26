# AI Blog

Personal blog and life-universe workspace built with Next.js. The app serves a public writing site, an immersive "life universe" homepage, a SQLite-backed admin CMS, a digital twin chat endpoint, and an AI-assisted admin inbox.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- SQLite via Node's built-in `node:sqlite`
- Vitest and Testing Library
- Docker standalone deployment

## Main Routes

- `/` - life universe homepage with public planets, memories, writing, projects, notes, and digital twin chat.
- `/essays`, `/essays/[slug]` - public writing index and article pages.
- `/notes`, `/projects`, `/about` - public content pages.
- `/admin/login` - password-protected admin login.
- `/admin` - admin dashboard.
- `/admin/inbox` - AI-assisted plain-text capture into records and projected content tables.
- `/admin/essays`, `/admin/projects`, `/admin/notes`, `/admin/planets`, `/admin/memories`, `/admin/profile`, `/admin/twin` - admin editing surfaces.
- `/api/twin/chat` - digital twin chat endpoint with model-backed answers when configured and fallback answers when model credentials are missing.

## Local Development

Install dependencies:

```bash
npm ci
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with local values. Do not commit `.env.local`; it is ignored by git.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required Environment

The app can render public pages without model credentials, but admin login and AI capture require explicit configuration.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical public URL for RSS, sitemap, and deployment builds. |
| `BLOG_DATABASE_PATH` | Optional | SQLite file path. Defaults to `data/blog.sqlite`. |
| `ADMIN_PASSWORD` | Admin | Password used to create signed admin sessions. |
| `OPENAI_API_KEY` | AI inbox/model answers | API key for the OpenAI-compatible Responses API. |
| `OPENAI_MODEL` | AI inbox/model answers | Model name sent to the Responses API. |
| `OPENAI_BASE_URL` | Optional | OpenAI-compatible base URL. Defaults to `https://api.openai.com/v1`. |
| `OPENAI_API_BASE_URL` | Optional | Legacy alias used when `OPENAI_BASE_URL` is not set. |

See [docs/operations.md](docs/operations.md) for deployment, backup, migration, and key rotation procedures.

## Quality Gates

Run these before merging or deploying:

```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
NEXT_PUBLIC_SITE_URL=https://blog.wenshuai.site npm run build
```

Install the Playwright browser once on a new machine:

```bash
npx playwright install chromium
```

On a minimal Linux host or CI image, also install Chromium system dependencies:

```bash
npx playwright install-deps chromium
```

## Docker

The production image uses Next.js standalone output and stores SQLite data under `/app/data/blog.sqlite`.

Build and start with Compose:

```bash
docker compose up -d --build
```

The Compose file exposes the app on `127.0.0.1:3001` and expects runtime secrets in `/etc/ai-blog/ai-blog.env`.

## Data Safety

The SQLite database is runtime state. Back it up before deploys, dependency upgrades, manual database edits, or schema changes. The local `data/*.sqlite` files are ignored by git.

Operational details are in [docs/operations.md](docs/operations.md).
