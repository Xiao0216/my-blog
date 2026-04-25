# AI Inbox Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected AI inbox that accepts plain text, classifies it, saves a unified `records` source row, and immediately projects supported types into the current CMS tables.

**Architecture:** Add a focused AI inbox module for prompt/model/normalization/orchestration, keep durable storage in `lib/cms/db.ts`, and render the workflow through `/admin/inbox`. Records are the source table; `memories`, `notes`, `essays`, and `projects` remain projected display tables. Save operations are transactional and fail without partial writes.

**Tech Stack:** Next.js App Router, React 19 server actions and `useActionState`, TypeScript, SQLite via `node:sqlite`, OpenAI Responses API through `fetch`, Vitest, Testing Library.

---

## Scope Check

The approved spec touches database storage, AI classification, protected admin UI, and one public shortcut. These pieces are coupled because the user-facing slice is not useful unless text can be classified, persisted, projected, and reached from the existing homepage. Keep this as one implementation plan, but execute it in small commits.

## File Structure

- Create `lib/ai-inbox/types.ts`: shared AI inbox target types, raw classifier shape, normalized input, action result types.
- Create `lib/ai-inbox/normalize.ts`: parse and normalize AI output into safe server-owned values.
- Create `lib/ai-inbox/prompt.ts`: build the classifier prompt from source text, planets, and taxonomy.
- Create `lib/ai-inbox/model.ts`: call the OpenAI Responses API and return parsed JSON.
- Create `lib/ai-inbox/capture.ts`: orchestrate validation, AI classification, normalization, and database save.
- Modify `lib/cms/schema.ts`: add stored record and record input types.
- Modify `lib/cms/db.ts`: create `records`, seed the stardust/default planet, expose record read/save helpers, and support transactional projections.
- Modify `lib/admin-auth.ts`: add safe `next` path validation.
- Modify `lib/admin-guard.ts`: support redirecting to `/admin/login?next=<path>`.
- Modify `app/admin/(protected)/layout.tsx`: keep shell rendering but move session checks to protected pages so each page can pass its own `next` value.
- Modify each protected admin page under `app/admin/(protected)/**/page.tsx`: call `await requireAdminSession("/admin/<route>")` at page entry.
- Create `app/admin/(protected)/inbox/actions.ts`: server action for the inbox form.
- Create `app/admin/(protected)/inbox/page.tsx`: protected inbox page and recent records view.
- Create `components/admin/ai-inbox-form.tsx`: client form with loading, success, and error state.
- Modify `components/admin/admin-ui.tsx`: add Inbox to admin navigation.
- Modify `components/site/life-universe/universe-topbar.tsx`: turn `New` into a link to `/admin/inbox`.
- Add tests in `tests/lib/cms-db.test.ts`, `tests/lib/ai-inbox-normalize.test.ts`, `tests/lib/ai-inbox-model.test.ts`, `tests/lib/ai-inbox-capture.test.ts`, `tests/lib/admin-auth.test.ts`, `tests/components/admin-life-universe.test.tsx`, and `tests/components/home-page-view.test.tsx`.

## Task 1: Records Schema And Default Capture Planet

**Files:**
- Modify: `lib/cms/schema.ts`
- Modify: `lib/cms/db.ts`
- Test: `tests/lib/cms-db.test.ts`

- [ ] **Step 1: Write failing database tests**

Append these tests inside the existing `describe("cms database", () => { ... })` block in `tests/lib/cms-db.test.ts`:

```ts
  it("seeds a draft stardust capture planet outside public homepage planets", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    expect(db.getPublicPlanets().map((planet) => planet.slug)).not.toContain(
      "stardust"
    )
    expect(db.getAdminPlanets()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stardust",
          name: "星尘",
          status: "draft",
        }),
      ])
    )
  })

  it("allows assistant retrieval from the stardust capture planet", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const stardust = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "stardust")

    db.saveMemory({
      planetId: stardust?.id ?? 0,
      title: "Unclassified assistant memory",
      content: "A low confidence record can still support the twin.",
      type: "diary",
      occurredAt: "2026-04-25",
      visibility: "assistant",
      importance: 5,
      tags: ["inbox"],
      source: "ai-inbox",
    })

    expect(
      db.getAssistantMemories().map((memory) => memory.title)
    ).toContain("Unclassified assistant memory")
    expect(db.getPublicMemories().map((memory) => memory.title)).not.toContain(
      "Unclassified assistant memory"
    )
  })
```

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: FAIL because `stardust` is not seeded and assistant retrieval still filters out draft planets.

- [ ] **Step 3: Add record types to the CMS schema**

In `lib/cms/schema.ts`, add these types near the stored content types:

```ts
export type RecordTargetType =
  | "memory"
  | "note"
  | "essay"
  | "project"
  | "photo"
  | "list"

export type RecordProjectionStatus =
  | "projected"
  | "pending_projection"
  | "failed"

export type StoredRecord = {
  readonly id: number
  readonly sourceText: string
  readonly targetType: RecordTargetType
  readonly title: string
  readonly body: string
  readonly summary: string
  readonly tags: ReadonlyArray<string>
  readonly galaxySlug: string
  readonly planetId: number | null
  readonly planetName: string | null
  readonly occurredAt: string
  readonly visibility: MemoryVisibility | null
  readonly status: ContentStatus | null
  readonly confidence: number
  readonly aiReasoning: string
  readonly projectionStatus: RecordProjectionStatus
  readonly projectionTable: string | null
  readonly projectionId: number | null
  readonly createdAt: string
  readonly updatedAt: string
}
```

- [ ] **Step 4: Add the records table and stardust seed**

In `lib/cms/db.ts`, extend the imports from `@/lib/cms/schema`:

```ts
  type RecordProjectionStatus,
  type RecordTargetType,
  type StoredRecord,
```

Add a row type after `MemoryRow`:

```ts
type RecordRow = {
  id: number
  source_text: string
  target_type: string
  title: string
  body: string
  summary: string
  tags_json: string
  galaxy_slug: string
  planet_id: number | null
  planet_name: string | null
  occurred_at: string
  visibility: string | null
  status: string | null
  confidence: number
  ai_reasoning: string
  projection_status: string
  projection_table: string | null
  projection_id: number | null
  created_at: string
  updated_at: string
}
```

Add this SQL block inside `createTables(database)` after the `memories` table:

```sql
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_text TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK (
        target_type IN ('memory', 'note', 'essay', 'project', 'photo', 'list')
      ),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      summary TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      galaxy_slug TEXT NOT NULL,
      planet_id INTEGER REFERENCES planets(id) ON DELETE SET NULL,
      occurred_at TEXT NOT NULL,
      visibility TEXT CHECK (visibility IN ('public', 'assistant', 'private')),
      status TEXT CHECK (status IN ('published', 'draft')),
      confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
      ai_reasoning TEXT NOT NULL,
      projection_status TEXT NOT NULL CHECK (
        projection_status IN ('projected', 'pending_projection', 'failed')
      ),
      projection_table TEXT,
      projection_id INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
```

Add a seed helper before `seedLifeUniverse(database)`:

```ts
function seedDefaultCapturePlanet(database: DatabaseSync, timestamp: string) {
  run(
    database,
    `INSERT OR IGNORE INTO planets (
      slug, name, summary, description, x, y, size, theme, status,
      sort_order, weight, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "stardust",
      "星尘",
      "AI 收件箱中还没有明确归属的临时碎片。",
      "星尘用于承接低置信度或暂时未分类的 AI 辅助录入内容。",
      0,
      0,
      "small",
      "teal",
      "draft",
      99,
      1,
      timestamp,
      timestamp,
    ]
  )
}
```

Call it inside `seedLifeUniverse(database)` immediately after `const timestamp = nowText()`:

```ts
  seedDefaultCapturePlanet(database, timestamp)
```

- [ ] **Step 5: Allow assistant retrieval from stardust**

Replace `getMemoriesByVisibility` with:

```ts
function getMemoriesByVisibility({
  includeStardust,
  visibilitySql,
}: {
  readonly includeStardust: boolean
  readonly visibilitySql: string
}): ReadonlyArray<StoredMemory> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const planetVisibilitySql = includeStardust
      ? "(planets.status = 'published' OR planets.slug = 'stardust')"
      : "planets.status = 'published'"
    const rows = database
      .prepare(
        `SELECT
           memories.*,
           planets.slug AS planet_slug,
           planets.name AS planet_name
         FROM memories
         INNER JOIN planets ON planets.id = memories.planet_id
         WHERE ${planetVisibilitySql} AND ${visibilitySql}
         ORDER BY memories.importance DESC, memories.occurred_at DESC, memories.id DESC`
      )
      .all() as MemoryRow[]

    return rows.map(mapMemoryRow)
  })
}

export function getPublicMemories(): ReadonlyArray<StoredMemory> {
  return getMemoriesByVisibility({
    includeStardust: false,
    visibilitySql: "memories.visibility = 'public'",
  })
}

export function getAssistantMemories(): ReadonlyArray<StoredMemory> {
  return getMemoriesByVisibility({
    includeStardust: true,
    visibilitySql: "memories.visibility IN ('public', 'assistant')",
  })
}
```

- [ ] **Step 6: Run the database tests**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/cms/schema.ts lib/cms/db.ts tests/lib/cms-db.test.ts
git commit -m "feat: add AI inbox record storage foundation"
```

## Task 2: Transactional Record Projection

**Files:**
- Modify: `lib/cms/schema.ts`
- Modify: `lib/cms/db.ts`
- Test: `tests/lib/cms-db.test.ts`

- [ ] **Step 1: Write failing projection tests**

Append these tests inside the existing CMS database `describe` block:

```ts
  it("saves memory records and projects them atomically", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const stardust = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "stardust")

    const record = db.saveAiInboxRecord({
      sourceText: "今天记录一个想法。",
      targetType: "memory",
      title: "Inbox memory",
      body: "A projected memory body.",
      summary: "Memory summary",
      tags: ["inbox", "memory"],
      galaxySlug: "diary",
      planetId: stardust?.id ?? 0,
      occurredAt: "2026-04-25",
      visibility: "assistant",
      status: null,
      confidence: 82,
      aiReasoning: "Looks like a personal memory.",
      memoryType: "diary",
      importance: 5,
    })

    expect(record).toMatchObject({
      targetType: "memory",
      projectionStatus: "projected",
      projectionTable: "memories",
    })
    expect(db.getAdminMemories()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Inbox memory",
          visibility: "assistant",
          source: "ai-inbox",
        }),
      ])
    )
    expect(db.getRecentRecords(5)[0]).toMatchObject({
      title: "Inbox memory",
      projectionTable: "memories",
    })
  })

  it("saves note essay and project records as drafts", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    db.saveAiInboxRecord({
      sourceText: "Short note text",
      targetType: "note",
      title: "Inbox Note",
      body: "Draft note body",
      summary: "Draft note",
      tags: ["note"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "draft",
      confidence: 80,
      aiReasoning: "Short note",
    })
    db.saveAiInboxRecord({
      sourceText: "Long essay text",
      targetType: "essay",
      title: "Inbox Essay",
      body: "# Draft Essay\n\nBody",
      summary: "Essay description",
      tags: ["essay"],
      galaxySlug: "writing",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "draft",
      confidence: 88,
      aiReasoning: "Longer structured writing",
      readingTime: "1 min read",
    })
    db.saveAiInboxRecord({
      sourceText: "Project experience",
      targetType: "project",
      title: "Inbox Project",
      body: "Project retrospective",
      summary: "Project summary",
      tags: ["project"],
      galaxySlug: "work",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: "draft",
      confidence: 86,
      aiReasoning: "Project-like content",
      stack: ["Next.js"],
      href: "/projects",
    })

    expect(db.getAdminNotes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Inbox Note", status: "draft" }),
      ])
    )
    expect(db.getAdminEssays()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Inbox Essay", status: "draft" }),
      ])
    )
    expect(db.getAdminProjects()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Inbox Project", status: "draft" }),
      ])
    )
  })

  it("keeps photo and list records pending without projection", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    const photo = db.saveAiInboxRecord({
      sourceText: "A note about a photo I will upload later.",
      targetType: "photo",
      title: "Future photo",
      body: "Photo placeholder",
      summary: "Photo summary",
      tags: ["photo"],
      galaxySlug: "life",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 77,
      aiReasoning: "Mentions a photo.",
    })
    const list = db.saveAiInboxRecord({
      sourceText: "Books to read: A, B",
      targetType: "list",
      title: "Reading list",
      body: "- A\n- B",
      summary: "List summary",
      tags: ["books"],
      galaxySlug: "interests",
      planetId: null,
      occurredAt: "2026-04-25",
      visibility: null,
      status: null,
      confidence: 77,
      aiReasoning: "Looks like a list.",
    })

    expect(photo).toMatchObject({
      projectionStatus: "pending_projection",
      projectionTable: null,
      projectionId: null,
    })
    expect(list).toMatchObject({
      projectionStatus: "pending_projection",
      projectionTable: null,
      projectionId: null,
    })
  })

  it("rolls back records when projection fails", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    const before = db.getRecentRecords(20)

    expect(() =>
      db.saveAiInboxRecord({
        sourceText: "Broken memory",
        targetType: "memory",
        title: "Broken memory",
        body: "This cannot project.",
        summary: "Broken",
        tags: ["broken"],
        galaxySlug: "diary",
        planetId: 999_999,
        occurredAt: "2026-04-25",
        visibility: "assistant",
        status: null,
        confidence: 90,
        aiReasoning: "Forced invalid planet.",
        memoryType: "diary",
        importance: 5,
      })
    ).toThrow()

    expect(db.getRecentRecords(20)).toHaveLength(before.length)
    expect(db.getAdminMemories().map((memory) => memory.title)).not.toContain(
      "Broken memory"
    )
  })
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: FAIL because `saveAiInboxRecord` and `getRecentRecords` do not exist.

- [ ] **Step 3: Add record input types**

In `lib/cms/schema.ts`, add:

```ts
export type AiInboxRecordInput = {
  readonly sourceText: string
  readonly targetType: RecordTargetType
  readonly title: string
  readonly body: string
  readonly summary: string
  readonly tags: ReadonlyArray<string>
  readonly galaxySlug: string
  readonly planetId: number | null
  readonly occurredAt: string
  readonly visibility: MemoryVisibility | null
  readonly status: ContentStatus | null
  readonly confidence: number
  readonly aiReasoning: string
  readonly memoryType?: MemoryType
  readonly importance?: number
  readonly readingTime?: string
  readonly stack?: ReadonlyArray<string>
  readonly href?: string
}
```

Export it from the import list in `lib/cms/db.ts`:

```ts
  type AiInboxRecordInput,
```

- [ ] **Step 4: Add row mappers and slug helpers**

In `lib/cms/db.ts`, add:

```ts
function mapRecordRow(row: RecordRow): StoredRecord {
  const projectionStatus: RecordProjectionStatus =
    row.projection_status === "pending_projection" ||
    row.projection_status === "failed"
      ? row.projection_status
      : "projected"

  return {
    id: row.id,
    sourceText: row.source_text,
    targetType: row.target_type as RecordTargetType,
    title: row.title,
    body: row.body,
    summary: row.summary,
    tags: parseStringArray(row.tags_json),
    galaxySlug: row.galaxy_slug,
    planetId: row.planet_id,
    planetName: row.planet_name,
    occurredAt: row.occurred_at,
    visibility:
      row.visibility === "public" ||
      row.visibility === "assistant" ||
      row.visibility === "private"
        ? row.visibility
        : null,
    status: row.status === "published" || row.status === "draft" ? row.status : null,
    confidence: row.confidence,
    aiReasoning: row.ai_reasoning,
    projectionStatus,
    projectionTable: row.projection_table,
    projectionId: row.projection_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function slugBaseFromTitle(title: string, fallback: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || fallback
}

function uniqueSlug(database: DatabaseSync, table: string, base: string): string {
  let candidate = base
  let suffix = 2

  while (
    database.prepare(`SELECT 1 FROM ${table} WHERE slug = ?`).get(candidate)
  ) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}
```

- [ ] **Step 5: Add transactional save helpers**

In `lib/cms/db.ts`, add these helpers before the public save functions:

```ts
function insertRecord(
  database: DatabaseSync,
  input: AiInboxRecordInput,
  timestamp: string,
  projectionStatus: RecordProjectionStatus
): number {
  const result = database
    .prepare(
      `INSERT INTO records (
        source_text, target_type, title, body, summary, tags_json, galaxy_slug,
        planet_id, occurred_at, visibility, status, confidence, ai_reasoning,
        projection_status, projection_table, projection_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`
    )
    .run(
      input.sourceText,
      input.targetType,
      input.title,
      input.body,
      input.summary,
      stringifyArray(input.tags),
      input.galaxySlug,
      input.planetId,
      input.occurredAt,
      input.visibility,
      input.status,
      input.confidence,
      input.aiReasoning,
      projectionStatus,
      timestamp,
      timestamp
    )

  return Number(result.lastInsertRowid)
}

function updateRecordProjection(
  database: DatabaseSync,
  recordId: number,
  table: string | null,
  projectionId: number | null,
  timestamp: string
) {
  run(
    database,
    `UPDATE records
     SET projection_table = ?, projection_id = ?, updated_at = ?
     WHERE id = ?`,
    [table, projectionId, timestamp, recordId]
  )
}
```

Add the exported read/save functions:

```ts
export function getRecentRecords(limit = 10): ReadonlyArray<StoredRecord> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT
           records.*,
           planets.name AS planet_name
         FROM records
         LEFT JOIN planets ON planets.id = records.planet_id
         ORDER BY records.created_at DESC, records.id DESC
         LIMIT ?`
      )
      .all(limit) as RecordRow[]

    return rows.map(mapRecordRow)
  })
}

export function saveAiInboxRecord(input: AiInboxRecordInput): StoredRecord {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const timestamp = nowText()
    const projectionStatus: RecordProjectionStatus =
      input.targetType === "photo" || input.targetType === "list"
        ? "pending_projection"
        : "projected"

    let savedRecordId = 0
    database.exec("BEGIN IMMEDIATE")

    try {
      const recordId = insertRecord(database, input, timestamp, projectionStatus)
      savedRecordId = recordId
      let projectionTable: string | null = null
      let projectionId: number | null = null

      if (input.targetType === "memory") {
        const result = database
          .prepare(
            `INSERT INTO memories (
              planet_id, title, content, type, occurred_at, visibility, importance,
              tags_json, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            input.planetId,
            input.title,
            input.body,
            input.memoryType ?? "diary",
            input.occurredAt,
            input.visibility ?? "assistant",
            input.importance ?? 5,
            stringifyArray(input.tags),
            "ai-inbox",
            timestamp,
            timestamp
          )
        projectionTable = "memories"
        projectionId = Number(result.lastInsertRowid)
      }

      if (input.targetType === "note") {
        const slug = uniqueSlug(database, "notes", slugBaseFromTitle(input.title, "ai-note"))
        const result = database
          .prepare(
            `INSERT INTO notes (
              slug, title, body, published_at, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'draft', ?, ?)`
          )
          .run(slug, input.title, input.body, input.occurredAt, timestamp, timestamp)
        projectionTable = "notes"
        projectionId = Number(result.lastInsertRowid)
      }

      if (input.targetType === "essay") {
        const slug = uniqueSlug(database, "essays", slugBaseFromTitle(input.title, "ai-essay"))
        const result = database
          .prepare(
            `INSERT INTO essays (
              slug, title, description, content, published_at, reading_time,
              tags_json, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
          )
          .run(
            slug,
            input.title,
            input.summary,
            input.body,
            input.occurredAt,
            input.readingTime ?? "1 min read",
            stringifyArray(input.tags),
            timestamp,
            timestamp
          )
        projectionTable = "essays"
        projectionId = Number(result.lastInsertRowid)
      }

      if (input.targetType === "project") {
        const slug = uniqueSlug(database, "projects", slugBaseFromTitle(input.title, "ai-project"))
        const result = database
          .prepare(
            `INSERT INTO projects (
              slug, title, description, note, stack_json, href, sort_order,
              status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 0, 'draft', ?, ?)`
          )
          .run(
            slug,
            input.title,
            input.summary,
            input.body,
            stringifyArray(input.stack ?? []),
            input.href ?? "/projects",
            timestamp,
            timestamp
          )
        projectionTable = "projects"
        projectionId = Number(result.lastInsertRowid)
      }

      updateRecordProjection(database, recordId, projectionTable, projectionId, timestamp)
      database.exec("COMMIT")
    } catch (error) {
      database.exec("ROLLBACK")
      throw error
    }

    const row = database
      .prepare(
        `SELECT
           records.*,
           planets.name AS planet_name
         FROM records
         LEFT JOIN planets ON planets.id = records.planet_id
         WHERE records.id = ?`
      )
      .get(savedRecordId) as RecordRow

    return mapRecordRow(row)
  })
}
```

- [ ] **Step 6: Run projection tests**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/cms/schema.ts lib/cms/db.ts tests/lib/cms-db.test.ts
git commit -m "feat: project AI inbox records transactionally"
```

## Task 3: AI Output Normalization

**Files:**
- Create: `lib/ai-inbox/types.ts`
- Create: `lib/ai-inbox/normalize.ts`
- Test: `tests/lib/ai-inbox-normalize.test.ts`

- [ ] **Step 1: Write failing normalization tests**

Create `tests/lib/ai-inbox-normalize.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { normalizeAiInboxCandidate } from "@/lib/ai-inbox/normalize"
import type { StoredPlanet } from "@/lib/cms/schema"

const planets: StoredPlanet[] = [
  {
    id: 1,
    slug: "stardust",
    name: "星尘",
    summary: "Inbox fragments",
    description: "Inbox fragments",
    x: 0,
    y: 0,
    size: "small",
    theme: "teal",
    status: "draft",
    sortOrder: 99,
    weight: 1,
  },
  {
    id: 2,
    slug: "work",
    name: "工作与职业",
    summary: "Work",
    description: "Work",
    x: 0,
    y: 0,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 1,
    weight: 10,
  },
]

describe("AI inbox normalization", () => {
  it("normalizes a confident project candidate as a draft project", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "project",
        title: "Delivery Platform",
        body: "Built a platform with Next.js.",
        summary: "Platform project",
        tags: ["Next.js", "delivery"],
        galaxySlug: "work",
        planetSlug: "work",
        occurredAt: "2026-04-25",
        confidence: 91,
        reasoning: "This describes a project.",
        stack: ["Next.js"],
      },
      planets,
      sourceText: "source",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "project",
      title: "Delivery Platform",
      status: "draft",
      visibility: null,
      planetId: 2,
      confidence: 91,
      stack: ["Next.js"],
    })
  })

  it("downgrades low confidence output to assistant stardust memory", () => {
    const normalized = normalizeAiInboxCandidate({
      candidate: {
        targetType: "essay",
        title: "",
        body: "",
        summary: "",
        tags: ["unclear"],
        galaxySlug: "writing",
        occurredAt: "not-a-date",
        confidence: 40,
        reasoning: "Unclear.",
      },
      planets,
      sourceText: "今天脑子很乱，先记一下。",
      today: "2026-04-25",
    })

    expect(normalized).toMatchObject({
      targetType: "memory",
      title: "未命名记录",
      body: "今天脑子很乱，先记一下。",
      visibility: "assistant",
      status: null,
      planetId: 1,
      occurredAt: "2026-04-25",
      confidence: 40,
      memoryType: "diary",
    })
    expect(normalized.aiReasoning).toContain("降级为星尘记忆")
  })

  it("keeps photo and list candidates pending without visibility or status", () => {
    const photo = normalizeAiInboxCandidate({
      candidate: {
        targetType: "photo",
        title: "杭州照片",
        body: "之后补图。",
        summary: "照片占位",
        tags: ["杭州"],
        galaxySlug: "life",
        occurredAt: "2026-04-25",
        confidence: 80,
        reasoning: "Mentions a photo.",
      },
      planets,
      sourceText: "杭州照片之后补图",
      today: "2026-04-25",
    })

    expect(photo).toMatchObject({
      targetType: "photo",
      visibility: null,
      status: null,
      planetId: null,
    })
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- tests/lib/ai-inbox-normalize.test.ts
```

Expected: FAIL because `@/lib/ai-inbox/normalize` does not exist.

- [ ] **Step 3: Add AI inbox shared types**

Create `lib/ai-inbox/types.ts`:

```ts
import type { AiInboxRecordInput, RecordTargetType } from "@/lib/cms/schema"

export type AiInboxRawCandidate = {
  readonly targetType?: unknown
  readonly title?: unknown
  readonly body?: unknown
  readonly summary?: unknown
  readonly tags?: unknown
  readonly galaxySlug?: unknown
  readonly planetSlug?: unknown
  readonly planetId?: unknown
  readonly occurredAt?: unknown
  readonly confidence?: unknown
  readonly reasoning?: unknown
  readonly memoryType?: unknown
  readonly importance?: unknown
  readonly readingTime?: unknown
  readonly stack?: unknown
  readonly href?: unknown
}

export type NormalizeAiInboxInput = {
  readonly candidate: AiInboxRawCandidate
  readonly planets: ReadonlyArray<{
    readonly id: number
    readonly slug: string
  }>
  readonly sourceText: string
  readonly today: string
}

export type NormalizedAiInboxRecord = AiInboxRecordInput

export function isRecordTargetType(value: string): value is RecordTargetType {
  return (
    value === "memory" ||
    value === "note" ||
    value === "essay" ||
    value === "project" ||
    value === "photo" ||
    value === "list"
  )
}
```

- [ ] **Step 4: Add the normalizer**

Create `lib/ai-inbox/normalize.ts`:

```ts
import type { MemoryType } from "@/lib/cms/schema"
import {
  isRecordTargetType,
  type AiInboxRawCandidate,
  type NormalizeAiInboxInput,
  type NormalizedAiInboxRecord,
} from "@/lib/ai-inbox/types"

const LOW_CONFIDENCE_THRESHOLD = 70

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function stringArray(value: unknown): ReadonlyArray<string> {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : []
}

function numberValue(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(parsed) ? parsed : fallback
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

function clampConfidence(value: unknown): number {
  return Math.min(100, Math.max(0, numberValue(value, 0)))
}

function isMemoryType(value: string): value is MemoryType {
  return [
    "diary",
    "behavior",
    "opinion",
    "project",
    "habit",
    "preference",
    "milestone",
    "bio",
  ].includes(value)
}

function findPlanetId(
  candidate: AiInboxRawCandidate,
  planets: NormalizeAiInboxInput["planets"]
): number | null {
  const planetId = numberValue(candidate.planetId, Number.NaN)

  if (Number.isFinite(planetId) && planets.some((planet) => planet.id === planetId)) {
    return planetId
  }

  const planetSlug = stringValue(candidate.planetSlug)
  const planet = planets.find((item) => item.slug === planetSlug)

  return planet?.id ?? null
}

function stardustPlanetId(planets: NormalizeAiInboxInput["planets"]): number {
  return planets.find((planet) => planet.slug === "stardust")?.id ?? planets[0]?.id ?? 0
}

function fallbackMemory(input: NormalizeAiInboxInput, reason: string): NormalizedAiInboxRecord {
  const confidence = clampConfidence(input.candidate.confidence)
  const occurredAt = stringValue(input.candidate.occurredAt)

  return {
    sourceText: input.sourceText,
    targetType: "memory",
    title: stringValue(input.candidate.title) || "未命名记录",
    body: stringValue(input.candidate.body) || input.sourceText,
    summary: stringValue(input.candidate.summary) || input.sourceText.slice(0, 120),
    tags: stringArray(input.candidate.tags),
    galaxySlug: stringValue(input.candidate.galaxySlug) || "diary",
    planetId: stardustPlanetId(input.planets),
    occurredAt: isValidDate(occurredAt) ? occurredAt : input.today,
    visibility: "assistant",
    status: null,
    confidence,
    aiReasoning: `${stringValue(input.candidate.reasoning) || reason}；降级为星尘记忆。`,
    memoryType: "diary",
    importance: 5,
  }
}

export function normalizeAiInboxCandidate(
  input: NormalizeAiInboxInput
): NormalizedAiInboxRecord {
  const targetTypeText = stringValue(input.candidate.targetType)
  const targetType = isRecordTargetType(targetTypeText) ? targetTypeText : "memory"
  const confidence = clampConfidence(input.candidate.confidence)
  const title = stringValue(input.candidate.title)
  const body = stringValue(input.candidate.body)

  if (confidence < LOW_CONFIDENCE_THRESHOLD || !title || !body || !isRecordTargetType(targetTypeText)) {
    return fallbackMemory(input, "AI 分类置信度不足或字段不完整")
  }

  const occurredAt = stringValue(input.candidate.occurredAt)
  const memoryTypeText = stringValue(input.candidate.memoryType)
  const normalized: NormalizedAiInboxRecord = {
    sourceText: input.sourceText,
    targetType,
    title,
    body,
    summary: stringValue(input.candidate.summary) || body.slice(0, 160),
    tags: stringArray(input.candidate.tags),
    galaxySlug: stringValue(input.candidate.galaxySlug) || "diary",
    planetId: findPlanetId(input.candidate, input.planets),
    occurredAt: isValidDate(occurredAt) ? occurredAt : input.today,
    visibility: targetType === "memory" ? "assistant" : null,
    status:
      targetType === "note" || targetType === "essay" || targetType === "project"
        ? "draft"
        : null,
    confidence,
    aiReasoning: stringValue(input.candidate.reasoning) || "AI 自动分类。",
    memoryType: isMemoryType(memoryTypeText) ? memoryTypeText : "diary",
    importance: Math.min(10, Math.max(1, numberValue(input.candidate.importance, 5))),
    readingTime: stringValue(input.candidate.readingTime) || "1 min read",
    stack: stringArray(input.candidate.stack),
    href: stringValue(input.candidate.href) || "/projects",
  }

  if (targetType === "memory" && !normalized.planetId) {
    return fallbackMemory(input, "记忆缺少有效星球")
  }

  return normalized
}
```

- [ ] **Step 5: Run normalization tests**

Run:

```bash
npm test -- tests/lib/ai-inbox-normalize.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ai-inbox/types.ts lib/ai-inbox/normalize.ts tests/lib/ai-inbox-normalize.test.ts
git commit -m "feat: normalize AI inbox classifications"
```

## Task 4: OpenAI Classifier Prompt And Model Call

**Files:**
- Create: `lib/ai-inbox/prompt.ts`
- Create: `lib/ai-inbox/model.ts`
- Test: `tests/lib/ai-inbox-model.test.ts`

- [ ] **Step 1: Write failing model tests**

Create `tests/lib/ai-inbox-model.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest"

import { buildAiInboxPrompt } from "@/lib/ai-inbox/prompt"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe("AI inbox model", () => {
  it("builds a classifier prompt with safety defaults", () => {
    const prompt = buildAiInboxPrompt({
      sourceText: "今天想记录一个项目复盘。",
      planets: [{ id: 1, slug: "work", name: "工作与职业" }],
      taxonomy: {
        galaxies: [],
        contentTypes: [],
        specialAreas: [],
      },
    })

    expect(prompt).toContain("Return JSON only")
    expect(prompt).toContain("memory, note, essay, project, photo, list")
    expect(prompt).toContain("Do not choose public or published")
    expect(prompt).toContain("今天想记录一个项目复盘。")
  })

  it("calls the Responses API and parses output_text JSON", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    vi.stubEnv("OPENAI_MODEL", "gpt-test")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          output_text: JSON.stringify({
            targetType: "note",
            title: "Parsed note",
            body: "Body",
            summary: "Summary",
            tags: ["parsed"],
            confidence: 88,
          }),
        }),
      })) as unknown as typeof fetch
    )
    const { classifyAiInboxText } = await import("@/lib/ai-inbox/model")

    const result = await classifyAiInboxText("prompt")

    expect(result).toMatchObject({
      targetType: "note",
      title: "Parsed note",
      confidence: 88,
    })
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      })
    )
  })

  it("fails when model credentials are missing", async () => {
    const { classifyAiInboxText } = await import("@/lib/ai-inbox/model")

    await expect(classifyAiInboxText("prompt")).rejects.toThrow(
      "AI inbox model is not configured"
    )
  })
})
```

- [ ] **Step 2: Run model tests and verify failure**

Run:

```bash
npm test -- tests/lib/ai-inbox-model.test.ts
```

Expected: FAIL because the prompt and model files do not exist.

- [ ] **Step 3: Add the prompt builder**

Create `lib/ai-inbox/prompt.ts`:

```ts
import type { StoredPlanet } from "@/lib/cms/schema"
import type { LifeUniverseTaxonomy } from "@/lib/content"

export function buildAiInboxPrompt({
  sourceText,
  planets,
  taxonomy,
}: {
  readonly sourceText: string
  readonly planets: ReadonlyArray<Pick<StoredPlanet, "id" | "slug" | "name">>
  readonly taxonomy: LifeUniverseTaxonomy
}): string {
  const planetLines = planets
    .map((planet) => `- ${planet.id}: ${planet.slug} / ${planet.name}`)
    .join("\n")
  const galaxyLines = taxonomy.galaxies
    .map((galaxy) => `- ${galaxy.slug}: ${galaxy.name}`)
    .join("\n")

  return [
    "You classify pasted text for a private personal blog admin inbox.",
    "Return JSON only. Do not wrap the result in Markdown.",
    "Supported targetType values: memory, note, essay, project, photo, list.",
    "Do not choose public or published. The server owns visibility and publish status.",
    "Prefer memory for personal facts, diary fragments, preferences, milestones, and uncertain text.",
    "Prefer note for short standalone writing.",
    "Prefer essay for polished long-form writing drafts.",
    "Prefer project for project experience, build notes, and delivery retrospectives.",
    "Prefer photo only when the text mainly describes a photo placeholder.",
    "Prefer list only when the text is clearly a reusable list.",
    "",
    "Current planets:",
    planetLines || "No planets available.",
    "",
    "Life galaxies:",
    galaxyLines || "No taxonomy available.",
    "",
    "JSON shape:",
    JSON.stringify({
      targetType: "memory",
      title: "short title",
      body: "cleaned body",
      summary: "short summary",
      tags: ["tag"],
      galaxySlug: "diary",
      planetSlug: "stardust",
      occurredAt: "2026-04-25",
      confidence: 80,
      reasoning: "short reason",
      memoryType: "diary",
      importance: 5,
      readingTime: "1 min read",
      stack: ["Next.js"],
      href: "/projects",
    }),
    "",
    "Source text:",
    sourceText,
  ].join("\n")
}
```

- [ ] **Step 4: Add the model call**

Create `lib/ai-inbox/model.ts`:

```ts
import type { AiInboxRawCandidate } from "@/lib/ai-inbox/types"

type OpenAIResponse = {
  readonly output_text?: string
}

export async function classifyAiInboxText(
  prompt: string
): Promise<AiInboxRawCandidate> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL

  if (!apiKey || !model) {
    throw new Error("AI inbox model is not configured")
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    throw new Error("AI inbox model request failed")
  }

  const data = (await response.json()) as OpenAIResponse
  const output = data.output_text?.trim()

  if (!output) {
    throw new Error("AI inbox model returned an empty response")
  }

  try {
    return JSON.parse(output) as AiInboxRawCandidate
  } catch {
    throw new Error("AI inbox model returned invalid JSON")
  }
}
```

- [ ] **Step 5: Run model tests**

Run:

```bash
npm test -- tests/lib/ai-inbox-model.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ai-inbox/prompt.ts lib/ai-inbox/model.ts tests/lib/ai-inbox-model.test.ts
git commit -m "feat: add AI inbox classifier model"
```

## Task 5: Capture Orchestration

**Files:**
- Create: `lib/ai-inbox/capture.ts`
- Test: `tests/lib/ai-inbox-capture.test.ts`

- [ ] **Step 1: Write failing capture tests**

Create `tests/lib/ai-inbox-capture.test.ts`:

```ts
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let tempDir = ""

async function loadCapture() {
  vi.resetModules()
  return import("@/lib/ai-inbox/capture")
}

async function loadDb() {
  return import("@/lib/cms/db")
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-ai-inbox-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  rmSync(tempDir, { recursive: true, force: true })
  vi.resetModules()
  vi.restoreAllMocks()
})

describe("AI inbox capture", () => {
  it("classifies normalizes and saves projected records", async () => {
    vi.doMock("@/lib/ai-inbox/model", () => ({
      classifyAiInboxText: vi.fn(async () => ({
        targetType: "note",
        title: "Captured note",
        body: "Captured body",
        summary: "Captured summary",
        tags: ["capture"],
        galaxySlug: "writing",
        occurredAt: "2026-04-25",
        confidence: 90,
        reasoning: "Short note.",
      })),
    }))
    const { captureAiInboxText } = await loadCapture()
    const db = await loadDb()

    const result = await captureAiInboxText("raw text")

    expect(result).toMatchObject({
      targetType: "note",
      title: "Captured note",
      projectionStatus: "projected",
    })
    expect(db.getAdminNotes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Captured note", status: "draft" }),
      ])
    )
  })

  it("does not write records when classification fails", async () => {
    vi.doMock("@/lib/ai-inbox/model", () => ({
      classifyAiInboxText: vi.fn(async () => {
        throw new Error("model down")
      }),
    }))
    const { captureAiInboxText } = await loadCapture()
    const db = await loadDb()

    await expect(captureAiInboxText("raw text")).rejects.toThrow("model down")
    expect(db.getRecentRecords(10)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run capture tests and verify failure**

Run:

```bash
npm test -- tests/lib/ai-inbox-capture.test.ts
```

Expected: FAIL because `@/lib/ai-inbox/capture` does not exist.

- [ ] **Step 3: Add capture orchestration**

Create `lib/ai-inbox/capture.ts`:

```ts
import { buildAiInboxPrompt } from "@/lib/ai-inbox/prompt"
import { classifyAiInboxText } from "@/lib/ai-inbox/model"
import { normalizeAiInboxCandidate } from "@/lib/ai-inbox/normalize"
import { getAdminPlanets, saveAiInboxRecord } from "@/lib/cms/db"
import { getLifeUniverseTaxonomy } from "@/lib/content"
import type { StoredRecord } from "@/lib/cms/schema"

function todayText(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function captureAiInboxText(sourceText: string): Promise<StoredRecord> {
  const trimmed = sourceText.trim()

  if (!trimmed) {
    throw new Error("请输入要保存的文本")
  }

  const planets = getAdminPlanets()
  const prompt = buildAiInboxPrompt({
    sourceText: trimmed,
    planets,
    taxonomy: getLifeUniverseTaxonomy(),
  })
  const candidate = await classifyAiInboxText(prompt)
  const normalized = normalizeAiInboxCandidate({
    candidate,
    planets,
    sourceText: trimmed,
    today: todayText(),
  })

  return saveAiInboxRecord(normalized)
}
```

- [ ] **Step 4: Run capture tests**

Run:

```bash
npm test -- tests/lib/ai-inbox-capture.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ai-inbox/capture.ts tests/lib/ai-inbox-capture.test.ts
git commit -m "feat: orchestrate AI inbox capture"
```

## Task 6: Login Return Path

**Files:**
- Modify: `lib/admin-auth.ts`
- Modify: `lib/admin-guard.ts`
- Modify: `app/admin/login/page.tsx`
- Modify: `app/admin/(protected)/layout.tsx`
- Modify: `app/admin/(protected)/page.tsx`
- Modify: `app/admin/(protected)/essays/page.tsx`
- Modify: `app/admin/(protected)/memories/page.tsx`
- Modify: `app/admin/(protected)/notes/page.tsx`
- Modify: `app/admin/(protected)/planets/page.tsx`
- Modify: `app/admin/(protected)/profile/page.tsx`
- Modify: `app/admin/(protected)/projects/page.tsx`
- Modify: `app/admin/(protected)/twin/page.tsx`
- Test: `tests/lib/admin-auth.test.ts`
- Test: `tests/components/admin-life-universe.test.tsx`

- [ ] **Step 1: Write failing auth tests**

Append this test to `tests/lib/admin-auth.test.ts`:

```ts
  it("allows only safe internal admin next paths", async () => {
    const auth = await loadAuth()

    expect(auth.getSafeAdminNextPath("/admin/inbox")).toBe("/admin/inbox")
    expect(auth.getSafeAdminNextPath("/admin/inbox?error=1")).toBe(
      "/admin/inbox"
    )
    expect(auth.getSafeAdminNextPath("/admin/login")).toBe("/admin")
    expect(auth.getSafeAdminNextPath("https://evil.test/admin/inbox")).toBe(
      "/admin"
    )
    expect(auth.getSafeAdminNextPath("/essays")).toBe("/admin")
  })
```

- [ ] **Step 2: Run auth tests and verify failure**

Run:

```bash
npm test -- tests/lib/admin-auth.test.ts
```

Expected: FAIL because `getSafeAdminNextPath` does not exist.

- [ ] **Step 3: Add safe next path validation**

In `lib/admin-auth.ts`, add:

```ts
export function getSafeAdminNextPath(value: string | undefined | null): string {
  if (!value) {
    return "/admin"
  }

  if (!value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin"
  }

  if (value.includes("://") || value.includes("\\") || value.includes("//")) {
    return "/admin"
  }

  const [path] = value.split("?")
  return path || "/admin"
}
```

- [ ] **Step 4: Mock the admin guard in admin page tests**

In `tests/components/admin-life-universe.test.tsx`, add this mock after the imports:

```ts
vi.mock("@/lib/admin-guard", () => ({
  requireAdminSession: vi.fn(async () => undefined),
}))
```

- [ ] **Step 5: Preserve protected destinations in the guard**

In `lib/admin-guard.ts`, change the function to:

```ts
export async function requireAdminSession(nextPath = "/admin") {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!verifyAdminSessionCookieValue(sessionValue)) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`)
  }
}
```

- [ ] **Step 6: Update login page to use next**

In `app/admin/login/page.tsx`, import `getSafeAdminNextPath`:

```ts
  getSafeAdminNextPath,
```

Update the page prop type:

```ts
  readonly searchParams?: Promise<{ error?: string; next?: string }>
```

Update the `LoginError` prop type to accept the same search params shape:

```tsx
async function LoginError({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams

  if (!params?.error) {
    return null
  }

  return <p className="mt-4 text-sm text-red-600">密码错误或后台未配置密码。</p>
}
```

Inside the form, add `LoginNextInput` after `LoginError`:

```tsx
        <LoginNextInput searchParams={searchParams} />
```

Add this component below `LoginError`:

```tsx
async function LoginNextInput({
  searchParams,
}: {
  readonly searchParams?: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = getSafeAdminNextPath(params?.next)

  return <input type="hidden" name="next" value={nextPath} />
}
```

Update `loginAction`:

```ts
  const nextPath = getSafeAdminNextPath(String(formData.get("next") ?? ""))

  if (!verifyAdminPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    createAdminSessionCookieValue(),
    adminCookieOptions()
  )
  redirect(nextPath)
```

- [ ] **Step 7: Move protected page checks to pages**

In `app/admin/(protected)/layout.tsx`, remove the `requireAdminSession` import and call. The layout should become:

```tsx
import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-ui"

export default function ProtectedAdminLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
```

At the top of every existing protected page file, import:

```ts
import { requireAdminSession } from "@/lib/admin-guard"
```

Then add the matching session call at the start of the page component:

```ts
  await requireAdminSession("/admin")
```

Use the route-specific path in each file:

- `/admin`
- `/admin/profile`
- `/admin/planets`
- `/admin/memories`
- `/admin/twin`
- `/admin/essays`
- `/admin/projects`
- `/admin/notes`

If a page component is currently synchronous, make it `async`. Example for the dashboard:

```ts
export default async function AdminDashboardPage() {
  await requireAdminSession("/admin")

  const summary = getAdminContentSummary()
  const twinIdentity = getTwinIdentity()
  const latest = [
    ...getAdminPlanets().slice(0, 3).map((item) => ({
      type: "Planet",
      title: item.name,
      status: item.status,
    })),
    ...getAdminMemories().slice(0, 3).map((item) => ({
      type: "Memory",
      title: item.title,
      status: item.visibility,
    })),
    ...getAdminEssays().slice(0, 3).map((item) => ({
      type: "Essay",
      title: item.title,
      status: item.status,
    })),
    ...getAdminProjects().slice(0, 3).map((item) => ({
      type: "Project",
      title: item.title,
      status: item.status,
    })),
    ...getAdminNotes().slice(0, 3).map((item) => ({
      type: "Note",
      title: item.title,
      status: item.status,
    })),
  ].slice(0, 6)
}
```

- [ ] **Step 8: Run auth and admin UI tests**

Run:

```bash
npm test -- tests/lib/admin-auth.test.ts tests/components/admin-life-universe.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/admin-auth.ts lib/admin-guard.ts app/admin/login/page.tsx app/admin/'(protected)' tests/lib/admin-auth.test.ts tests/components/admin-life-universe.test.tsx
git commit -m "feat: return to protected admin destinations after login"
```

## Task 7: Admin Inbox Page And Form

**Files:**
- Create: `app/admin/(protected)/inbox/actions.ts`
- Create: `app/admin/(protected)/inbox/page.tsx`
- Create: `components/admin/ai-inbox-form.tsx`
- Modify: `components/admin/admin-ui.tsx`
- Test: `tests/components/admin-life-universe.test.tsx`

- [ ] **Step 1: Write failing admin inbox UI tests**

Update the navigation test in `tests/components/admin-life-universe.test.tsx`:

```ts
    expect(within(navigation).getByRole("link", { name: "Inbox" })).toHaveAttribute(
      "href",
      "/admin/inbox"
    )
```

Update the dynamic page import test to include the inbox page:

```ts
    const [
      { default: AdminPlanetsPage },
      { default: AdminMemoriesPage },
      { default: AdminTwinPage },
      { default: AdminInboxPage },
    ] = await Promise.all([
      import("@/app/admin/(protected)/planets/page"),
      import("@/app/admin/(protected)/memories/page"),
      import("@/app/admin/(protected)/twin/page"),
      import("@/app/admin/(protected)/inbox/page"),
    ])
```

After the Twin assertion, add:

```ts
    rerender(await AdminInboxPage())
    expect(screen.getByRole("heading", { name: "AI Inbox" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "AI 保存" })
    ).toBeInTheDocument()
```

- [ ] **Step 2: Run admin UI tests and verify failure**

Run:

```bash
npm test -- tests/components/admin-life-universe.test.tsx
```

Expected: FAIL because the inbox page and nav link do not exist.

- [ ] **Step 3: Add the server action**

Create `app/admin/(protected)/inbox/actions.ts`:

```ts
"use server"

import { revalidatePath } from "next/cache"

import { captureAiInboxText } from "@/lib/ai-inbox/capture"
import { requireAdminSession } from "@/lib/admin-guard"
import type { StoredRecord } from "@/lib/cms/schema"

export type InboxActionState = {
  readonly error?: string
  readonly sourceText: string
  readonly record?: StoredRecord
}

export async function submitAiInboxAction(
  _state: InboxActionState,
  formData: FormData
): Promise<InboxActionState> {
  await requireAdminSession("/admin/inbox")
  const sourceText = String(formData.get("sourceText") ?? "")

  try {
    const record = await captureAiInboxText(sourceText)
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/inbox")

    return {
      sourceText: "",
      record,
    }
  } catch (error) {
    return {
      sourceText,
      error: error instanceof Error ? error.message : "AI 保存失败",
    }
  }
}
```

- [ ] **Step 4: Add the client form**

Create `components/admin/ai-inbox-form.tsx`:

```tsx
"use client"

import { useActionState } from "react"

import type { InboxActionState } from "@/app/admin/(protected)/inbox/actions"
import { submitAiInboxAction } from "@/app/admin/(protected)/inbox/actions"
import { SubmitButton } from "@/components/admin/admin-ui"

const initialState: InboxActionState = {
  sourceText: "",
}

export function AiInboxForm() {
  const [state, formAction, isPending] = useActionState(
    submitAiInboxAction,
    initialState
  )

  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4">
        {state.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">粘贴内容</span>
          <textarea
            name="sourceText"
            defaultValue={state.sourceText}
            required
            rows={12}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
            placeholder="粘贴一段日记、项目经历、文章草稿、清单或照片说明..."
          />
        </label>
        <div>
          <SubmitButton>{isPending ? "分析保存中..." : "AI 保存"}</SubmitButton>
        </div>
      </form>
      {state.record ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
          <p className="font-medium">已保存：{state.record.title}</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-emerald-700 dark:text-emerald-300">类型</dt>
              <dd>{state.record.targetType}</dd>
            </div>
            <div>
              <dt className="text-emerald-700 dark:text-emerald-300">投影</dt>
              <dd>{state.record.projectionStatus}</dd>
            </div>
            <div>
              <dt className="text-emerald-700 dark:text-emerald-300">置信度</dt>
              <dd>{state.record.confidence}</dd>
            </div>
            <div>
              <dt className="text-emerald-700 dark:text-emerald-300">星球</dt>
              <dd>{state.record.planetName ?? "未投影到星球"}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: Add the inbox page**

Create `app/admin/(protected)/inbox/page.tsx`:

```tsx
import Link from "next/link"

import { AiInboxForm } from "@/components/admin/ai-inbox-form"
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import { getRecentRecords } from "@/lib/cms/db"

export const metadata = {
  title: "Admin AI Inbox",
}

const editHrefByTable: Record<string, string> = {
  essays: "/admin/essays",
  memories: "/admin/memories",
  notes: "/admin/notes",
  projects: "/admin/projects",
}

export default async function AdminInboxPage() {
  await requireAdminSession("/admin/inbox")
  const records = getRecentRecords(10)

  return (
    <>
      <AdminPageHeader
        title="AI Inbox"
        description="粘贴纯文本，AI 会自动分类并保存为后台内容。"
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <AdminPanel>
          <div className="p-4">
            <AiInboxForm />
          </div>
        </AdminPanel>
        <AdminPanel>
          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
            <div className="p-4">
              <h2 className="text-sm font-semibold">最近 Records</h2>
              <p className="mt-1 text-xs text-zinc-500">
                AI 录入结果和投影状态。
              </p>
            </div>
            {records.length > 0 ? (
              records.map((record) => (
                <div key={record.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{record.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {record.targetType} · {record.projectionStatus}
                      </p>
                    </div>
                    {record.projectionTable ? (
                      <Link
                        href={editHrefByTable[record.projectionTable] ?? "/admin/inbox"}
                        className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline dark:hover:text-zinc-50"
                      >
                        编辑
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-zinc-500">还没有 AI 录入记录。</p>
            )}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
```

- [ ] **Step 6: Add Inbox navigation**

In `components/admin/admin-ui.tsx`, add the nav item after Dashboard:

```ts
  { href: "/admin/inbox", label: "Inbox" },
```

- [ ] **Step 7: Run admin UI tests**

Run:

```bash
npm test -- tests/components/admin-life-universe.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/admin/'(protected)'/inbox components/admin/ai-inbox-form.tsx components/admin/admin-ui.tsx tests/components/admin-life-universe.test.tsx
git commit -m "feat: add admin AI inbox page"
```

## Task 8: Public New Link

**Files:**
- Modify: `components/site/life-universe/universe-topbar.tsx`
- Test: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Write failing topbar test**

In the `"renders the seven taxonomy galaxies without changing homepage controls"` test in `tests/components/home-page-view.test.tsx`, add:

```ts
    expect(screen.getByRole("link", { name: "New" })).toHaveAttribute(
      "href",
      "/admin/inbox"
    )
```

- [ ] **Step 2: Run the component test and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: FAIL because New is still a button.

- [ ] **Step 3: Convert New to a link**

In `components/site/life-universe/universe-topbar.tsx`, import `Link`:

```ts
import Link from "next/link"
```

Replace the New button with:

```tsx
        <Link
          href="/admin/inbox"
          className="null-space-control inline-flex h-8 items-center gap-2 px-4 text-xs font-medium outline-none transition hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--ns-accent-primary)]" />
          New
        </Link>
```

- [ ] **Step 4: Run the component test**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/site/life-universe/universe-topbar.tsx tests/components/home-page-view.test.tsx
git commit -m "feat: link universe new action to AI inbox"
```

## Task 9: Final Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts tests/lib/ai-inbox-normalize.test.ts tests/lib/ai-inbox-model.test.ts tests/lib/ai-inbox-capture.test.ts tests/lib/admin-auth.test.ts tests/components/admin-life-universe.test.tsx tests/components/home-page-view.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Inspect git state**

Run:

```bash
git status --short
```

Expected: no uncommitted files.

- [ ] **Step 4: Record implementation notes**

If any verification command fails because of environment variables such as `OPENAI_API_KEY`, record the exact failure in the final handoff. Do not claim production AI capture works without a configured `OPENAI_API_KEY` and `OPENAI_MODEL`.
