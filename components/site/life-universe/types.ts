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

export type PlanetTone =
  | "blue"
  | "cyan"
  | "emerald"
  | "neutral"
  | "teal"
  | "violet"

export type NullSpaceTheme = "dark" | "light"

export type PlanetContextModel = {
  readonly id: string
  readonly title: string
  readonly excerpt: string
  readonly tone: PlanetTone
  readonly planetId?: number
}

export type UniverseViewState = "entering" | "focused" | "inside" | "leaving" | "overview"

export type PlanetDetailModel = {
  readonly context: PlanetContextModel
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

export type PlanetRenderLevel = "full" | "point" | "simple"

export type PlanetOrbitModel = {
  readonly delaySeconds: number
  readonly durationSeconds: number
  readonly radius: number
  readonly startAngle: number
}

export type PlanetRotationModel = {
  readonly durationSeconds: number
}

export type PlanetUniverseBodyModel = {
  readonly id: string
  readonly planetId: number
  readonly slug: string
  readonly name: string
  readonly summary: string
  readonly description: string
  readonly level: number
  readonly size: number
  readonly tone: PlanetTone
  readonly orbit: PlanetOrbitModel
  readonly rotation: PlanetRotationModel
  readonly publicMemoryCount: number
  readonly assistantMemoryCount: number
}

export type PlanetUniverseModel = {
  readonly planets: ReadonlyArray<PlanetUniverseBodyModel>
}

export type PlanetPreviewModel = {
  readonly hint: string
  readonly meta: string
  readonly summary: string
  readonly title: string
}
