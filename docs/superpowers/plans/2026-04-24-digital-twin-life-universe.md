# Digital Twin Life Universe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a database-backed life-universe homepage with custom planets, attached memories, admin editing, and a digital twin chat MVP with real-model and local fallback paths.

**Architecture:** Extend the existing SQLite CMS instead of introducing a new persistence layer. Add focused twin modules for retrieval, prompt construction, model calls, and fallback responses. Replace the current essay/project/note-only spatial homepage with a life-universe canvas fed by public planet and memory queries.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, SQLite via `node:sqlite`, Tailwind CSS 4, Vitest, Testing Library, optional OpenAI-compatible Responses API via `fetch`.

---

## File Structure

- Modify `lib/cms/schema.ts`: add planet, memory, and twin identity types plus form parsers.
- Modify `lib/cms/db.ts`: add SQLite tables, seed data, row mappers, CRUD helpers, public universe readers, and admin summary counts.
- Modify `lib/content.ts`: expose public life-universe readers used by the homepage and twin API.
- Modify `components/admin/admin-ui.tsx`: add admin navigation items for Planets, Memories, and Twin Identity.
- Modify `app/admin/(protected)/page.tsx`: show planet and memory metrics on the dashboard.
- Create `app/admin/(protected)/planets/page.tsx`: admin CRUD for planets.
- Create `app/admin/(protected)/memories/page.tsx`: admin CRUD for memories.
- Create `app/admin/(protected)/twin/page.tsx`: admin form for twin identity settings.
- Create `lib/twin/types.ts`: chat request, response, reference, and retrieved context types.
- Create `lib/twin/retrieval.ts`: keyword retrieval over public/assistant-allowed planets and memories.
- Create `lib/twin/prompt.ts`: prompt assembly and voice-boundary rules.
- Create `lib/twin/fallback.ts`: deterministic offline response builder.
- Create `lib/twin/model.ts`: optional real model call.
- Create `app/api/twin/chat/route.ts`: chat endpoint with validation, retrieval, model call, and fallback.
- Modify `components/site/home-page-view.tsx`: life-universe canvas and twin chat panel.
- Modify `app/(site)/page.tsx`: pass planets, memories, and twin identity to the homepage.
- Modify `app/globals.css`: add restrained cosmic/star/glass utilities needed by the new homepage.
- Modify `tests/lib/admin-validation.test.ts`: parser coverage.
- Modify `tests/lib/cms-db.test.ts`: database and public/private visibility coverage.
- Create `tests/lib/twin-retrieval.test.ts`: retrieval ranking and privacy coverage.
- Create `tests/app/twin-chat-route.test.ts`: API fallback and validation coverage.
- Modify `tests/components/home-page-view.test.tsx`: life-universe and chat-panel rendering coverage.

---

### Task 1: Life Universe Schema And Database

**Files:**
- Modify: `lib/cms/schema.ts`
- Modify: `lib/cms/db.ts`
- Modify: `tests/lib/admin-validation.test.ts`
- Modify: `tests/lib/cms-db.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add these imports to `tests/lib/admin-validation.test.ts`:

```ts
import {
  parseEssayFormData,
  parseMemoryFormData,
  parseNoteFormData,
  parsePlanetFormData,
  parseProjectFormData,
  parseTwinIdentityFormData,
} from "@/lib/cms/schema"
```

Replace the existing import block from `@/lib/cms/schema` with the block above. Then append these tests inside `describe("admin validation", () => { ... })`:

```ts
  it("parses a valid planet form", () => {
    const result = parsePlanetFormData(
      form({
        slug: "work",
        name: "Work",
        summary: "Work and delivery patterns",
        description: "How I work, decide, ship, and reflect.",
        x: "120",
        y: "-80",
        size: "large",
        theme: "cyan",
        status: "published",
        sortOrder: "2",
        weight: "8",
      })
    )

    expect(result).toEqual({
      ok: true,
      value: {
        slug: "work",
        name: "Work",
        summary: "Work and delivery patterns",
        description: "How I work, decide, ship, and reflect.",
        x: 120,
        y: -80,
        size: "large",
        theme: "cyan",
        status: "published",
        sortOrder: 2,
        weight: 8,
      },
    })
  })

  it("parses a valid memory form", () => {
    const result = parseMemoryFormData(
      form({
        planetId: "1",
        title: "Prefers direct engineering notes",
        content: "I value direct, practical engineering communication.",
        type: "preference",
        occurredAt: "2026-04-24",
        visibility: "public",
        importance: "9",
        tags: "communication, engineering",
        source: "manual",
      })
    )

    expect(result).toEqual({
      ok: true,
      value: {
        planetId: 1,
        title: "Prefers direct engineering notes",
        content: "I value direct, practical engineering communication.",
        type: "preference",
        occurredAt: "2026-04-24",
        visibility: "public",
        importance: 9,
        tags: ["communication", "engineering"],
        source: "manual",
      },
    })
  })

  it("parses twin identity form data", () => {
    const result = parseTwinIdentityFormData(
      form({
        displayName: "Jinshen Twin",
        subtitle: "Memory-backed digital twin",
        avatarDescription: "A quiet cosmic assistant",
        firstPersonStyle: "Use direct first-person answers for supported memories.",
        thirdPersonStyle: "Use proxy wording when uncertain.",
        values: "Clarity\nPragmatism",
        communicationRules: "Be direct\nCite memory references",
        privacyRules: "Do not reveal private memories",
        uncertaintyRules: "State uncertainty when memory is insufficient",
      })
    )

    expect(result).toEqual({
      ok: true,
      value: {
        displayName: "Jinshen Twin",
        subtitle: "Memory-backed digital twin",
        avatarDescription: "A quiet cosmic assistant",
        firstPersonStyle: "Use direct first-person answers for supported memories.",
        thirdPersonStyle: "Use proxy wording when uncertain.",
        values: ["Clarity", "Pragmatism"],
        communicationRules: ["Be direct", "Cite memory references"],
        privacyRules: ["Do not reveal private memories"],
        uncertaintyRules: ["State uncertainty when memory is insufficient"],
      },
    })
  })

  it("rejects invalid planet and memory fields", () => {
    const planetResult = parsePlanetFormData(
      form({
        slug: "Bad Slug",
        name: "",
        summary: "",
        description: "Description",
        x: "nope",
        y: "0",
        size: "giant",
        theme: "cyan",
        status: "archived",
        sortOrder: "1",
        weight: "5",
      })
    )
    const memoryResult = parseMemoryFormData(
      form({
        planetId: "0",
        title: "",
        content: "",
        type: "unknown",
        occurredAt: "bad-date",
        visibility: "everyone",
        importance: "high",
        tags: "",
        source: "",
      })
    )

    expect(planetResult).toMatchObject({
      ok: false,
      errors: {
        name: "标题不能为空",
        summary: "标题不能为空",
        slug: "Slug 只能使用小写字母、数字和连字符",
        status: "状态只能是 published 或 draft",
        x: "坐标必须是数字",
        size: "尺寸只能是 small、medium 或 large",
      },
    })
    expect(memoryResult).toMatchObject({
      ok: false,
      errors: {
        planetId: "请选择有效星球",
        title: "标题不能为空",
        content: "内容不能为空",
        type: "记忆类型无效",
        occurredAt: "请输入有效日期",
        visibility: "可见性无效",
        importance: "重要度必须是 1 到 10 的数字",
      },
    })
  })
```

- [ ] **Step 2: Run validation tests and verify failure**

Run:

```bash
npm test -- tests/lib/admin-validation.test.ts
```

Expected: FAIL with missing exports for `parsePlanetFormData`, `parseMemoryFormData`, and `parseTwinIdentityFormData`.

- [ ] **Step 3: Add schema types and parsers**

In `lib/cms/schema.ts`, add these types after `export type ContentStatus = "published" | "draft"`:

```ts
export type PlanetSize = "small" | "medium" | "large"
export type MemoryType =
  | "diary"
  | "behavior"
  | "opinion"
  | "project"
  | "habit"
  | "preference"
  | "milestone"
  | "bio"
export type MemoryVisibility = "public" | "assistant" | "private"

export type StoredPlanet = {
  readonly id: number
  readonly slug: string
  readonly name: string
  readonly summary: string
  readonly description: string
  readonly x: number
  readonly y: number
  readonly size: PlanetSize
  readonly theme: string
  readonly status: ContentStatus
  readonly sortOrder: number
  readonly weight: number
}

export type StoredMemory = {
  readonly id: number
  readonly planetId: number
  readonly planetSlug: string
  readonly planetName: string
  readonly title: string
  readonly content: string
  readonly type: MemoryType
  readonly occurredAt: string
  readonly visibility: MemoryVisibility
  readonly importance: number
  readonly tags: ReadonlyArray<string>
  readonly source: string
}

export type StoredTwinIdentity = {
  readonly displayName: string
  readonly subtitle: string
  readonly avatarDescription: string
  readonly firstPersonStyle: string
  readonly thirdPersonStyle: string
  readonly values: ReadonlyArray<string>
  readonly communicationRules: ReadonlyArray<string>
  readonly privacyRules: ReadonlyArray<string>
  readonly uncertaintyRules: ReadonlyArray<string>
}

export type PlanetInput = Omit<StoredPlanet, "id">
export type MemoryInput = Omit<
  StoredMemory,
  "id" | "planetSlug" | "planetName"
>
export type TwinIdentityInput = StoredTwinIdentity
```

Add these helpers after `parseStatus`:

```ts
function parsePlanetSize(value: unknown): PlanetSize {
  return value === "small" || value === "large" ? value : "medium"
}

function isValidPlanetSize(value: string): value is PlanetSize {
  return value === "small" || value === "medium" || value === "large"
}

function isValidMemoryType(value: string): value is MemoryType {
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

function isValidMemoryVisibility(value: string): value is MemoryVisibility {
  return value === "public" || value === "assistant" || value === "private"
}

function parseNumberField(value: string, fallback: number): number {
  const parsed = Number.parseInt(value || String(fallback), 10)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}
```

Add these parser exports after `parseProfileFormData`:

```ts
export function parsePlanetFormData(
  formData: FormData
): ValidationResult<PlanetInput> {
  const slug = formText(formData, "slug")
  const name = formText(formData, "name")
  const summary = formText(formData, "summary")
  const description = formText(formData, "description")
  const x = parseNumberField(formText(formData, "x"), 0)
  const y = parseNumberField(formText(formData, "y"), 0)
  const size = formText(formData, "size") || "medium"
  const theme = formText(formData, "theme") || "cyan"
  const status = formText(formData, "status")
  const sortOrder = parseNumberField(formText(formData, "sortOrder"), 0)
  const weight = parseNumberField(formText(formData, "weight"), 5)
  const errors: Record<string, string> = {}

  validateRequired(errors, { name, summary })
  validateCommonContentFields(errors, slug, status)

  if (!Number.isFinite(x)) {
    errors.x = "坐标必须是数字"
  }

  if (!Number.isFinite(y)) {
    errors.y = "坐标必须是数字"
  }

  if (!isValidPlanetSize(size)) {
    errors.size = "尺寸只能是 small、medium 或 large"
  }

  if (!Number.isFinite(sortOrder)) {
    errors.sortOrder = "排序必须是数字"
  }

  if (!Number.isFinite(weight) || weight < 1 || weight > 10) {
    errors.weight = "权重必须是 1 到 10 的数字"
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      slug,
      name,
      summary,
      description,
      x,
      y,
      size,
      theme,
      status: status as ContentStatus,
      sortOrder,
      weight,
    },
  }
}

export function parseMemoryFormData(
  formData: FormData
): ValidationResult<MemoryInput> {
  const planetId = parseNumberField(formText(formData, "planetId"), 0)
  const title = formText(formData, "title")
  const content = formText(formData, "content")
  const type = formText(formData, "type")
  const occurredAt = formText(formData, "occurredAt")
  const visibility = formText(formData, "visibility")
  const importance = parseNumberField(formText(formData, "importance"), 5)
  const source = formText(formData, "source") || "manual"
  const errors: Record<string, string> = {}

  validateRequired(errors, { title, content })

  if (!Number.isFinite(planetId) || planetId < 1) {
    errors.planetId = "请选择有效星球"
  }

  if (!isValidMemoryType(type)) {
    errors.type = "记忆类型无效"
  }

  if (!isValidDateText(occurredAt)) {
    errors.occurredAt = "请输入有效日期"
  }

  if (!isValidMemoryVisibility(visibility)) {
    errors.visibility = "可见性无效"
  }

  if (!Number.isFinite(importance) || importance < 1 || importance > 10) {
    errors.importance = "重要度必须是 1 到 10 的数字"
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      planetId,
      title,
      content,
      type,
      occurredAt,
      visibility,
      importance,
      tags: parseCommaList(formText(formData, "tags")),
      source,
    },
  }
}

export function parseTwinIdentityFormData(
  formData: FormData
): ValidationResult<TwinIdentityInput> {
  const displayName = formText(formData, "displayName")
  const subtitle = formText(formData, "subtitle")
  const avatarDescription = formText(formData, "avatarDescription")
  const firstPersonStyle = formText(formData, "firstPersonStyle")
  const thirdPersonStyle = formText(formData, "thirdPersonStyle")
  const errors: Record<string, string> = {}

  validateRequired(errors, {
    displayName,
    subtitle,
    avatarDescription,
    firstPersonStyle,
    thirdPersonStyle,
  })

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      displayName,
      subtitle,
      avatarDescription,
      firstPersonStyle,
      thirdPersonStyle,
      values: parseLineList(formText(formData, "values")),
      communicationRules: parseLineList(formText(formData, "communicationRules")),
      privacyRules: parseLineList(formText(formData, "privacyRules")),
      uncertaintyRules: parseLineList(formText(formData, "uncertaintyRules")),
    },
  }
}
```

- [ ] **Step 4: Run validation tests and verify pass**

Run:

```bash
npm test -- tests/lib/admin-validation.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing database tests**

Append these tests inside `describe("cms database", () => { ... })` in `tests/lib/cms-db.test.ts`:

```ts
  it("seeds public life planets, assistant memories, and twin identity", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()

    expect(db.getPublicPlanets().map((planet) => planet.slug)).toEqual([
      "life",
      "work",
      "diary",
      "technology",
      "health",
    ])
    expect(db.getPublicMemories()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Front-end engineer focused on maintainable delivery",
          visibility: "public",
        }),
      ])
    )
    expect(db.getTwinIdentity()).toMatchObject({
      displayName: "縉紳 AI",
      subtitle: "记忆驱动的数字分身",
    })
  })

  it("persists planets, memories, and hides private memories from public readers", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.savePlanet({
      slug: "reading",
      name: "Reading",
      summary: "Books and notes",
      description: "Reading records and long-term ideas",
      x: 300,
      y: -120,
      size: "small",
      theme: "violet",
      status: "published",
      sortOrder: 20,
      weight: 4,
    })
    const readingPlanet = db
      .getAdminPlanets()
      .find((planet) => planet.slug === "reading")

    expect(readingPlanet).toMatchObject({
      name: "Reading",
      x: 300,
      y: -120,
    })

    db.saveMemory({
      planetId: readingPlanet?.id ?? 0,
      title: "Private reading note",
      content: "This should not be visible publicly.",
      type: "diary",
      occurredAt: "2026-04-24",
      visibility: "private",
      importance: 7,
      tags: ["private"],
      source: "manual",
    })

    expect(db.getPublicMemories().map((memory) => memory.title)).not.toContain(
      "Private reading note"
    )
    expect(db.getAssistantMemories().map((memory) => memory.title)).not.toContain(
      "Private reading note"
    )
    expect(db.getAdminMemories().map((memory) => memory.title)).toContain(
      "Private reading note"
    )
  })

  it("saves twin identity settings", async () => {
    const db = await loadDb()

    db.initializeCmsDatabase()
    db.saveTwinIdentity({
      displayName: "Custom Twin",
      subtitle: "Custom subtitle",
      avatarDescription: "Custom avatar",
      firstPersonStyle: "Use first person when supported.",
      thirdPersonStyle: "Use proxy voice when uncertain.",
      values: ["Clarity"],
      communicationRules: ["Be concise"],
      privacyRules: ["Hide private memories"],
      uncertaintyRules: ["State uncertainty"],
    })

    expect(db.getTwinIdentity()).toEqual({
      displayName: "Custom Twin",
      subtitle: "Custom subtitle",
      avatarDescription: "Custom avatar",
      firstPersonStyle: "Use first person when supported.",
      thirdPersonStyle: "Use proxy voice when uncertain.",
      values: ["Clarity"],
      communicationRules: ["Be concise"],
      privacyRules: ["Hide private memories"],
      uncertaintyRules: ["State uncertainty"],
    })
  })
```

- [ ] **Step 6: Run database tests and verify failure**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: FAIL with missing database exports such as `getPublicPlanets`, `savePlanet`, and `getTwinIdentity`.

- [ ] **Step 7: Add database tables, seeds, mappers, and CRUD helpers**

In `lib/cms/db.ts`, extend the schema import with:

```ts
  type MemoryInput,
  type PlanetInput,
  type StoredMemory,
  type StoredPlanet,
  type StoredTwinIdentity,
  type TwinIdentityInput,
```

Add row types after `type ProfileRow = { ... }`:

```ts
type PlanetRow = {
  id: number
  slug: string
  name: string
  summary: string
  description: string
  x: number
  y: number
  size: string
  theme: string
  status: string
  sort_order: number
  weight: number
}

type MemoryRow = {
  id: number
  planet_id: number
  planet_slug: string
  planet_name: string
  title: string
  content: string
  type: string
  occurred_at: string
  visibility: string
  importance: number
  tags_json: string
  source: string
}

type TwinIdentityRow = {
  display_name: string
  subtitle: string
  avatar_description: string
  first_person_style: string
  third_person_style: string
  values_json: string
  communication_rules_json: string
  privacy_rules_json: string
  uncertainty_rules_json: string
}
```

Add these tables inside `createTables(database)` after the `notes` table:

```sql
    CREATE TABLE IF NOT EXISTS planets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      x INTEGER NOT NULL DEFAULT 0,
      y INTEGER NOT NULL DEFAULT 0,
      size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
      theme TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      sort_order INTEGER NOT NULL DEFAULT 0,
      weight INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planet_id INTEGER NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK (
        type IN ('diary', 'behavior', 'opinion', 'project', 'habit', 'preference', 'milestone', 'bio')
      ),
      occurred_at TEXT NOT NULL,
      visibility TEXT NOT NULL CHECK (visibility IN ('public', 'assistant', 'private')),
      importance INTEGER NOT NULL DEFAULT 5,
      tags_json TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS twin_identity (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      avatar_description TEXT NOT NULL,
      first_person_style TEXT NOT NULL,
      third_person_style TEXT NOT NULL,
      values_json TEXT NOT NULL,
      communication_rules_json TEXT NOT NULL,
      privacy_rules_json TEXT NOT NULL,
      uncertainty_rules_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
```

Add seed helpers after `seedNotes(database)`:

```ts
const seedPlanets: ReadonlyArray<PlanetInput> = [
  {
    slug: "life",
    name: "Life",
    summary: "Daily rhythm, relationships with the world, and lived texture.",
    description: "The life planet records ordinary days, choices, observations, and non-work context.",
    x: -260,
    y: 120,
    size: "large",
    theme: "teal",
    status: "published",
    sortOrder: 1,
    weight: 8,
  },
  {
    slug: "work",
    name: "Work",
    summary: "Delivery habits, collaboration, and engineering judgment.",
    description: "The work planet captures how projects are understood, built, shipped, and maintained.",
    x: 160,
    y: -140,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 2,
    weight: 9,
  },
  {
    slug: "diary",
    name: "Diary",
    summary: "Short reflections and personal state over time.",
    description: "The diary planet keeps small, timestamped fragments that explain mood, context, and change.",
    x: 420,
    y: 170,
    size: "medium",
    theme: "violet",
    status: "published",
    sortOrder: 3,
    weight: 6,
  },
  {
    slug: "technology",
    name: "Technology",
    summary: "Front-end systems, performance, AI, and product engineering.",
    description: "The technology planet connects articles, experiments, and engineering opinions.",
    x: -40,
    y: 320,
    size: "large",
    theme: "blue",
    status: "published",
    sortOrder: 4,
    weight: 8,
  },
  {
    slug: "health",
    name: "Health",
    summary: "Energy, habits, body signals, and sustainable pace.",
    description: "The health planet tracks routines and constraints that affect long-term output.",
    x: -500,
    y: -160,
    size: "medium",
    theme: "emerald",
    status: "published",
    sortOrder: 5,
    weight: 5,
  },
]

function seedLifeUniverse(database: DatabaseSync) {
  const timestamp = nowText()
  const planetStatement = database.prepare(`
    INSERT OR IGNORE INTO planets (
      slug, name, summary, description, x, y, size, theme, status,
      sort_order, weight, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const planet of seedPlanets) {
    planetStatement.run(
      planet.slug,
      planet.name,
      planet.summary,
      planet.description,
      planet.x,
      planet.y,
      planet.size,
      planet.theme,
      planet.status,
      planet.sortOrder,
      planet.weight,
      timestamp,
      timestamp
    )
  }

  const work = database
    .prepare("SELECT id FROM planets WHERE slug = 'work'")
    .get() as { id: number } | undefined
  const technology = database
    .prepare("SELECT id FROM planets WHERE slug = 'technology'")
    .get() as { id: number } | undefined

  if (work) {
    run(
      database,
      `INSERT OR IGNORE INTO memories (
        planet_id, title, content, type, occurred_at, visibility, importance,
        tags_json, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        work.id,
        "Front-end engineer focused on maintainable delivery",
        "Since 2020, I have worked on medical systems, data platforms, H5, mini programs, and enterprise products with a focus on stable delivery and maintainable architecture.",
        "bio",
        "2026-04-24",
        "public",
        9,
        stringifyArray(["work", "frontend", "delivery"]),
        "seed",
        timestamp,
        timestamp,
      ]
    )
  }

  if (technology) {
    run(
      database,
      `INSERT OR IGNORE INTO memories (
        planet_id, title, content, type, occurred_at, visibility, importance,
        tags_json, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        technology.id,
        "Technology interests",
        "I pay attention to Vue, engineering systems, ECharts visualization, WebSocket real-time communication, performance optimization, WebGL, and AI agents.",
        "preference",
        "2026-04-24",
        "assistant",
        8,
        stringifyArray(["technology", "ai", "frontend"]),
        "seed",
        timestamp,
        timestamp,
      ]
    )
  }

  run(
    database,
    `INSERT OR IGNORE INTO twin_identity (
      id, display_name, subtitle, avatar_description, first_person_style,
      third_person_style, values_json, communication_rules_json,
      privacy_rules_json, uncertainty_rules_json, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "縉紳 AI",
      "记忆驱动的数字分身",
      "A quiet dark-space assistant avatar with a glass halo.",
      "Use first person for public, well-supported facts and explain reasoning directly.",
      "Use proxy wording when the answer is uncertain, private, or commitment-heavy.",
      stringifyArray(["Clarity", "Pragmatism", "Maintainability", "Long-term thinking"]),
      stringifyArray(["Be direct", "Use concise answers", "Reference relevant memories"]),
      stringifyArray(["Do not expose private memories", "Do not invent personal facts"]),
      stringifyArray(["State uncertainty when memory support is weak"]),
      timestamp,
    ]
  )
}
```

Add `seedLifeUniverse(database)` inside `seedDatabase(database)` after `seedNotes(database)`.

Add mappers after `mapProfileRow(row)`:

```ts
function mapPlanetRow(row: PlanetRow): StoredPlanet {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    x: row.x,
    y: row.y,
    size: row.size === "small" || row.size === "large" ? row.size : "medium",
    theme: row.theme,
    status: parseStatus(row.status),
    sortOrder: row.sort_order,
    weight: row.weight,
  }
}

function mapMemoryRow(row: MemoryRow): StoredMemory {
  return {
    id: row.id,
    planetId: row.planet_id,
    planetSlug: row.planet_slug,
    planetName: row.planet_name,
    title: row.title,
    content: row.content,
    type: row.type as StoredMemory["type"],
    occurredAt: row.occurred_at,
    visibility: row.visibility as StoredMemory["visibility"],
    importance: row.importance,
    tags: parseStringArray(row.tags_json),
    source: row.source,
  }
}

function mapTwinIdentityRow(row: TwinIdentityRow): StoredTwinIdentity {
  return {
    displayName: row.display_name,
    subtitle: row.subtitle,
    avatarDescription: row.avatar_description,
    firstPersonStyle: row.first_person_style,
    thirdPersonStyle: row.third_person_style,
    values: parseStringArray(row.values_json),
    communicationRules: parseStringArray(row.communication_rules_json),
    privacyRules: parseStringArray(row.privacy_rules_json),
    uncertaintyRules: parseStringArray(row.uncertainty_rules_json),
  }
}

const fallbackTwinIdentity: StoredTwinIdentity = {
  displayName: "縉紳 AI",
  subtitle: "记忆驱动的数字分身",
  avatarDescription: "A quiet dark-space assistant avatar with a glass halo.",
  firstPersonStyle: "Use first person for public, well-supported facts and explain reasoning directly.",
  thirdPersonStyle: "Use proxy wording when the answer is uncertain, private, or commitment-heavy.",
  values: ["Clarity", "Pragmatism", "Maintainability", "Long-term thinking"],
  communicationRules: ["Be direct", "Use concise answers", "Reference relevant memories"],
  privacyRules: ["Do not expose private memories", "Do not invent personal facts"],
  uncertaintyRules: ["State uncertainty when memory support is weak"],
}
```

Add query helpers and exports before `saveProfile(input)`:

```ts
function getMemoriesByVisibility(
  visibilitySql: string
): ReadonlyArray<StoredMemory> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT
           memories.*,
           planets.slug AS planet_slug,
           planets.name AS planet_name
         FROM memories
         INNER JOIN planets ON planets.id = memories.planet_id
         WHERE planets.status = 'published' AND ${visibilitySql}
         ORDER BY memories.importance DESC, memories.occurred_at DESC, memories.id DESC`
      )
      .all() as MemoryRow[]

    return rows.map(mapMemoryRow)
  })
}

export function getPublicPlanets(): ReadonlyArray<StoredPlanet> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT * FROM planets
         WHERE status = 'published'
         ORDER BY sort_order ASC, id ASC`
      )
      .all() as PlanetRow[]

    return rows.map(mapPlanetRow)
  })
}

export function getAdminPlanets(): ReadonlyArray<StoredPlanet> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare("SELECT * FROM planets ORDER BY sort_order ASC, id ASC")
      .all() as PlanetRow[]

    return rows.map(mapPlanetRow)
  })
}

export function getPublicMemories(): ReadonlyArray<StoredMemory> {
  return getMemoriesByVisibility("memories.visibility = 'public'")
}

export function getAssistantMemories(): ReadonlyArray<StoredMemory> {
  return getMemoriesByVisibility("memories.visibility IN ('public', 'assistant')")
}

export function getAdminMemories(): ReadonlyArray<StoredMemory> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT
           memories.*,
           planets.slug AS planet_slug,
           planets.name AS planet_name
         FROM memories
         INNER JOIN planets ON planets.id = memories.planet_id
         ORDER BY memories.occurred_at DESC, memories.id DESC`
      )
      .all() as MemoryRow[]

    return rows.map(mapMemoryRow)
  })
}

export function getTwinIdentity(): StoredTwinIdentity {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const row = database
      .prepare("SELECT * FROM twin_identity WHERE id = 1")
      .get() as TwinIdentityRow | undefined

    return row ? mapTwinIdentityRow(row) : fallbackTwinIdentity
  })
}
```

Add save/delete/toggle exports before `deleteEssay(slug)`:

```ts
export function savePlanet(input: PlanetInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    const timestamp = nowText()

    run(
      database,
      `INSERT INTO planets (
        slug, name, summary, description, x, y, size, theme, status,
        sort_order, weight, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        summary = excluded.summary,
        description = excluded.description,
        x = excluded.x,
        y = excluded.y,
        size = excluded.size,
        theme = excluded.theme,
        status = excluded.status,
        sort_order = excluded.sort_order,
        weight = excluded.weight,
        updated_at = excluded.updated_at`,
      [
        input.slug,
        input.name,
        input.summary,
        input.description,
        input.x,
        input.y,
        input.size,
        input.theme,
        input.status,
        input.sortOrder,
        input.weight,
        timestamp,
        timestamp,
      ]
    )
  })
}

export function saveMemory(input: MemoryInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    const timestamp = nowText()

    run(
      database,
      `INSERT INTO memories (
        planet_id, title, content, type, occurred_at, visibility, importance,
        tags_json, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.planetId,
        input.title,
        input.content,
        input.type,
        input.occurredAt,
        input.visibility,
        input.importance,
        stringifyArray(input.tags),
        input.source,
        timestamp,
        timestamp,
      ]
    )
  })
}

export function saveTwinIdentity(input: TwinIdentityInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    run(
      database,
      `INSERT INTO twin_identity (
        id, display_name, subtitle, avatar_description, first_person_style,
        third_person_style, values_json, communication_rules_json,
        privacy_rules_json, uncertainty_rules_json, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        display_name = excluded.display_name,
        subtitle = excluded.subtitle,
        avatar_description = excluded.avatar_description,
        first_person_style = excluded.first_person_style,
        third_person_style = excluded.third_person_style,
        values_json = excluded.values_json,
        communication_rules_json = excluded.communication_rules_json,
        privacy_rules_json = excluded.privacy_rules_json,
        uncertainty_rules_json = excluded.uncertainty_rules_json,
        updated_at = excluded.updated_at`,
      [
        input.displayName,
        input.subtitle,
        input.avatarDescription,
        input.firstPersonStyle,
        input.thirdPersonStyle,
        stringifyArray(input.values),
        stringifyArray(input.communicationRules),
        stringifyArray(input.privacyRules),
        stringifyArray(input.uncertaintyRules),
        nowText(),
      ]
    )
  })
}

export function deletePlanet(slug: string) {
  deleteBySlug("planets", slug)
}

export function deleteMemory(id: number) {
  initializeCmsDatabase()

  withDatabase((database) => {
    run(database, "DELETE FROM memories WHERE id = ?", [id])
  })
}

export function togglePlanetStatus(slug: string) {
  toggleStatus("planets", slug)
}
```

Update the `deleteBySlug` and `toggleStatus` table unions:

```ts
function deleteBySlug(table: "essays" | "projects" | "notes" | "planets", slug: string) {
```

```ts
function toggleStatus(table: "essays" | "projects" | "notes" | "planets", slug: string) {
```

- [ ] **Step 8: Run database tests and verify pass**

Run:

```bash
npm test -- tests/lib/cms-db.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

Run:

```bash
git add lib/cms/schema.ts lib/cms/db.ts tests/lib/admin-validation.test.ts tests/lib/cms-db.test.ts
git commit -m "feat: add life universe data model"
```

Expected: commit created.

---

### Task 2: Admin Management For Planets, Memories, And Twin Identity

**Files:**
- Modify: `components/admin/admin-ui.tsx`
- Modify: `app/admin/(protected)/page.tsx`
- Create: `app/admin/(protected)/planets/page.tsx`
- Create: `app/admin/(protected)/memories/page.tsx`
- Create: `app/admin/(protected)/twin/page.tsx`
- Modify: `tests/components/site-shell.test.tsx` is not required for admin nav.

- [ ] **Step 1: Update admin navigation**

In `components/admin/admin-ui.tsx`, replace `navItems` with:

```ts
const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/planets", label: "Planets" },
  { href: "/admin/memories", label: "Memories" },
  { href: "/admin/twin", label: "Twin" },
  { href: "/admin/essays", label: "Essays" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/notes", label: "Notes" },
]
```

- [ ] **Step 2: Extend dashboard metrics**

In `lib/cms/db.ts`, extend `AdminContentSummary`:

```ts
export type AdminContentSummary = {
  readonly publishedEssays: number
  readonly draftEssays: number
  readonly publishedProjects: number
  readonly draftProjects: number
  readonly publishedNotes: number
  readonly draftNotes: number
  readonly publishedPlanets: number
  readonly draftPlanets: number
  readonly publicMemories: number
  readonly assistantMemories: number
  readonly privateMemories: number
}
```

Replace `getAdminContentSummary()` with:

```ts
export function getAdminContentSummary(): AdminContentSummary {
  const essays = getAdminEssays()
  const projects = getAdminProjects()
  const notes = getAdminNotes()
  const planets = getAdminPlanets()
  const memories = getAdminMemories()

  return {
    publishedEssays: essays.filter((essay) => essay.status === "published").length,
    draftEssays: essays.filter((essay) => essay.status === "draft").length,
    publishedProjects: projects.filter((project) => project.status === "published").length,
    draftProjects: projects.filter((project) => project.status === "draft").length,
    publishedNotes: notes.filter((note) => note.status === "published").length,
    draftNotes: notes.filter((note) => note.status === "draft").length,
    publishedPlanets: planets.filter((planet) => planet.status === "published").length,
    draftPlanets: planets.filter((planet) => planet.status === "draft").length,
    publicMemories: memories.filter((memory) => memory.visibility === "public").length,
    assistantMemories: memories.filter((memory) => memory.visibility === "assistant").length,
    privateMemories: memories.filter((memory) => memory.visibility === "private").length,
  }
}
```

In `app/admin/(protected)/page.tsx`, add `getAdminMemories`, `getAdminPlanets`, and `getTwinIdentity` to the import from `@/lib/cms/db`. Add these items to `latest` before `.slice(0, 6)`:

```ts
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
```

Replace the metric grid with:

```tsx
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Planets" published={summary.publishedPlanets} draft={summary.draftPlanets} />
        <MemoryMetric
          label="Memories"
          publicCount={summary.publicMemories}
          assistantCount={summary.assistantMemories}
          privateCount={summary.privateMemories}
        />
        <Metric label="Essays" published={summary.publishedEssays} draft={summary.draftEssays} />
        <Metric
          label="Projects"
          published={summary.publishedProjects}
          draft={summary.draftProjects}
        />
        <Metric label="Notes" published={summary.publishedNotes} draft={summary.draftNotes} />
      </div>
      <AdminPanel>
        <div className="mt-6 p-4">
          <p className="text-sm text-zinc-500">Twin Identity</p>
          <p className="mt-2 text-lg font-semibold">{getTwinIdentity().displayName}</p>
          <p className="mt-1 text-sm text-zinc-500">{getTwinIdentity().subtitle}</p>
        </div>
      </AdminPanel>
```

Add this component after `Metric`:

```tsx
function MemoryMetric({
  label,
  publicCount,
  assistantCount,
  privateCount,
}: {
  readonly label: string
  readonly publicCount: number
  readonly assistantCount: number
  readonly privateCount: number
}) {
  return (
    <AdminPanel>
      <div className="p-4">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{publicCount + assistantCount + privateCount}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {publicCount} public / {assistantCount} assistant / {privateCount} private
        </p>
      </div>
    </AdminPanel>
  )
}
```

- [ ] **Step 3: Create planets admin route**

Create `app/admin/(protected)/planets/page.tsx`:

```tsx
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  AdminError,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  StatusSelect,
  SubmitButton,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import {
  deletePlanet,
  getAdminPlanets,
  savePlanet,
  togglePlanetStatus,
} from "@/lib/cms/db"
import { parsePlanetFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Planets",
}

export default async function AdminPlanetsPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  const planets = getAdminPlanets()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="Planets"
        description="管理人生宇宙中的自定义星球。只有 published 会出现在前台画布。"
      />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <PlanetForm title="新建星球" />
        {planets.map((planet) => (
          <PlanetForm key={planet.slug} title={planet.name} planet={planet} />
        ))}
      </div>
    </>
  )
}

function PlanetForm({
  title,
  planet,
}: {
  readonly title: string
  readonly planet?: {
    readonly slug: string
    readonly name: string
    readonly summary: string
    readonly description: string
    readonly x: number
    readonly y: number
    readonly size: string
    readonly theme: string
    readonly status: string
    readonly sortOrder: number
    readonly weight: number
  }
}) {
  const isExisting = Boolean(planet)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">{title}</summary>
        <form action={planetAction} className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70">
          <input type="hidden" name="intent" value="save" />
          <div className="grid gap-4 md:grid-cols-4">
            <AdminField label="Slug" name="slug" defaultValue={planet?.slug} required readOnly={isExisting} />
            <AdminField label="名称" name="name" defaultValue={planet?.name} required />
            <AdminField label="X 坐标" name="x" defaultValue={planet?.x ?? 0} required />
            <AdminField label="Y 坐标" name="y" defaultValue={planet?.y ?? 0} required />
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">尺寸</span>
              <select name="size" defaultValue={planet?.size ?? "medium"} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600">
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
              </select>
            </label>
            <AdminField label="主题" name="theme" defaultValue={planet?.theme ?? "cyan"} required />
            <AdminField label="排序" name="sortOrder" defaultValue={planet?.sortOrder ?? 0} required />
            <AdminField label="权重" name="weight" defaultValue={planet?.weight ?? 5} required />
            <StatusSelect defaultValue={planet?.status ?? "draft"} />
          </div>
          <AdminField label="摘要" name="summary" defaultValue={planet?.summary} textarea required />
          <AdminField label="描述" name="description" defaultValue={planet?.description} textarea />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <button formAction={planetAction} name="intent" value="toggle" className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  切换发布状态
                </button>
                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  <input name="confirmDelete" type="checkbox" /> 确认删除
                </label>
                <button formAction={planetAction} name="intent" value="delete" className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  删除
                </button>
              </>
            ) : null}
          </div>
        </form>
      </details>
    </AdminPanel>
  )
}

async function planetAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const slug = String(formData.get("slug") ?? "")

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/planets?error=删除前需要勾选确认")
    }
    deletePlanet(slug)
    revalidateContent()
    redirect("/admin/planets")
  }

  if (intent === "toggle") {
    togglePlanetStatus(slug)
    revalidateContent()
    redirect("/admin/planets")
  }

  const result = parsePlanetFormData(formData)

  if (!result.ok) {
    redirect(`/admin/planets?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  savePlanet(result.value)
  revalidateContent()
  redirect("/admin/planets")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/planets")
}
```

- [ ] **Step 4: Create memories admin route**

Create `app/admin/(protected)/memories/page.tsx`:

```tsx
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  AdminError,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  SubmitButton,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import { deleteMemory, getAdminMemories, getAdminPlanets, saveMemory } from "@/lib/cms/db"
import { parseMemoryFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Memories",
}

export default async function AdminMemoriesPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  const memories = getAdminMemories()
  const planets = getAdminPlanets()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="Memories"
        description="管理数字分身可引用的人生记忆。private 不会出现在公开页面或模型上下文。"
      />
      <AdminError message={params?.error} />
      <div className="space-y-4">
        <MemoryForm title="新建记忆" planets={planets} />
        {memories.map((memory) => (
          <MemoryForm key={memory.id} title={memory.title} memory={memory} planets={planets} />
        ))}
      </div>
    </>
  )
}

function MemoryForm({
  title,
  memory,
  planets,
}: {
  readonly title: string
  readonly memory?: {
    readonly id: number
    readonly planetId: number
    readonly planetName: string
    readonly title: string
    readonly content: string
    readonly type: string
    readonly occurredAt: string
    readonly visibility: string
    readonly importance: number
    readonly tags: ReadonlyArray<string>
    readonly source: string
  }
  readonly planets: ReadonlyArray<{ readonly id: number; readonly name: string }>
}) {
  const isExisting = Boolean(memory)

  return (
    <AdminPanel>
      <details open={!isExisting}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          {title}
          {memory ? <span className="ml-2 text-xs text-zinc-500">{memory.planetName}</span> : null}
        </summary>
        <form action={memoryAction} className="grid gap-4 border-t border-zinc-200/70 p-4 dark:border-zinc-800/70">
          <input type="hidden" name="intent" value="save" />
          {memory ? <input type="hidden" name="id" value={memory.id} /> : null}
          <div className="grid gap-4 md:grid-cols-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">星球</span>
              <select name="planetId" defaultValue={memory?.planetId} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600">
                <option value="0">选择星球</option>
                {planets.map((planet) => (
                  <option key={planet.id} value={planet.id}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </label>
            <AdminField label="标题" name="title" defaultValue={memory?.title} required />
            <AdminField label="发生日期" name="occurredAt" defaultValue={memory?.occurredAt ?? new Date().toISOString().slice(0, 10)} required />
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">类型</span>
              <select name="type" defaultValue={memory?.type ?? "diary"} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600">
                <option value="diary">diary</option>
                <option value="behavior">behavior</option>
                <option value="opinion">opinion</option>
                <option value="project">project</option>
                <option value="habit">habit</option>
                <option value="preference">preference</option>
                <option value="milestone">milestone</option>
                <option value="bio">bio</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">可见性</span>
              <select name="visibility" defaultValue={memory?.visibility ?? "assistant"} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600">
                <option value="public">public</option>
                <option value="assistant">assistant</option>
                <option value="private">private</option>
              </select>
            </label>
            <AdminField label="重要度" name="importance" defaultValue={memory?.importance ?? 5} required />
            <AdminField label="标签" name="tags" defaultValue={memory?.tags.join(", ")} />
            <AdminField label="来源" name="source" defaultValue={memory?.source ?? "manual"} />
          </div>
          <AdminField label="内容" name="content" defaultValue={memory?.content} textarea required />
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton />
            {isExisting ? (
              <>
                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  <input name="confirmDelete" type="checkbox" /> 确认删除
                </label>
                <button formAction={memoryAction} name="intent" value="delete" className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  删除
                </button>
              </>
            ) : null}
          </div>
        </form>
      </details>
    </AdminPanel>
  )
}

async function memoryAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const intent = String(formData.getAll("intent").at(-1) ?? "save")
  const id = Number.parseInt(String(formData.get("id") ?? "0"), 10)

  if (intent === "delete") {
    if (formData.get("confirmDelete") !== "on") {
      redirect("/admin/memories?error=删除前需要勾选确认")
    }
    deleteMemory(id)
    revalidateContent()
    redirect("/admin/memories")
  }

  const result = parseMemoryFormData(formData)

  if (!result.ok) {
    redirect(`/admin/memories?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  saveMemory(result.value)
  revalidateContent()
  redirect("/admin/memories")
}

function revalidateContent() {
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/memories")
}
```

- [ ] **Step 5: Create twin identity admin route**

Create `app/admin/(protected)/twin/page.tsx`:

```tsx
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  AdminError,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  SubmitButton,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import { getTwinIdentity, saveTwinIdentity } from "@/lib/cms/db"
import { parseTwinIdentityFormData } from "@/lib/cms/schema"

export const metadata = {
  title: "Admin Twin",
}

export default async function AdminTwinPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{ error?: string }>
}) {
  const identity = getTwinIdentity()
  const params = await searchParams

  return (
    <>
      <AdminPageHeader
        title="Twin Identity"
        description="维护数字分身的人格、语气和边界规则。"
      />
      <AdminError message={params?.error} />
      <AdminPanel>
        <form action={saveTwinAction} className="grid gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="显示名称" name="displayName" defaultValue={identity.displayName} required />
            <AdminField label="副标题" name="subtitle" defaultValue={identity.subtitle} required />
          </div>
          <AdminField label="头像描述" name="avatarDescription" defaultValue={identity.avatarDescription} textarea required />
          <AdminField label="第一人称风格" name="firstPersonStyle" defaultValue={identity.firstPersonStyle} textarea required />
          <AdminField label="代理口吻风格" name="thirdPersonStyle" defaultValue={identity.thirdPersonStyle} textarea required />
          <AdminField label="价值观（每行一项）" name="values" defaultValue={identity.values.join("\n")} textarea />
          <AdminField label="沟通规则（每行一项）" name="communicationRules" defaultValue={identity.communicationRules.join("\n")} textarea />
          <AdminField label="隐私规则（每行一项）" name="privacyRules" defaultValue={identity.privacyRules.join("\n")} textarea />
          <AdminField label="不确定性规则（每行一项）" name="uncertaintyRules" defaultValue={identity.uncertaintyRules.join("\n")} textarea />
          <div>
            <SubmitButton />
          </div>
        </form>
      </AdminPanel>
    </>
  )
}

async function saveTwinAction(formData: FormData) {
  "use server"

  await requireAdminSession()
  const result = parseTwinIdentityFormData(formData)

  if (!result.ok) {
    redirect(`/admin/twin?error=${encodeURIComponent(Object.values(result.errors).join("，"))}`)
  }

  saveTwinIdentity(result.value)
  revalidatePath("/")
  revalidatePath("/admin")
  redirect("/admin/twin")
}
```

- [ ] **Step 6: Run focused checks**

Run:

```bash
npm run typecheck
npm test -- tests/lib/cms-db.test.ts tests/lib/admin-validation.test.ts
```

Expected: both commands PASS.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add components/admin/admin-ui.tsx app/admin/'(protected)'/page.tsx app/admin/'(protected)'/planets/page.tsx app/admin/'(protected)'/memories/page.tsx app/admin/'(protected)'/twin/page.tsx lib/cms/db.ts
git commit -m "feat: add life universe admin"
```

Expected: commit created.

---

### Task 3: Public Life Universe Readers

**Files:**
- Modify: `lib/content.ts`
- Modify: `app/(site)/page.tsx`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Add content-layer exports**

In `lib/content.ts`, extend imports from `@/lib/cms/db`:

```ts
  getAssistantMemories,
  getPublicMemories,
  getPublicPlanets,
  getTwinIdentity,
```

Extend the schema import:

```ts
import type {
  StoredMemory,
  StoredPlanet,
  StoredTwinIdentity,
} from "@/lib/cms/schema"
```

Add these exports after existing type exports:

```ts
export type { StoredMemory, StoredPlanet, StoredTwinIdentity }
```

Add clone helpers after `cloneProjectEntry(project)`:

```ts
function clonePlanet(planet: StoredPlanet): StoredPlanet {
  return { ...planet }
}

function cloneMemory(memory: StoredMemory): StoredMemory {
  return {
    ...memory,
    tags: [...memory.tags],
  }
}

function cloneTwinIdentity(identity: StoredTwinIdentity): StoredTwinIdentity {
  return {
    ...identity,
    values: [...identity.values],
    communicationRules: [...identity.communicationRules],
    privacyRules: [...identity.privacyRules],
    uncertaintyRules: [...identity.uncertaintyRules],
  }
}
```

Add content functions after `getProjects()`:

```ts
export function getLifePlanets(): ReadonlyArray<StoredPlanet> {
  return getPublicPlanets().map(clonePlanet)
}

export function getLifeMemories(): ReadonlyArray<StoredMemory> {
  return getPublicMemories().map(cloneMemory)
}

export function getTwinContextMemories(): ReadonlyArray<StoredMemory> {
  return getAssistantMemories().map(cloneMemory)
}

export function getPublicTwinIdentity(): StoredTwinIdentity {
  return cloneTwinIdentity(getTwinIdentity())
}
```

- [ ] **Step 2: Update homepage route props**

In `app/(site)/page.tsx`, extend the import from `@/lib/content`:

```ts
  getLifeMemories,
  getLifePlanets,
  getPublicTwinIdentity,
```

Add props to `<HomePageView />`:

```tsx
      memories={getLifeMemories()}
      planets={getLifePlanets()}
      twinIdentity={getPublicTwinIdentity()}
```

- [ ] **Step 3: Update homepage test fixture shape**

In `tests/components/home-page-view.test.tsx`, add `planets`, `memories`, and `twinIdentity` to the object returned by `buildProps()`:

```ts
    planets: [
      {
        id: 1,
        slug: "work",
        name: "Work",
        summary: "Work and delivery",
        description: "How work happens",
        x: 120,
        y: -80,
        size: "large",
        theme: "cyan",
        status: "published",
        sortOrder: 1,
        weight: 9,
      },
    ],
    memories: [
      {
        id: 1,
        planetId: 1,
        planetSlug: "work",
        planetName: "Work",
        title: "Direct engineering style",
        content: "I prefer direct, practical engineering notes.",
        type: "preference",
        occurredAt: "2026-04-24",
        visibility: "public",
        importance: 9,
        tags: ["engineering"],
        source: "fixture",
      },
    ],
    twinIdentity: {
      displayName: "Fixture Twin",
      subtitle: "Fixture digital twin",
      avatarDescription: "Fixture avatar",
      firstPersonStyle: "First person fixture style",
      thirdPersonStyle: "Proxy fixture style",
      values: ["Clarity"],
      communicationRules: ["Be direct"],
      privacyRules: ["No private memory"],
      uncertaintyRules: ["State uncertainty"],
    },
```

- [ ] **Step 4: Run typecheck and verify current homepage component fails**

Run:

```bash
npm run typecheck
```

Expected: FAIL because `HomePageView` does not yet accept `planets`, `memories`, and `twinIdentity`.

- [ ] **Step 5: Commit the reader route prep with no commit yet**

Do not commit after this task step. Task 5 in this plan replaces `HomePageView`; commit the route prop changes together with the component replacement.

---

### Task 4: Twin Retrieval And Chat API

**Files:**
- Create: `lib/twin/types.ts`
- Create: `lib/twin/retrieval.ts`
- Create: `lib/twin/prompt.ts`
- Create: `lib/twin/fallback.ts`
- Create: `lib/twin/model.ts`
- Create: `app/api/twin/chat/route.ts`
- Create: `tests/lib/twin-retrieval.test.ts`
- Create: `tests/app/twin-chat-route.test.ts`

- [ ] **Step 1: Write failing retrieval tests**

Create `tests/lib/twin-retrieval.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { retrieveTwinContext } from "@/lib/twin/retrieval"
import type { StoredMemory, StoredPlanet } from "@/lib/cms/schema"

const planets: ReadonlyArray<StoredPlanet> = [
  {
    id: 1,
    slug: "work",
    name: "Work",
    summary: "Delivery and engineering collaboration",
    description: "How work is planned and shipped.",
    x: 0,
    y: 0,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 1,
    weight: 9,
  },
  {
    id: 2,
    slug: "health",
    name: "Health",
    summary: "Energy and routines",
    description: "Personal rhythm and sustainable pace.",
    x: 100,
    y: 100,
    size: "medium",
    theme: "emerald",
    status: "published",
    sortOrder: 2,
    weight: 4,
  },
]

const memories: ReadonlyArray<StoredMemory> = [
  {
    id: 1,
    planetId: 1,
    planetSlug: "work",
    planetName: "Work",
    title: "Engineering delivery style",
    content: "I prefer practical delivery, clear ownership, and maintainable code.",
    type: "preference",
    occurredAt: "2026-04-24",
    visibility: "public",
    importance: 9,
    tags: ["engineering", "delivery"],
    source: "fixture",
  },
  {
    id: 2,
    planetId: 2,
    planetSlug: "health",
    planetName: "Health",
    title: "Private health note",
    content: "This private note should never appear.",
    type: "diary",
    occurredAt: "2026-04-24",
    visibility: "private",
    importance: 10,
    tags: ["private"],
    source: "fixture",
  },
]

describe("retrieveTwinContext", () => {
  it("returns ranked planet and memory references for a query", () => {
    const result = retrieveTwinContext({
      message: "How do you approach engineering delivery?",
      focusedPlanetId: undefined,
      planets,
      memories,
      limit: 4,
    })

    expect(result.references[0]).toMatchObject({
      kind: "memory",
      id: "memory-1",
      title: "Engineering delivery style",
    })
    expect(result.contextText).toContain("Engineering delivery style")
    expect(result.contextText).toContain("maintainable code")
  })

  it("excludes private memories even when text matches", () => {
    const result = retrieveTwinContext({
      message: "private health note",
      focusedPlanetId: 2,
      planets,
      memories,
      limit: 4,
    })

    expect(result.contextText).not.toContain("This private note should never appear")
    expect(result.references.map((reference) => reference.id)).not.toContain("memory-2")
  })
})
```

- [ ] **Step 2: Run retrieval tests and verify failure**

Run:

```bash
npm test -- tests/lib/twin-retrieval.test.ts
```

Expected: FAIL because `@/lib/twin/retrieval` does not exist.

- [ ] **Step 3: Create twin types and retrieval implementation**

Create `lib/twin/types.ts`:

```ts
import type {
  StoredMemory,
  StoredPlanet,
  StoredTwinIdentity,
} from "@/lib/cms/schema"

export type TwinReference = {
  readonly kind: "planet" | "memory"
  readonly id: string
  readonly title: string
  readonly excerpt: string
}

export type RetrievedTwinContext = {
  readonly contextText: string
  readonly references: ReadonlyArray<TwinReference>
}

export type TwinChatRequest = {
  readonly message: string
  readonly focusedPlanetId?: number
}

export type TwinChatResponse = {
  readonly answer: string
  readonly mode: "model" | "fallback"
  readonly references: ReadonlyArray<TwinReference>
}

export type TwinPromptInput = {
  readonly message: string
  readonly identity: StoredTwinIdentity
  readonly context: RetrievedTwinContext
}

export type TwinRetrievalInput = {
  readonly message: string
  readonly focusedPlanetId?: number
  readonly planets: ReadonlyArray<StoredPlanet>
  readonly memories: ReadonlyArray<StoredMemory>
  readonly limit?: number
}
```

Create `lib/twin/retrieval.ts`:

```ts
import type { StoredMemory, StoredPlanet } from "@/lib/cms/schema"
import type { RetrievedTwinContext, TwinReference, TwinRetrievalInput } from "@/lib/twin/types"

function tokenize(value: string): ReadonlyArray<string> {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
}

function textScore(text: string, tokens: ReadonlyArray<string>): number {
  const normalized = text.toLowerCase()
  return tokens.reduce((score, token) => score + (normalized.includes(token) ? 3 : 0), 0)
}

function excerpt(value: string): string {
  return value.length > 140 ? `${value.slice(0, 137)}...` : value
}

function scorePlanet(
  planet: StoredPlanet,
  tokens: ReadonlyArray<string>,
  focusedPlanetId?: number
): number {
  const focusBoost = focusedPlanetId === planet.id ? 12 : 0
  return (
    focusBoost +
    planet.weight +
    textScore(`${planet.name} ${planet.summary} ${planet.description}`, tokens)
  )
}

function scoreMemory(
  memory: StoredMemory,
  tokens: ReadonlyArray<string>,
  focusedPlanetId?: number
): number {
  if (memory.visibility === "private") {
    return -1
  }

  const focusBoost = focusedPlanetId === memory.planetId ? 8 : 0
  const recencyBoost = memory.occurredAt >= "2026-01-01" ? 2 : 0
  return (
    focusBoost +
    recencyBoost +
    memory.importance +
    textScore(
      `${memory.title} ${memory.content} ${memory.type} ${memory.tags.join(" ")} ${memory.planetName}`,
      tokens
    )
  )
}

export function retrieveTwinContext(input: TwinRetrievalInput): RetrievedTwinContext {
  const tokens = tokenize(input.message)
  const limit = input.limit ?? 5
  const planetMatches = input.planets
    .map((planet) => ({
      score: scorePlanet(planet, tokens, input.focusedPlanetId),
      reference: {
        kind: "planet" as const,
        id: `planet-${planet.id}`,
        title: planet.name,
        excerpt: excerpt(planet.summary),
      },
      context: `Planet: ${planet.name}\nSummary: ${planet.summary}\nDescription: ${planet.description}`,
    }))
    .filter((item) => item.score > 0)

  const memoryMatches = input.memories
    .map((memory) => ({
      score: scoreMemory(memory, tokens, input.focusedPlanetId),
      reference: {
        kind: "memory" as const,
        id: `memory-${memory.id}`,
        title: memory.title,
        excerpt: excerpt(memory.content),
      },
      context: `Memory: ${memory.title}\nPlanet: ${memory.planetName}\nType: ${memory.type}\nDate: ${memory.occurredAt}\nContent: ${memory.content}`,
    }))
    .filter((item) => item.score > 0)

  const matches = [...memoryMatches, ...planetMatches]
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)

  return {
    contextText: matches.map((match) => match.context).join("\n\n---\n\n"),
    references: matches.map((match): TwinReference => match.reference),
  }
}
```

- [ ] **Step 4: Run retrieval tests and verify pass**

Run:

```bash
npm test -- tests/lib/twin-retrieval.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create prompt, fallback, model, and API route**

Create `lib/twin/prompt.ts`:

```ts
import type { TwinPromptInput } from "@/lib/twin/types"

export function buildTwinPrompt(input: TwinPromptInput): string {
  const identity = input.identity
  const values = identity.values.map((value) => `- ${value}`).join("\n")
  const communicationRules = identity.communicationRules.map((rule) => `- ${rule}`).join("\n")
  const privacyRules = identity.privacyRules.map((rule) => `- ${rule}`).join("\n")
  const uncertaintyRules = identity.uncertaintyRules.map((rule) => `- ${rule}`).join("\n")

  return [
    `You are ${identity.displayName}, ${identity.subtitle}.`,
    identity.avatarDescription,
    "",
    "Voice:",
    `First-person style: ${identity.firstPersonStyle}`,
    `Proxy style: ${identity.thirdPersonStyle}`,
    "",
    "Values:",
    values,
    "",
    "Communication rules:",
    communicationRules,
    "",
    "Privacy rules:",
    privacyRules,
    "",
    "Uncertainty rules:",
    uncertaintyRules,
    "",
    "Retrieved memories and planets:",
    input.context.contextText || "No relevant memory was retrieved.",
    "",
    "User message:",
    input.message,
    "",
    "Answer in Chinese unless the user asks for another language. Do not reveal private memories. If memory support is weak, say so directly.",
  ].join("\n")
}
```

Create `lib/twin/fallback.ts`:

```ts
import type { RetrievedTwinContext, TwinChatResponse } from "@/lib/twin/types"

export function buildFallbackTwinResponse(
  message: string,
  context: RetrievedTwinContext
): TwinChatResponse {
  const lead = context.references[0]

  if (!lead) {
    return {
      answer:
        "离线模式：我暂时没有找到足够相关的公开记忆，所以不能替本人给出确定回答。可以先在后台补充对应星球或记忆。",
      mode: "fallback",
      references: [],
    }
  }

  return {
    answer: `离线模式：关于“${message}”，我找到的最相关记忆是「${lead.title}」。${lead.excerpt} 这不是完整模型回答，只是基于已检索记忆的简短摘要。`,
    mode: "fallback",
    references: context.references,
  }
}
```

Create `lib/twin/model.ts`:

```ts
import type { TwinChatResponse, TwinReference } from "@/lib/twin/types"

type OpenAIResponse = {
  readonly output_text?: string
}

export async function callTwinModel({
  prompt,
  references,
}: {
  readonly prompt: string
  readonly references: ReadonlyArray<TwinReference>
}): Promise<TwinChatResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL

  if (!apiKey || !model) {
    return null
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
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as OpenAIResponse
  const answer = data.output_text?.trim()

  if (!answer) {
    return null
  }

  return {
    answer,
    mode: "model",
    references,
  }
}
```

Create `app/api/twin/chat/route.ts`:

```ts
import { NextResponse } from "next/server"

import { getAssistantMemories, getPublicPlanets, getTwinIdentity } from "@/lib/cms/db"
import { buildFallbackTwinResponse } from "@/lib/twin/fallback"
import { callTwinModel } from "@/lib/twin/model"
import { buildTwinPrompt } from "@/lib/twin/prompt"
import { retrieveTwinContext } from "@/lib/twin/retrieval"
import type { TwinChatRequest } from "@/lib/twin/types"

export async function POST(request: Request) {
  let body: TwinChatRequest

  try {
    body = (await request.json()) as TwinChatRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const planets = getPublicPlanets()
  const memories = getAssistantMemories()
  const identity = getTwinIdentity()
  const context = retrieveTwinContext({
    message,
    focusedPlanetId: body.focusedPlanetId,
    planets,
    memories,
    limit: 5,
  })
  const prompt = buildTwinPrompt({ message, identity, context })
  const modelResponse = await callTwinModel({
    prompt,
    references: context.references,
  })

  return NextResponse.json(
    modelResponse ?? buildFallbackTwinResponse(message, context)
  )
}
```

- [ ] **Step 6: Write API route tests**

Create `tests/app/twin-chat-route.test.ts`:

```ts
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let tempDir = ""

async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/twin/chat/route")
}

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "blog-twin-"))
  process.env.BLOG_DATABASE_PATH = join(tempDir, "blog.sqlite")
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_MODEL
})

afterEach(() => {
  delete process.env.BLOG_DATABASE_PATH
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_MODEL
  rmSync(tempDir, { recursive: true, force: true })
  vi.resetModules()
})

describe("POST /api/twin/chat", () => {
  it("returns fallback answer and references without model credentials", async () => {
    const { POST } = await loadRoute()
    const response = await POST(
      new Request("https://example.test/api/twin/chat", {
        method: "POST",
        body: JSON.stringify({ message: "你怎么看前端工程化?" }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mode).toBe("fallback")
    expect(data.answer).toContain("离线模式")
    expect(data.references.length).toBeGreaterThan(0)
  })

  it("rejects empty messages", async () => {
    const { POST } = await loadRoute()
    const response = await POST(
      new Request("https://example.test/api/twin/chat", {
        method: "POST",
        body: JSON.stringify({ message: " " }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Message is required")
  })
})
```

- [ ] **Step 7: Run twin tests and verify pass**

Run:

```bash
npm test -- tests/lib/twin-retrieval.test.ts tests/app/twin-chat-route.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit Task 4**

Run:

```bash
git add lib/twin app/api/twin tests/lib/twin-retrieval.test.ts tests/app/twin-chat-route.test.ts
git commit -m "feat: add digital twin chat api"
```

Expected: commit created.

---

### Task 5: Life Universe Homepage

**Files:**
- Modify: `components/site/home-page-view.tsx`
- Modify: `app/(site)/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/home-page-view.test.tsx`

- [ ] **Step 1: Update homepage test expectations**

In `tests/components/home-page-view.test.tsx`, replace the first test body with expectations for the life universe:

```ts
  it("renders a life universe canvas and digital twin panel", () => {
    const { container } = render(<HomePageView {...buildProps()} />)

    expect(screen.getByRole("heading", { name: "人生宇宙" })).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Life universe canvas" })
    ).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: "Digital twin" })).toHaveTextContent(
      "Fixture Twin"
    )
    expect(screen.getByRole("button", { name: "聚焦 Work" })).toBeInTheDocument()
    expect(screen.getByText("Direct engineering style")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "发送给数字分身" })).toBeInTheDocument()
    expect(container.querySelector('[data-universe-lines="true"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })
```

Replace the empty-state test with:

```ts
  it("renders life universe empty states when planets and memories are empty", () => {
    render(
      <HomePageView
        {...buildProps({
          planets: [],
          memories: [],
        })}
      />
    )

    expect(screen.getByText("No planets in this universe yet")).toBeInTheDocument()
    expect(screen.getByText("No public memories attached yet")).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run homepage test and verify failure**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
```

Expected: FAIL because the current component still renders the old knowledge canvas.

- [ ] **Step 3: Replace homepage component with life-universe implementation**

Replace `components/site/home-page-view.tsx` with a client component that keeps the existing pan/zoom mechanics and changes the domain model. The implementation must:

- Accept `planets`, `memories`, and `twinIdentity`.
- Render heading `人生宇宙`.
- Render desktop region `aria-label="Life universe canvas"`.
- Render planet buttons with `aria-label="聚焦 ${planet.name}"`.
- Render right panel `aria-label="Digital twin"`.
- Use `fetch("/api/twin/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, focusedPlanetId }) })` for chat submission.
- Show referenced memories returned by the API.
- Keep the old essay/project/note props only for linked content counts, so existing route tests can pass while content migration stays incremental.

Use these type additions at the top:

```ts
import {
  Bot,
  Focus,
  Home,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
} from "lucide-react"
import { FormEvent, useMemo, useState } from "react"
import type { StoredMemory, StoredPlanet, StoredTwinIdentity } from "@/lib/content"
import type { TwinChatResponse } from "@/lib/twin/types"
```

The component prop type must include:

```ts
  planets: ReadonlyArray<StoredPlanet>
  memories: ReadonlyArray<StoredMemory>
  twinIdentity: StoredTwinIdentity
```

When implementing, keep all visible labels from the test exactly:

- `人生宇宙`
- `Life universe canvas`
- `Digital twin`
- `发送给数字分身`
- `No planets in this universe yet`
- `No public memories attached yet`

- [ ] **Step 4: Add CSS utilities**

In `app/globals.css`, add these component utilities inside `@layer components`:

```css
  .life-universe-grid {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      radial-gradient(rgba(45, 212, 191, 0.18) 1px, transparent 1px);
    background-size:
      56px 56px,
      56px 56px,
      9px 9px;
    mask-image: radial-gradient(circle at center, black 0%, black 64%, transparent 96%);
  }

  .life-universe-vignette {
    background:
      radial-gradient(circle at 24% 20%, rgba(45, 212, 191, 0.13), transparent 28%),
      radial-gradient(circle at 72% 28%, rgba(167, 139, 250, 0.12), transparent 26%),
      radial-gradient(circle at 80% 78%, rgba(148, 163, 184, 0.1), transparent 24%),
      linear-gradient(180deg, rgba(3, 7, 18, 0.12), rgba(3, 7, 18, 0.96));
  }

  .life-universe-glass {
    @apply border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-xl;
  }
```

- [ ] **Step 5: Run homepage test and typecheck**

Run:

```bash
npm test -- tests/components/home-page-view.test.tsx
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 6: Commit Tasks 3 and 5 together**

Run:

```bash
git add lib/content.ts app/'(site)'/page.tsx components/site/home-page-view.tsx app/globals.css tests/components/home-page-view.test.tsx
git commit -m "feat: build life universe homepage"
```

Expected: commit created.

---

### Task 6: Final Verification And Polish

**Files:**
- Review: all changed files from Tasks 1-5.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 2: Start the local dev server**

Run:

```bash
npm run dev
```

Expected: Next dev server starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 3: Manual browser checks**

Open the local URL and verify:

- Homepage loads the dark life-universe canvas.
- Planets are visible and can be focused.
- Right-side digital twin panel appears.
- Sending a chat message returns fallback mode when `OPENAI_API_KEY` and `OPENAI_MODEL` are unset.
- Admin pages `/admin/planets`, `/admin/memories`, and `/admin/twin` render after login.
- Existing `/essays`, `/projects`, `/notes`, `/about`, `/rss.xml`, and `/sitemap.xml` still work.

- [ ] **Step 4: Stop the dev server**

Stop the server with `Ctrl-C`.

Expected: no long-running dev server remains.

- [ ] **Step 5: Commit final fixes if any verification changes were needed**

If Step 1 or Step 3 required code changes, run the relevant focused tests again and commit:

```bash
git add .
git commit -m "fix: polish digital twin life universe"
```

Expected: commit created only if additional fixes were made.

---

## Self-Review

- Spec coverage: data model, admin management, public homepage, chat retrieval, real model integration, fallback behavior, visibility boundaries, and existing content preservation are covered by Tasks 1-6.
- Red-flag scan: no task contains deferred implementation steps.
- Type consistency: shared types flow from `lib/cms/schema.ts` through `lib/content.ts`, `lib/twin/*`, the API route, and `HomePageView`.
- Scope control: vector search, WebGL shaders, external imports, multi-user permissions, and long-term chat learning are not part of this implementation plan.
