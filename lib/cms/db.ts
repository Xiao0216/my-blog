import { readFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { DatabaseSync } from "node:sqlite"

import { essaySummaries } from "@/data/essays"
import { notes } from "@/data/notes"
import { projects } from "@/data/projects"
import { profile, siteConfig } from "@/data/site"
import type { EssaySummary, NoteEntry, ProjectEntry, ProfileData } from "@/lib/content"
import {
  type EssayInput,
  type NoteInput,
  type ProjectInput,
  type StoredEssay,
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
}

function getDatabasePath(): string {
  return process.env.BLOG_DATABASE_PATH ?? join(process.cwd(), "data/blog.sqlite")
}

function openDatabase(): DatabaseSync {
  const databasePath = getDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })
  return new DatabaseSync(databasePath)
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
  `)
}

function readSeedEssayContent(slug: string): string {
  try {
    return readFileSync(join(process.cwd(), "content/essays", `${slug}.mdx`), "utf8")
  } catch {
    return essaySummaries.find((essay) => essay.slug === slug)?.description ?? ""
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

function seedDatabase(database: DatabaseSync) {
  seedProfile(database)
  seedEssays(database)
  seedProjects(database)
  seedNotes(database)
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

function mapProjectRow(row: ProjectRow): ProjectEntry & { sortOrder: number; status: string } {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    note: row.note,
    stack: parseStringArray(row.stack_json),
    href: row.href,
    sortOrder: row.sort_order,
    status: row.status,
  }
}

function mapNoteRow(row: NoteRow): NoteEntry & { status: string } {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    publishedAt: row.published_at,
    status: row.status,
  }
}

function mapProfileRow(row: ProfileRow): ProfileData {
  return {
    name: row.name,
    roleLine: row.role_line,
    heroTitle: row.hero_title,
    heroIntro: row.hero_intro,
    aboutSummary: row.about_summary,
    longBio: parseStringArray(row.long_bio_json),
  }
}

export function initializeCmsDatabase() {
  withDatabase((database) => {
    createTables(database)
    seedDatabase(database)
  })
}

export function getPublicProfile(): ProfileData {
  initializeCmsDatabase()

  return withDatabase((database) => {
    const row = database
      .prepare("SELECT * FROM profile WHERE id = 1")
      .get() as ProfileRow | undefined

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
