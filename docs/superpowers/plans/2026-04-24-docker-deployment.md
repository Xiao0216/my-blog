# Docker Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the production blog runtime from systemd-managed `next start` to Docker Compose while keeping nginx as the public reverse proxy.

**Architecture:** Build a standalone Next.js container image, mount `./data` as persistent SQLite storage, publish the container only on `127.0.0.1:3001`, and point nginx at that local port. Keep the old systemd service stopped and disabled after the container has been verified.

**Tech Stack:** Next.js 16 standalone output, Node 24 Docker image, Docker Compose v2, nginx reverse proxy, SQLite data volume.

---

### Task 1: Add Container Build Configuration

**Files:**
- Create: `.dockerignore`
- Create: `Dockerfile`
- Modify: `next.config.mjs`

- [ ] **Step 1: Ignore local-only build inputs**

Create `.dockerignore` with dependency, build, git, worktree, local env, and SQLite runtime artifacts excluded while keeping source files and `data/*.ts` available to the build.

- [ ] **Step 2: Enable standalone Next.js output**

Set `output: "standalone"` in `next.config.mjs` so the Docker runner image can copy `.next/standalone`, `.next/static`, and `public` without installing development dependencies.

- [ ] **Step 3: Add multi-stage Dockerfile**

Use `node:24-bookworm-slim`, run `npm ci`, build with `NEXT_PUBLIC_SITE_URL`, create `/app/data`, run as a non-root user, and start `node server.js`.

- [ ] **Step 4: Verify Docker build**

Run:

```bash
docker compose build
```

Expected: image `ai-blog:latest` builds successfully.

### Task 2: Add Compose Runtime

**Files:**
- Create: `docker-compose.yml`
- Create: `/etc/ai-blog/ai-blog.env`

- [ ] **Step 1: Define the app service**

Create a Compose project named `ai-blog` with service `web`, container name `ai-blog`, image `ai-blog:latest`, port mapping `127.0.0.1:3001:3000`, restart policy `unless-stopped`, a healthcheck against `http://127.0.0.1:3000/`, and volume `./data:/app/data`.

- [ ] **Step 2: Store runtime environment outside git**

Create `/etc/ai-blog/ai-blog.env` with `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, and optional OpenAI variables. Keep secrets out of committed repository files.

- [ ] **Step 3: Start the container**

Run:

```bash
docker compose up -d --build
docker compose ps
curl -fsS -H 'Host: blog.wenshuai.site' http://127.0.0.1:3001/
```

Expected: container is running or healthy, and the local HTTP check returns the homepage.

### Task 3: Switch nginx and Retire systemd Runtime

**Files:**
- Modify: `/etc/nginx/sites-available/blog`

- [ ] **Step 1: Change nginx upstream**

Update `proxy_pass` from `http://127.0.0.1:3000` to `http://127.0.0.1:3001`.

- [ ] **Step 2: Reload nginx**

Run:

```bash
nginx -t
systemctl reload nginx
```

Expected: nginx config test succeeds and reload exits successfully.

- [ ] **Step 3: Stop and disable old systemd service**

Run:

```bash
systemctl stop ai-blog
systemctl disable ai-blog
```

Expected: `systemctl is-enabled ai-blog` reports `disabled` and Docker serves production traffic.

- [ ] **Step 4: Smoke test production**

Run:

```bash
curl -fsS -H 'Host: blog.wenshuai.site' http://127.0.0.1/ | grep -E '人生宇宙|Digital Twin'
curl -fsS -H 'Host: blog.wenshuai.site' http://127.0.0.1/api/twin/chat \
  -H 'content-type: application/json' \
  --data '{"message":"你好","history":[]}'
```

Expected: homepage contains the digital-twin UI text and chat API returns JSON.
