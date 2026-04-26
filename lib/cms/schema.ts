import type { EssaySummary } from "@/data/essays"
import type { NoteEntry } from "@/data/notes"
import type { ProjectEntry } from "@/data/projects"
import type { ProfileData } from "@/data/site"

export type ContentStatus = "published" | "draft"
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

export type PlanetInput = Omit<StoredPlanet, "id">
export type MemoryInput = Omit<
  StoredMemory,
  "id" | "planetSlug" | "planetName"
>
export type TwinIdentityInput = StoredTwinIdentity

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
    errors.slug = "地址别名只能使用小写字母、数字和连字符"
  }

  if (status !== "published" && status !== "draft") {
    errors.status = "状态只能是已发布或草稿"
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
    errors.size = "尺寸只能是小、中或大"
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

  const planetSize = size as PlanetSize

  return {
    ok: true,
    value: {
      slug,
      name,
      summary,
      description,
      x,
      y,
      size: planetSize,
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
  const source = formText(formData, "source") || "手动"
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

  const memoryType = type as MemoryType
  const memoryVisibility = visibility as MemoryVisibility

  return {
    ok: true,
    value: {
      planetId,
      title,
      content,
      type: memoryType,
      occurredAt,
      visibility: memoryVisibility,
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
