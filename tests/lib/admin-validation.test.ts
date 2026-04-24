import {
  parseEssayFormData,
  parseMemoryFormData,
  parseNoteFormData,
  parsePlanetFormData,
  parseProjectFormData,
  parseTwinIdentityFormData,
} from "@/lib/cms/schema"
import { describe, expect, it } from "vitest"

function form(values: Record<string, string>): FormData {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("admin validation", () => {
  it("parses a valid essay form", () => {
    const result = parseEssayFormData(
      form({
        slug: "valid-essay",
        title: "Valid Essay",
        description: "Description",
        content: "# Content",
        publishedAt: "2026-04-24",
        readingTime: "3 min read",
        tags: "Vue, Performance",
        status: "published",
      })
    )

    expect(result).toEqual({
      ok: true,
      value: {
        slug: "valid-essay",
        title: "Valid Essay",
        description: "Description",
        content: "# Content",
        publishedAt: "2026-04-24",
        readingTime: "3 min read",
        tags: ["Vue", "Performance"],
        status: "published",
      },
    })
  })

  it("rejects invalid slugs, missing titles, invalid dates, and invalid status", () => {
    const result = parseEssayFormData(
      form({
        slug: "Invalid Slug",
        title: " ",
        description: "Description",
        content: "# Content",
        publishedAt: "bad-date",
        readingTime: "3 min read",
        tags: "Vue",
        status: "archived",
      })
    )

    expect(result).toEqual({
      ok: false,
      errors: {
        publishedAt: "请输入有效日期",
        slug: "Slug 只能使用小写字母、数字和连字符",
        status: "状态只能是 published 或 draft",
        title: "标题不能为空",
      },
    })
  })

  it("parses project stacks from comma-separated input", () => {
    const result = parseProjectFormData(
      form({
        slug: "valid-project",
        title: "Valid Project",
        description: "Description",
        note: "Note",
        stack: "Vue, Pinia, ECharts",
        href: "/projects",
        sortOrder: "3",
        status: "draft",
      })
    )

    expect(result).toMatchObject({
      ok: true,
      value: {
        stack: ["Vue", "Pinia", "ECharts"],
        sortOrder: 3,
        status: "draft",
      },
    })
  })

  it("validates required note fields", () => {
    const result = parseNoteFormData(
      form({
        slug: "valid-note",
        title: "",
        body: "",
        publishedAt: "2026-04-24",
        status: "published",
      })
    )

    expect(result).toEqual({
      ok: false,
      errors: {
        body: "内容不能为空",
        title: "标题不能为空",
      },
    })
  })

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
})
