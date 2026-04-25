import { readFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { DatabaseSync } from "node:sqlite"

import { essaySummaries } from "@/data/essays"
import type { EssaySummary } from "@/data/essays"
import { notes } from "@/data/notes"
import type { NoteEntry } from "@/data/notes"
import { projects } from "@/data/projects"
import type { ProjectEntry } from "@/data/projects"
import { profile, siteConfig } from "@/data/site"
import type { ProfileData } from "@/data/site"
import { LIFE_UNIVERSE_GALAXIES } from "@/lib/life-universe/taxonomy"
import {
  type EssayInput,
  type MemoryInput,
  type NoteInput,
  type PlanetInput,
  type ProfileInput,
  type ProjectInput,
  type RecordProjectionStatus,
  type RecordTargetType,
  type StoredMemory,
  type StoredNote,
  type StoredPlanet,
  type StoredProfile,
  type StoredProject,
  type StoredRecord,
  type StoredEssay,
  type StoredTwinIdentity,
  type TwinIdentityInput,
  parseStatus,
  parseStringArray,
  stringifyArray,
} from "@/lib/cms/schema"

type SqlValue = string | number | null

type EssayRow = {
  slug: string
  title: string
  description: string
  content: string
  published_at: string
  reading_time: string
  tags_json: string
  status: string
}

type ProjectRow = {
  slug: string
  title: string
  description: string
  note: string
  stack_json: string
  href: string
  sort_order: number
  status: string
}

type NoteRow = {
  slug: string
  title: string
  body: string
  published_at: string
  status: string
}

type ProfileRow = {
  name: string
  role_line: string
  email: string
  hero_title: string
  hero_intro: string
  about_summary: string
  long_bio_json: string
  skills_json: string
  certifications_json: string
  updated_at: string
}

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

const initializedDatabasePaths = new Set<string>()

function getDatabasePath(): string {
  return (
    process.env.BLOG_DATABASE_PATH ?? join(process.cwd(), "data/blog.sqlite")
  )
}

function openDatabase(): DatabaseSync {
  const databasePath = getDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })
  const database = new DatabaseSync(databasePath)
  database.exec(
    "PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;"
  )
  return database
}

function withDatabase<T>(callback: (database: DatabaseSync) => T): T {
  const database = openDatabase()

  try {
    return callback(database)
  } finally {
    database.close()
  }
}

function nowText(): string {
  return new Date().toISOString()
}

function run(
  database: DatabaseSync,
  sql: string,
  values: ReadonlyArray<SqlValue> = []
) {
  database.prepare(sql).run(...values)
}

function createTables(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      role_line TEXT NOT NULL,
      email TEXT NOT NULL,
      hero_title TEXT NOT NULL,
      hero_intro TEXT NOT NULL,
      about_summary TEXT NOT NULL,
      long_bio_json TEXT NOT NULL,
      skills_json TEXT NOT NULL DEFAULT '[]',
      certifications_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS essays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT NOT NULL,
      published_at TEXT NOT NULL,
      reading_time TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      note TEXT NOT NULL,
      stack_json TEXT NOT NULL,
      href TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      published_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

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
      updated_at TEXT NOT NULL,
      UNIQUE(planet_id, title, source)
    );

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
  `)
}

function readSeedEssayContent(slug: string): string {
  try {
    return readFileSync(
      join(process.cwd(), "content/essays", `${slug}.mdx`),
      "utf8"
    )
  } catch {
    return (
      essaySummaries.find((essay) => essay.slug === slug)?.description ?? ""
    )
  }
}

function seedProfile(database: DatabaseSync) {
  run(
    database,
    `INSERT OR IGNORE INTO profile (
      id, name, role_line, email, hero_title, hero_intro, about_summary,
      long_bio_json, skills_json, certifications_json, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.name,
      profile.roleLine,
      siteConfig.email,
      profile.heroTitle,
      profile.heroIntro,
      profile.aboutSummary,
      stringifyArray(profile.longBio),
      stringifyArray([]),
      stringifyArray([]),
      nowText(),
    ]
  )
}

function seedEssays(database: DatabaseSync) {
  const statement = database.prepare(`
    INSERT OR IGNORE INTO essays (
      slug, title, description, content, published_at, reading_time, tags_json,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
  `)

  for (const essay of essaySummaries) {
    const timestamp = nowText()
    statement.run(
      essay.slug,
      essay.title,
      essay.description,
      readSeedEssayContent(essay.slug),
      essay.publishedAt,
      essay.readingTime,
      stringifyArray(essay.tags),
      timestamp,
      timestamp
    )
  }
}

function seedProjects(database: DatabaseSync) {
  const statement = database.prepare(`
    INSERT OR IGNORE INTO projects (
      slug, title, description, note, stack_json, href, sort_order, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
  `)

  projects.forEach((project, index) => {
    const timestamp = nowText()
    statement.run(
      project.slug,
      project.title,
      project.description,
      project.note,
      stringifyArray(project.stack),
      project.href,
      index,
      timestamp,
      timestamp
    )
  })
}

function seedNotes(database: DatabaseSync) {
  const statement = database.prepare(`
    INSERT OR IGNORE INTO notes (
      slug, title, body, published_at, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'published', ?, ?)
  `)

  for (const note of notes) {
    const timestamp = nowText()
    statement.run(
      note.slug,
      note.title,
      note.body,
      note.publishedAt,
      timestamp,
      timestamp
    )
  }
}

const lifeUniverseSeedPlanets: ReadonlyArray<PlanetInput> =
  LIFE_UNIVERSE_GALAXIES.map((galaxy) => ({
    slug: galaxy.slug,
    name: galaxy.name,
    summary: galaxy.summary,
    description: galaxy.description,
    x: galaxy.x,
    y: galaxy.y,
    size: galaxy.size,
    theme: galaxy.theme,
    status: "published",
    sortOrder: galaxy.sortOrder,
    weight: galaxy.weight,
  }))

const legacySeedPlanets: Record<string, PlanetInput> = {
  diary: {
    slug: "diary",
    name: "Diary",
    summary: "Short reflections and personal state over time.",
    description:
      "The diary planet keeps small, timestamped fragments that explain mood, context, and change.",
    x: 420,
    y: 170,
    size: "medium",
    theme: "violet",
    status: "published",
    sortOrder: 3,
    weight: 6,
  },
  health: {
    slug: "health",
    name: "Health",
    summary: "Energy, habits, body signals, and sustainable pace.",
    description:
      "The health planet tracks routines and constraints that affect long-term output.",
    x: -500,
    y: -160,
    size: "medium",
    theme: "emerald",
    status: "published",
    sortOrder: 5,
    weight: 5,
  },
  life: {
    slug: "life",
    name: "Life",
    summary: "Daily rhythm, relationships with the world, and lived texture.",
    description:
      "The life planet records ordinary days, choices, observations, and non-work context.",
    x: -260,
    y: 120,
    size: "large",
    theme: "teal",
    status: "published",
    sortOrder: 1,
    weight: 8,
  },
  technology: {
    slug: "technology",
    name: "Technology",
    summary: "Front-end systems, performance, AI, and product engineering.",
    description:
      "The technology planet connects articles, experiments, and engineering opinions.",
    x: -40,
    y: 320,
    size: "large",
    theme: "blue",
    status: "published",
    sortOrder: 4,
    weight: 8,
  },
  work: {
    slug: "work",
    name: "Work",
    summary: "Delivery habits, collaboration, and engineering judgment.",
    description:
      "The work planet captures how projects are understood, built, shipped, and maintained.",
    x: 160,
    y: -140,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 2,
    weight: 9,
  },
}

function updateLegacySeedPlanet(
  database: DatabaseSync,
  planet: PlanetInput,
  timestamp: string
) {
  const legacyPlanet = legacySeedPlanets[planet.slug]

  if (!legacyPlanet) {
    return
  }

  run(
    database,
    `UPDATE planets
     SET name = ?, summary = ?, description = ?, x = ?, y = ?, size = ?,
         theme = ?, status = ?, sort_order = ?, weight = ?, updated_at = ?
     WHERE slug = ? AND name = ? AND summary = ? AND description = ? AND x = ? AND y = ?
       AND size = ? AND theme = ? AND status = ? AND sort_order = ? AND weight = ?`,
    [
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
      planet.slug,
      legacyPlanet.name,
      legacyPlanet.summary,
      legacyPlanet.description,
      legacyPlanet.x,
      legacyPlanet.y,
      legacyPlanet.size,
      legacyPlanet.theme,
      legacyPlanet.status,
      legacyPlanet.sortOrder,
      legacyPlanet.weight,
    ]
  )
}

function retireLegacyHealthSeedPlanet(
  database: DatabaseSync,
  timestamp: string
) {
  const legacyPlanet = legacySeedPlanets.health

  run(
    database,
    `UPDATE planets
     SET status = 'draft', updated_at = ?
     WHERE slug = ? AND name = ? AND summary = ? AND description = ? AND x = ? AND y = ?
       AND size = ? AND theme = ? AND status = ? AND sort_order = ? AND weight = ?
       AND NOT EXISTS (
         SELECT 1 FROM memories WHERE memories.planet_id = planets.id
       )`,
    [
      timestamp,
      legacyPlanet.slug,
      legacyPlanet.name,
      legacyPlanet.summary,
      legacyPlanet.description,
      legacyPlanet.x,
      legacyPlanet.y,
      legacyPlanet.size,
      legacyPlanet.theme,
      legacyPlanet.status,
      legacyPlanet.sortOrder,
      legacyPlanet.weight,
    ]
  )
}

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

function seedLifeUniverse(database: DatabaseSync) {
  const timestamp = nowText()
  seedDefaultCapturePlanet(database, timestamp)
  const planetStatement = database.prepare(`
    INSERT OR IGNORE INTO planets (
      slug, name, summary, description, x, y, size, theme, status,
      sort_order, weight, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const planet of lifeUniverseSeedPlanets) {
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

  for (const planet of lifeUniverseSeedPlanets) {
    updateLegacySeedPlanet(database, planet, timestamp)
  }

  retireLegacyHealthSeedPlanet(database, timestamp)

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
      stringifyArray([
        "Clarity",
        "Pragmatism",
        "Maintainability",
        "Long-term thinking",
      ]),
      stringifyArray([
        "Be direct",
        "Use concise answers",
        "Reference relevant memories",
      ]),
      stringifyArray([
        "Do not expose private memories",
        "Do not invent personal facts",
      ]),
      stringifyArray(["State uncertainty when memory support is weak"]),
      timestamp,
    ]
  )
}

function seedDatabase(database: DatabaseSync) {
  seedProfile(database)
  seedEssays(database)
  seedProjects(database)
  seedNotes(database)
  seedLifeUniverse(database)
}

function mapEssayRow(row: EssayRow): StoredEssay {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    publishedAt: row.published_at,
    readingTime: row.reading_time,
    tags: parseStringArray(row.tags_json),
    status: parseStatus(row.status),
  }
}

function mapProjectRow(row: ProjectRow): StoredProject {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    note: row.note,
    stack: parseStringArray(row.stack_json),
    href: row.href,
    sortOrder: row.sort_order,
    status: parseStatus(row.status),
  }
}

function mapNoteRow(row: NoteRow): StoredNote {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    publishedAt: row.published_at,
    status: parseStatus(row.status),
  }
}

function mapProfileRow(row: ProfileRow): StoredProfile {
  return {
    name: row.name,
    roleLine: row.role_line,
    email: row.email,
    heroTitle: row.hero_title,
    heroIntro: row.hero_intro,
    aboutSummary: row.about_summary,
    longBio: parseStringArray(row.long_bio_json),
    skills: parseStringArray(row.skills_json),
    certifications: parseStringArray(row.certifications_json),
  }
}

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

function mapRecordRow(row: RecordRow): StoredRecord {
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
      row.visibility === null ? null : (row.visibility as StoredRecord["visibility"]),
    status: row.status === null ? null : parseStatus(row.status),
    confidence: row.confidence,
    aiReasoning: row.ai_reasoning,
    projectionStatus: row.projection_status as RecordProjectionStatus,
    projectionTable: row.projection_table,
    projectionId: row.projection_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
  firstPersonStyle:
    "Use first person for public, well-supported facts and explain reasoning directly.",
  thirdPersonStyle:
    "Use proxy wording when the answer is uncertain, private, or commitment-heavy.",
  values: ["Clarity", "Pragmatism", "Maintainability", "Long-term thinking"],
  communicationRules: [
    "Be direct",
    "Use concise answers",
    "Reference relevant memories",
  ],
  privacyRules: [
    "Do not expose private memories",
    "Do not invent personal facts",
  ],
  uncertaintyRules: ["State uncertainty when memory support is weak"],
}

export function initializeCmsDatabase() {
  const databasePath = getDatabasePath()

  if (initializedDatabasePaths.has(databasePath)) {
    return
  }

  withDatabase((database) => {
    createTables(database)
    seedDatabase(database)
  })
  initializedDatabasePaths.add(databasePath)
}

export function getPublicProfile(): ProfileData {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const row = database.prepare("SELECT * FROM profile WHERE id = 1").get() as
      | ProfileRow
      | undefined

    return row ? mapProfileRow(row) : profile
  })
}

export function getPublicEssays(): ReadonlyArray<EssaySummary> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT * FROM essays
         WHERE status = 'published'
         ORDER BY published_at DESC, id DESC`
      )
      .all() as EssayRow[]

    return rows.map((row) => {
      const essay = mapEssayRow(row)

      return {
        slug: essay.slug,
        title: essay.title,
        description: essay.description,
        publishedAt: essay.publishedAt,
        readingTime: essay.readingTime,
        tags: essay.tags,
      }
    })
  })
}

export function getAllEssaySlugs(): ReadonlyArray<string> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        "SELECT slug FROM essays WHERE status = 'published' ORDER BY published_at DESC, id DESC"
      )
      .all() as Array<{ slug: string }>

    return rows.map((row) => row.slug)
  })
}

export function getEssayBySlug(slug: string): StoredEssay | null {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const row = database
      .prepare("SELECT * FROM essays WHERE slug = ? AND status = 'published'")
      .get(slug) as EssayRow | undefined

    return row ? mapEssayRow(row) : null
  })
}

export function getPublicProjects(): ReadonlyArray<ProjectEntry> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT * FROM projects
         WHERE status = 'published'
         ORDER BY sort_order ASC, id ASC`
      )
      .all() as ProjectRow[]

    return rows.map((row) => {
      const project = mapProjectRow(row)

      return {
        slug: project.slug,
        title: project.title,
        description: project.description,
        note: project.note,
        stack: project.stack,
        href: project.href,
      }
    })
  })
}

export function getPublicNotes(): ReadonlyArray<NoteEntry> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare(
        `SELECT * FROM notes
         WHERE status = 'published'
         ORDER BY published_at DESC, id DESC`
      )
      .all() as NoteRow[]

    return rows.map((row) => {
      const note = mapNoteRow(row)

      return {
        slug: note.slug,
        title: note.title,
        body: note.body,
        publishedAt: note.publishedAt,
      }
    })
  })
}

export function getAdminProfile(): StoredProfile {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const row = database.prepare("SELECT * FROM profile WHERE id = 1").get() as
      | ProfileRow
      | undefined

    return row
      ? mapProfileRow(row)
      : { ...profile, email: siteConfig.email, skills: [], certifications: [] }
  })
}

export function getAdminEssays(): ReadonlyArray<StoredEssay> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare("SELECT * FROM essays ORDER BY published_at DESC, id DESC")
      .all() as EssayRow[]

    return rows.map(mapEssayRow)
  })
}

export function getAdminProjects(): ReadonlyArray<StoredProject> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare("SELECT * FROM projects ORDER BY sort_order ASC, id ASC")
      .all() as ProjectRow[]

    return rows.map(mapProjectRow)
  })
}

export function getAdminNotes(): ReadonlyArray<StoredNote> {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const rows = database
      .prepare("SELECT * FROM notes ORDER BY published_at DESC, id DESC")
      .all() as NoteRow[]

    return rows.map(mapNoteRow)
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

export function getAdminContentSummary(): AdminContentSummary {
  const essays = getAdminEssays()
  const projects = getAdminProjects()
  const notes = getAdminNotes()
  const planets = getAdminPlanets()
  const memories = getAdminMemories()

  return {
    publishedEssays: essays.filter((essay) => essay.status === "published")
      .length,
    draftEssays: essays.filter((essay) => essay.status === "draft").length,
    publishedProjects: projects.filter(
      (project) => project.status === "published"
    ).length,
    draftProjects: projects.filter((project) => project.status === "draft")
      .length,
    publishedNotes: notes.filter((note) => note.status === "published").length,
    draftNotes: notes.filter((note) => note.status === "draft").length,
    publishedPlanets: planets.filter((planet) => planet.status === "published")
      .length,
    draftPlanets: planets.filter((planet) => planet.status === "draft").length,
    publicMemories: memories.filter((memory) => memory.visibility === "public")
      .length,
    assistantMemories: memories.filter(
      (memory) => memory.visibility === "assistant"
    ).length,
    privateMemories: memories.filter(
      (memory) => memory.visibility === "private"
    ).length,
  }
}

export function saveProfile(input: ProfileInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    run(
      database,
      `UPDATE profile SET
        name = ?,
        role_line = ?,
        email = ?,
        hero_title = ?,
        hero_intro = ?,
        about_summary = ?,
        long_bio_json = ?,
        skills_json = ?,
        certifications_json = ?,
        updated_at = ?
      WHERE id = 1`,
      [
        input.name,
        input.roleLine,
        input.email,
        input.heroTitle,
        input.heroIntro,
        input.aboutSummary,
        stringifyArray(input.longBio),
        stringifyArray(input.skills),
        stringifyArray(input.certifications),
        nowText(),
      ]
    )
  })
}

export function saveEssay(input: EssayInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    const timestamp = nowText()

    run(
      database,
      `INSERT INTO essays (
        slug, title, description, content, published_at, reading_time,
        tags_json, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        content = excluded.content,
        published_at = excluded.published_at,
        reading_time = excluded.reading_time,
        tags_json = excluded.tags_json,
        status = excluded.status,
        updated_at = excluded.updated_at`,
      [
        input.slug,
        input.title,
        input.description,
        input.content,
        input.publishedAt,
        input.readingTime,
        stringifyArray(input.tags),
        input.status,
        timestamp,
        timestamp,
      ]
    )
  })
}

export function saveProject(input: ProjectInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    const timestamp = nowText()

    run(
      database,
      `INSERT INTO projects (
        slug, title, description, note, stack_json, href, sort_order, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        note = excluded.note,
        stack_json = excluded.stack_json,
        href = excluded.href,
        sort_order = excluded.sort_order,
        status = excluded.status,
        updated_at = excluded.updated_at`,
      [
        input.slug,
        input.title,
        input.description,
        input.note,
        stringifyArray(input.stack),
        input.href,
        input.sortOrder,
        input.status,
        timestamp,
        timestamp,
      ]
    )
  })
}

export function saveNote(input: NoteInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    const timestamp = nowText()

    run(
      database,
      `INSERT INTO notes (
        slug, title, body, published_at, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        published_at = excluded.published_at,
        status = excluded.status,
        updated_at = excluded.updated_at`,
      [
        input.slug,
        input.title,
        input.body,
        input.publishedAt,
        input.status,
        timestamp,
        timestamp,
      ]
    )
  })
}

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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(planet_id, title, source) DO UPDATE SET
        content = excluded.content,
        type = excluded.type,
        occurred_at = excluded.occurred_at,
        visibility = excluded.visibility,
        importance = excluded.importance,
        tags_json = excluded.tags_json,
        updated_at = excluded.updated_at`,
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

export function saveMemoryById(id: number, input: MemoryInput) {
  initializeCmsDatabase()

  withDatabase((database) => {
    run(
      database,
      `UPDATE memories SET
        planet_id = ?,
        title = ?,
        content = ?,
        type = ?,
        occurred_at = ?,
        visibility = ?,
        importance = ?,
        tags_json = ?,
        source = ?,
        updated_at = ?
      WHERE id = ?`,
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
        nowText(),
        id,
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

export function deleteEssay(slug: string) {
  deleteBySlug("essays", slug)
}

export function deleteProject(slug: string) {
  deleteBySlug("projects", slug)
}

export function deleteNote(slug: string) {
  deleteBySlug("notes", slug)
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

export function toggleEssayStatus(slug: string) {
  toggleStatus("essays", slug)
}

export function toggleProjectStatus(slug: string) {
  toggleStatus("projects", slug)
}

export function toggleNoteStatus(slug: string) {
  toggleStatus("notes", slug)
}

export function togglePlanetStatus(slug: string) {
  toggleStatus("planets", slug)
}

function deleteBySlug(
  table: "essays" | "projects" | "notes" | "planets",
  slug: string
) {
  initializeCmsDatabase()

  withDatabase((database) => {
    run(database, `DELETE FROM ${table} WHERE slug = ?`, [slug])
  })
}

function toggleStatus(
  table: "essays" | "projects" | "notes" | "planets",
  slug: string
) {
  initializeCmsDatabase()

  withDatabase((database) => {
    run(
      database,
      `UPDATE ${table}
       SET status = CASE status WHEN 'published' THEN 'draft' ELSE 'published' END,
           updated_at = ?
       WHERE slug = ?`,
      [nowText(), slug]
    )
  })
}
