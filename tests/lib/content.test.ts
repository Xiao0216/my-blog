import {
  getAllNotes,
  getEssaySummaries,
  getFeaturedNotes,
  getProfile,
  getProjects,
} from "@/lib/content"
import { describe, expect, it } from "vitest"

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false
type Assert<T extends true> = T

type EssaySlug = ReturnType<typeof getEssaySummaries>[number]["slug"]
type NoteSlug = ReturnType<typeof getAllNotes>[number]["slug"]
type ProjectSlug = ReturnType<typeof getProjects>[number]["slug"]
type ProfileRoleLine = ReturnType<typeof getProfile>["roleLine"]

type _EssaySlugIsString = Assert<Equal<EssaySlug, string>>
type _NoteSlugIsString = Assert<Equal<NoteSlug, string>>
type _ProjectSlugIsString = Assert<Equal<ProjectSlug, string>>
type _ProfileRoleLineIsString = Assert<Equal<ProfileRoleLine, string>>

describe("content helpers", () => {
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
})
