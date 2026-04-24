import type {
  StoredMemory,
  StoredPlanet,
  StoredTwinIdentity,
} from "@/lib/content"
import type { TwinChatResponse, TwinReference } from "@/lib/twin/types"

export type HomePageProfile = {
  heroTitle: string
  heroIntro: string
  aboutSummary: string
}

export type HomePageNote = {
  slug: string
  title: string
  body: string
  publishedAt: string
}

export type HomePageEssay = {
  slug: string
  title: string
  description: string
  publishedAt: string
}

export type HomePageProject = {
  slug: string
  title: string
  description: string
  note: string
}

export type HomePageViewProps = {
  profile: HomePageProfile
  essays: ReadonlyArray<HomePageEssay>
  notes: ReadonlyArray<HomePageNote>
  projects: ReadonlyArray<HomePageProject>
  planets: ReadonlyArray<StoredPlanet>
  memories: ReadonlyArray<StoredMemory>
  twinIdentity: StoredTwinIdentity
}

export type UniverseCardTone =
  | "blue"
  | "cyan"
  | "emerald"
  | "neutral"
  | "teal"
  | "violet"

export type UniverseCardStatus = "seedling" | "growing" | "mature" | "archived"

export type NullSpaceTheme = "dark" | "light"

export type CanvasPan = {
  readonly x: number
  readonly y: number
}

export type UniverseCardModel = {
  readonly id: string
  readonly category: string
  readonly title: string
  readonly excerpt: string
  readonly date: string
  readonly tone: UniverseCardTone
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly rotate: number
  readonly status: UniverseCardStatus
  readonly featured?: boolean
  readonly planetId?: number
}

export type ChatMessage = {
  readonly id: string
  readonly role: "user" | "assistant"
  readonly content: string
  readonly mode?: TwinChatResponse["mode"]
  readonly references?: ReadonlyArray<TwinReference>
}
