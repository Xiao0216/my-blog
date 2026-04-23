import {
  getEssaySummaries,
  getFeaturedNotes,
  getProfile,
  getProjects,
} from "@/lib/content"

describe("content helpers", () => {
  it("sorts essays from newest to oldest", () => {
    const essays = getEssaySummaries()

    expect(essays.map((essay) => essay.slug)).toEqual([
      "making-space-for-thought",
      "quiet-loops-at-night",
    ])
  })

  it("returns only the requested number of featured notes", () => {
    const notes = getFeaturedNotes(2)

    expect(notes).toHaveLength(2)
    expect(notes[0].slug).toBe("the-window-seat")
  })

  it("exposes the approved identity line and projects", () => {
    const profile = getProfile()
    const projects = getProjects()

    expect(profile.roleLine).toBe("开发者 / 写作者 / 观察生活的人")
    expect(projects[0].slug).toBe("rain-map")
  })
})
