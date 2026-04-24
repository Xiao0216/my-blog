import type {
  StoredMemory,
  StoredPlanet,
  StoredTwinIdentity,
} from "@/lib/cms/schema"

export type TwinReference = {
  readonly kind: "planet" | "memory"
  readonly id: string
  readonly title: string
  readonly excerpt: string
}

export type RetrievedTwinContext = {
  readonly contextText: string
  readonly references: ReadonlyArray<TwinReference>
}

export type TwinChatRequest = {
  readonly message: string
  readonly focusedPlanetId?: number
}

export type TwinChatResponse = {
  readonly answer: string
  readonly mode: "model" | "fallback"
  readonly references: ReadonlyArray<TwinReference>
}

export type TwinPromptInput = {
  readonly message: string
  readonly identity: StoredTwinIdentity
  readonly context: RetrievedTwinContext
}

export type TwinRetrievalInput = {
  readonly message: string
  readonly focusedPlanetId?: number
  readonly planets: ReadonlyArray<StoredPlanet>
  readonly memories: ReadonlyArray<StoredMemory>
  readonly limit?: number
}
