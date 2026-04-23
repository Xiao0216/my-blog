import {
  getAllNotes,
  type EssaySummary,
  type NoteEntry,
  type ProfileData,
  type ProjectEntry,
  getEssaySummaries,
  getFeaturedNotes,
  getProfile,
  getProjects,
} from "@/lib/content"
import { describe, expect, expectTypeOf, it } from "vitest"

type Mutable<T> = {
  -readonly [Key in keyof T]: T[Key] extends ReadonlyArray<infer Item>
    ? Item[]
    : T[Key]
}

describe("content helpers", () => {
  it("uses stable string schemas for key public fields", () => {
    expectTypeOf<ReturnType<typeof getEssaySummaries>[number]["slug"]>().toEqualTypeOf<string>()
    expectTypeOf<ReturnType<typeof getAllNotes>[number]["slug"]>().toEqualTypeOf<string>()
    expectTypeOf<ReturnType<typeof getProjects>[number]["slug"]>().toEqualTypeOf<string>()
    expectTypeOf<ReturnType<typeof getProfile>["roleLine"]>().toEqualTypeOf<string>()
  })

  it("sorts essays from newest to oldest", () => {
    const essays = getEssaySummaries()

    expect(essays.length).toBeGreaterThan(0)

    for (let index = 1; index < essays.length; index += 1) {
      expect(essays[index - 1].publishedAt >= essays[index].publishedAt).toBe(
        true
      )
    }
  })

  it("returns featured notes as newest-first prefix of all notes", () => {
    const featured = getFeaturedNotes(2)
    const allNotes = getAllNotes()

    expect(featured).toHaveLength(2)
    expect(featured.map((note) => note.slug)).toEqual(
      allNotes.slice(0, 2).map((note) => note.slug)
    )
  })

  it("returns all notes sorted from newest to oldest", () => {
    const allNotes = getAllNotes()

    expect(allNotes.length).toBeGreaterThan(0)

    for (let index = 1; index < allNotes.length; index += 1) {
      expect(
        allNotes[index - 1].publishedAt >= allNotes[index].publishedAt
      ).toBe(true)
    }
  })

  it("exposes profile and project collections with stable runtime shape", () => {
    const profile = getProfile()
    const projects = getProjects()

    expect(profile.name.length).toBeGreaterThan(0)
    expect(profile.roleLine.length).toBeGreaterThan(0)

    expect(projects.length).toBeGreaterThan(0)
    expect(projects[0].slug.length).toBeGreaterThan(0)
    expect(projects[0].stack.length).toBeGreaterThan(0)
  })

  it("does not leak mutations across helper calls", () => {
    const essays = getEssaySummaries()
    const mutableEssay = essays[0] as Mutable<EssaySummary>
    mutableEssay.slug = "mutated-essay"
    mutableEssay.tags.push("mutated-tag")

    const notes = getAllNotes()
    const mutableNote = notes[0] as Mutable<NoteEntry>
    mutableNote.title = "mutated-note"

    const featured = getFeaturedNotes(1)
    const mutableFeatured = featured[0] as Mutable<NoteEntry>
    mutableFeatured.body = "mutated-body"

    const profile = getProfile()
    const mutableProfile = profile as Mutable<ProfileData>
    mutableProfile.roleLine = "mutated-role"
    mutableProfile.longBio.push("mutated-bio")

    const projects = getProjects()
    const mutableProject = projects[0] as Mutable<ProjectEntry>
    mutableProject.slug = "mutated-project"
    mutableProject.stack.push("mutated-stack")

    expect(getEssaySummaries()[0].slug).not.toBe("mutated-essay")
    expect(getEssaySummaries()[0].tags).not.toContain("mutated-tag")
    expect(getAllNotes()[0].title).not.toBe("mutated-note")
    expect(getFeaturedNotes(1)[0].body).not.toBe("mutated-body")
    expect(getProfile().roleLine).not.toBe("mutated-role")
    expect(getProfile().longBio).not.toContain("mutated-bio")
    expect(getProjects()[0].slug).not.toBe("mutated-project")
    expect(getProjects()[0].stack).not.toContain("mutated-stack")
  })
})
