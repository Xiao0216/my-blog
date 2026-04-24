import type { EssaySummary } from "@/data/essays"
import type { NoteEntry } from "@/data/notes"
import type { ProjectEntry } from "@/data/projects"
import type { ProfileData } from "@/data/site"

export type ContentStatus = "published" | "draft"

export type StoredProfile = ProfileData & {
  readonly email: string
  readonly skills: ReadonlyArray<string>
  readonly certifications: ReadonlyArray<string>
}

export type StoredEssay = EssaySummary & {
  readonly content: string
  readonly status: ContentStatus
}

export type StoredProject = ProjectEntry & {
  readonly sortOrder: number
  readonly status: ContentStatus
}

export type StoredNote = NoteEntry & {
  readonly status: ContentStatus
}

export type EssayInput = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly content: string
  readonly publishedAt: string
  readonly readingTime: string
  readonly tags: ReadonlyArray<string>
  readonly status: ContentStatus
}

export type ProjectInput = {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly note: string
  readonly stack: ReadonlyArray<string>
  readonly href: string
  readonly sortOrder: number
  readonly status: ContentStatus
}

export type NoteInput = {
  readonly slug: string
  readonly title: string
  readonly body: string
  readonly publishedAt: string
  readonly status: ContentStatus
}

export type ProfileInput = {
  readonly name: string
  readonly roleLine: string
  readonly email: string
  readonly heroTitle: string
  readonly heroIntro: string
  readonly aboutSummary: string
  readonly longBio: ReadonlyArray<string>
  readonly skills: ReadonlyArray<string>
  readonly certifications: ReadonlyArray<string>
}

type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: Record<string, string> }

export function stringifyArray(values: ReadonlyArray<string>): string {
  return JSON.stringify([...values])
}

export function parseStringArray(value: unknown): ReadonlyArray<string> {
  if (typeof value !== "string") {
    return []
  }

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export function parseStatus(value: unknown): ContentStatus {
  return value === "draft" ? "draft" : "published"
}

function formText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseCommaList(value: string): ReadonlyArray<string> {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseLineList(value: string): ReadonlyArray<string> {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function isSafeSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

function isValidDateText(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

function validateRequired(
  errors: Record<string, string>,
  values: Record<string, string>
) {
  for (const [key, value] of Object.entries(values)) {
    if (!value) {
      errors[key] = key === "body" || key === "content" ? "内容不能为空" : "标题不能为空"
    }
  }
}

function validateCommonContentFields(
  errors: Record<string, string>,
  slug: string,
  status: string,
  publishedAt?: string
) {
  if (!isSafeSlug(slug)) {
    errors.slug = "Slug 只能使用小写字母、数字和连字符"
  }

  if (status !== "published" && status !== "draft") {
    errors.status = "状态只能是 published 或 draft"
  }

  if (publishedAt !== undefined && !isValidDateText(publishedAt)) {
    errors.publishedAt = "请输入有效日期"
  }
}

export function parseEssayFormData(formData: FormData): ValidationResult<EssayInput> {
  const slug = formText(formData, "slug")
  const title = formText(formData, "title")
  const description = formText(formData, "description")
  const content = formText(formData, "content")
  const publishedAt = formText(formData, "publishedAt")
  const readingTime = formText(formData, "readingTime")
  const status = formText(formData, "status")
  const errors: Record<string, string> = {}

  validateRequired(errors, { title, description, content, readingTime })
  validateCommonContentFields(errors, slug, status, publishedAt)

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      slug,
      title,
      description,
      content,
      publishedAt,
      readingTime,
      tags: parseCommaList(formText(formData, "tags")),
      status: status as ContentStatus,
    },
  }
}

export function parseProjectFormData(
  formData: FormData
): ValidationResult<ProjectInput> {
  const slug = formText(formData, "slug")
  const title = formText(formData, "title")
  const description = formText(formData, "description")
  const note = formText(formData, "note")
  const href = formText(formData, "href") || "/projects"
  const status = formText(formData, "status")
  const sortOrderText = formText(formData, "sortOrder")
  const sortOrder = Number.parseInt(sortOrderText || "0", 10)
  const errors: Record<string, string> = {}

  validateRequired(errors, { title, description, note })
  validateCommonContentFields(errors, slug, status)

  if (!Number.isFinite(sortOrder)) {
    errors.sortOrder = "排序必须是数字"
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      slug,
      title,
      description,
      note,
      stack: parseCommaList(formText(formData, "stack")),
      href,
      sortOrder,
      status: status as ContentStatus,
    },
  }
}

export function parseNoteFormData(formData: FormData): ValidationResult<NoteInput> {
  const slug = formText(formData, "slug")
  const title = formText(formData, "title")
  const body = formText(formData, "body")
  const publishedAt = formText(formData, "publishedAt")
  const status = formText(formData, "status")
  const errors: Record<string, string> = {}

  validateRequired(errors, { title, body })
  validateCommonContentFields(errors, slug, status, publishedAt)

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      slug,
      title,
      body,
      publishedAt,
      status: status as ContentStatus,
    },
  }
}

export function parseProfileFormData(
  formData: FormData
): ValidationResult<ProfileInput> {
  const name = formText(formData, "name")
  const roleLine = formText(formData, "roleLine")
  const email = formText(formData, "email")
  const heroTitle = formText(formData, "heroTitle")
  const heroIntro = formText(formData, "heroIntro")
  const aboutSummary = formText(formData, "aboutSummary")
  const errors: Record<string, string> = {}

  validateRequired(errors, { name, roleLine, heroTitle, heroIntro, aboutSummary })

  if (!email.includes("@")) {
    errors.email = "请输入有效邮箱"
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      name,
      roleLine,
      email,
      heroTitle,
      heroIntro,
      aboutSummary,
      longBio: parseLineList(formText(formData, "longBio")),
      skills: parseLineList(formText(formData, "skills")),
      certifications: parseLineList(formText(formData, "certifications")),
    },
  }
}
