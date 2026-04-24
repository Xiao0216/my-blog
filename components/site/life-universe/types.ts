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

export type UniverseCardKind =
  | "core"
  | "essay"
  | "memory"
  | "note"
  | "planet"
  | "project"

export type UniverseLayoutInputCard = {
  readonly id: string
  readonly kind: UniverseCardKind
  readonly group: string
  readonly importance: number
  readonly width: number
  readonly height: number
}

export type UniverseCardPosture = {
  readonly rotateX: number
  readonly rotateY: number
  readonly rotateZ: number
  readonly translateZ: number
}

export type UniverseViewport = {
  readonly centerX: number
  readonly centerY: number
  readonly width: number
  readonly height: number
}

export type PlacedUniverseCard = UniverseLayoutInputCard & {
  readonly x: number
  readonly y: number
  readonly ring: number
  readonly angle: number
  readonly posture: UniverseCardPosture
  readonly layoutStatus: "placed" | "overlap-fallback"
}

export type CanvasPan = {
  readonly x: number
  readonly y: number
}

export type UniverseCardModel = {
  readonly category: string
  readonly title: string
  readonly excerpt: string
  readonly date: string
  readonly href?: string
  readonly tone: UniverseCardTone
  readonly status: UniverseCardStatus
  readonly featured?: boolean
  readonly planetId?: number
} & PlacedUniverseCard

export type UniverseViewState = "entering" | "focused" | "inside" | "leaving" | "overview"

export type PlanetDetailModel = {
  readonly card: UniverseCardModel
  readonly counts: {
    readonly essays: number
    readonly memories: number
    readonly notes: number
    readonly projects: number
  }
  readonly keyMemories: ReadonlyArray<string>
  readonly recentChanges: ReadonlyArray<string>
  readonly relatedTitles: ReadonlyArray<string>
}

export type ChatMessage = {
  readonly id: string
  readonly role: "user" | "assistant"
  readonly content: string
  readonly mode?: TwinChatResponse["mode"]
  readonly references?: ReadonlyArray<TwinReference>
}
