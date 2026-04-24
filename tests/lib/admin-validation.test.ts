import {
  parseEssayFormData,
  parseNoteFormData,
  parseProjectFormData,
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
})
