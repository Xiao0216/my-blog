import type { EssaySummary } from "@/data/essays"
import type { NoteEntry } from "@/data/notes"
import type { ProjectEntry } from "@/data/projects"
import type { ProfileData } from "@/data/site"
import type {
  StoredMemory,
  StoredPlanet,
  StoredTwinIdentity,
} from "@/lib/cms/schema"
import {
  getLifeUniverseTaxonomy as getCanonicalLifeUniverseTaxonomy,
  type LifeUniverseTaxonomy,
} from "@/lib/life-universe/taxonomy"
import {
  getAllEssaySlugs as getDatabaseEssaySlugs,
  getAssistantMemories,
  getEssayBySlug,
  getPublicMemories,
  getPublicEssays,
  getPublicNotes,
  getPublicProfile,
  getPublicProjects,
  getTwinIdentity,
} from "@/lib/cms/db"

export type { EssaySummary, NoteEntry, ProjectEntry, ProfileData }
export type { StoredMemory, StoredPlanet, StoredTwinIdentity }
export type { LifeUniverseTaxonomy }
export type EssayDocument = {
  readonly meta: EssaySummary
  readonly content: string
}

function cloneProfileData(data: ProfileData): ProfileData {
  return {
    ...data,
    longBio: [...data.longBio],
  }
}

function cloneEssaySummary(essay: EssaySummary): EssaySummary {
  return {
    ...essay,
    tags: [...essay.tags],
  }
}

function cloneNoteEntry(note: NoteEntry): NoteEntry {
  return {
    ...note,
  }
}

function cloneProjectEntry(project: ProjectEntry): ProjectEntry {
  return {
    ...project,
    stack: [...project.stack],
  }
}

function clonePlanet(planet: StoredPlanet): StoredPlanet {
  return { ...planet }
}

const homepageSolarSystemPlanets: ReadonlyArray<StoredPlanet> = [
  {
    id: 100001,
    slug: "sun",
    name: "Sun",
    summary: "来自 threex.planets 的太阳贴图。",
    description: "首页宇宙中的太阳，用 threex.planets 的 Sun 资产渲染。",
    x: 0,
    y: 0,
    size: "large",
    theme: "cyan",
    status: "published",
    sortOrder: 1,
    weight: 10,
  },
  {
    id: 100002,
    slug: "mercury",
    name: "Mercury",
    summary: "来自 threex.planets 的水星贴图。",
    description: "首页宇宙中的水星，用 threex.planets 的 Mercury 资产渲染。",
    x: 120,
    y: -60,
    size: "small",
    theme: "neutral",
    status: "published",
    sortOrder: 2,
    weight: 4,
  },
  {
    id: 100003,
    slug: "venus",
    name: "Venus",
    summary: "来自 threex.planets 的金星贴图。",
    description: "首页宇宙中的金星，用 threex.planets 的 Venus 资产渲染。",
    x: 180,
    y: 80,
    size: "medium",
    theme: "violet",
    status: "published",
    sortOrder: 3,
    weight: 6,
  },
  {
    id: 100004,
    slug: "moon",
    name: "Moon",
    summary: "来自 threex.planets 的月球贴图。",
    description: "首页宇宙中的月球，用 threex.planets 的 Moon 资产渲染。",
    x: 240,
    y: -120,
    size: "small",
    theme: "neutral",
    status: "published",
    sortOrder: 4,
    weight: 4,
  },
  {
    id: 100005,
    slug: "earth",
    name: "Earth",
    summary: "来自 threex.planets 的地球贴图。",
    description: "首页宇宙中的地球，用 threex.planets 的 Earth 资产渲染。",
    x: 300,
    y: 110,
    size: "medium",
    theme: "blue",
    status: "published",
    sortOrder: 5,
    weight: 7,
  },
  {
    id: 100006,
    slug: "earthcloud",
    name: "EarthCloud",
    summary: "来自 threex.planets 的地球云层贴图。",
    description: "首页宇宙中的地球云层，用 threex.planets 的 EarthCloud 资产渲染。",
    x: 360,
    y: -90,
    size: "medium",
    theme: "cyan",
    status: "published",
    sortOrder: 6,
    weight: 6,
  },
  {
    id: 100007,
    slug: "mars",
    name: "Mars",
    summary: "来自 threex.planets 的火星贴图。",
    description: "首页宇宙中的火星，用 threex.planets 的 Mars 资产渲染。",
    x: 430,
    y: 140,
    size: "small",
    theme: "violet",
    status: "published",
    sortOrder: 7,
    weight: 5,
  },
  {
    id: 100008,
    slug: "jupiter",
    name: "Jupiter",
    summary: "来自 threex.planets 的木星贴图。",
    description: "首页宇宙中的木星，用 threex.planets 的 Jupiter 资产渲染。",
    x: 500,
    y: -130,
    size: "large",
    theme: "teal",
    status: "published",
    sortOrder: 8,
    weight: 9,
  },
  {
    id: 100009,
    slug: "saturn",
    name: "Saturn",
    summary: "来自 threex.planets 的土星贴图。",
    description: "首页宇宙中的土星，用 threex.planets 的 Saturn 资产渲染。",
    x: 560,
    y: 90,
    size: "large",
    theme: "emerald",
    status: "published",
    sortOrder: 9,
    weight: 8,
  },
  {
    id: 100010,
    slug: "saturnring",
    name: "SaturnRing",
    summary: "来自 threex.planets 的土星环贴图。",
    description: "首页宇宙中的土星环，用 threex.planets 的 SaturnRing 资产渲染。",
    x: 620,
    y: -40,
    size: "medium",
    theme: "neutral",
    status: "published",
    sortOrder: 10,
    weight: 6,
  },
  {
    id: 100011,
    slug: "uranus",
    name: "Uranus",
    summary: "来自 threex.planets 的天王星贴图。",
    description: "首页宇宙中的天王星，用 threex.planets 的 Uranus 资产渲染。",
    x: 680,
    y: 140,
    size: "medium",
    theme: "teal",
    status: "published",
    sortOrder: 11,
    weight: 6,
  },
  {
    id: 100012,
    slug: "uranusring",
    name: "UranusRing",
    summary: "来自 threex.planets 的天王星环贴图。",
    description: "首页宇宙中的天王星环，用 threex.planets 的 UranusRing 资产渲染。",
    x: 740,
    y: -100,
    size: "medium",
    theme: "cyan",
    status: "published",
    sortOrder: 12,
    weight: 6,
  },
  {
    id: 100013,
    slug: "neptune",
    name: "Neptune",
    summary: "来自 threex.planets 的海王星贴图。",
    description: "首页宇宙中的海王星，用 threex.planets 的 Neptune 资产渲染。",
    x: 800,
    y: 80,
    size: "medium",
    theme: "blue",
    status: "published",
    sortOrder: 13,
    weight: 6,
  },
  {
    id: 100014,
    slug: "pluto",
    name: "Pluto",
    summary: "来自 threex.planets 的冥王星贴图。",
    description: "首页宇宙中的冥王星，用 threex.planets 的 Pluto 资产渲染。",
    x: 860,
    y: -120,
    size: "small",
    theme: "neutral",
    status: "published",
    sortOrder: 14,
    weight: 4,
  },
]

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

export function getProfile(): ProfileData {
  return cloneProfileData(getPublicProfile())
}

export function getEssaySummaries(): ReadonlyArray<EssaySummary> {
  return getPublicEssays().map(cloneEssaySummary)
}

export function getAllEssaySlugs(): ReadonlyArray<string> {
  return [...getDatabaseEssaySlugs()]
}

export function getEssayDocumentBySlug(slug: string): EssayDocument | null {
  const essay = getEssayBySlug(slug)

  if (!essay) {
    return null
  }

  return {
    meta: cloneEssaySummary({
      slug: essay.slug,
      title: essay.title,
      description: essay.description,
      publishedAt: essay.publishedAt,
      readingTime: essay.readingTime,
      tags: essay.tags,
    }),
    content: essay.content,
  }
}

export function getFeaturedNotes(limit = 3): ReadonlyArray<NoteEntry> {
  return getAllNotes().slice(0, limit)
}

export function getAllNotes(): ReadonlyArray<NoteEntry> {
  return getPublicNotes().map(cloneNoteEntry)
}

export function getProjects(): ReadonlyArray<ProjectEntry> {
  return getPublicProjects().map(cloneProjectEntry)
}

export function getLifePlanets(): ReadonlyArray<StoredPlanet> {
  return homepageSolarSystemPlanets.map(clonePlanet)
}

export function getLifeUniverseTaxonomy(): LifeUniverseTaxonomy {
  return getCanonicalLifeUniverseTaxonomy()
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
