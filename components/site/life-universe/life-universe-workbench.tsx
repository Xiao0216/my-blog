"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"

import type {
  CanvasPan,
  ChatMessage,
  HomePageViewProps,
  NullSpaceTheme,
  PlanetDetailModel,
  UniverseCardModel,
  UniverseCardStatus,
  UniverseLayoutInputCard,
  UniverseCardTone,
  UniverseViewState,
} from "@/components/site/life-universe/types"
import { layoutUniverseCards } from "@/components/site/life-universe/universe-layout"
import { TwinConsole } from "@/components/site/life-universe/twin-console"
import { UniverseCanvas } from "@/components/site/life-universe/universe-canvas"
import { UniverseSidebar } from "@/components/site/life-universe/universe-sidebar"
import { UniverseToolbar } from "@/components/site/life-universe/universe-toolbar"
import { UniverseTopbar } from "@/components/site/life-universe/universe-topbar"
import type { TwinChatResponse } from "@/lib/twin/types"

const DEFAULT_ZOOM = 78
const WHEEL_ZOOM_STEP = 8
const MIN_ZOOM = 50
const MAX_ZOOM = 150
const DEFAULT_PAN: CanvasPan = { x: 0, y: 0 }

const UNIVERSE_VIEWPORT = {
  centerX: 480,
  centerY: 330,
  height: 660,
  width: 960,
} as const

const CARD_SIZE = {
  core: { width: 286, height: 190 },
  planet: { width: 172, height: 132 },
  feature: { width: 160, height: 128 },
  note: { width: 140, height: 96 },
} as const
const MAX_HOME_NOTE_PREVIEW_CARDS = 1

const toneByTheme: Record<string, UniverseCardTone> = {
  blue: "blue",
  cyan: "cyan",
  emerald: "emerald",
  teal: "teal",
  violet: "violet",
}

type BaseUniverseCard = UniverseLayoutInputCard & {
  readonly category: string
  readonly date: string
  readonly excerpt: string
  readonly featured?: boolean
  readonly planetId?: number
  readonly status: UniverseCardStatus
  readonly title: string
  readonly tone: UniverseCardTone
}

export function LifeUniverseWorkbench(props: HomePageViewProps) {
  const cards = useMemo(() => buildUniverseCards(props), [props])
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "garden")
  const [viewState, setViewState] = useState<UniverseViewState>("overview")
  const [enteredCardId, setEnteredCardId] = useState<string | undefined>(undefined)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pan, setPan] = useState<CanvasPan>(DEFAULT_PAN)
  const [theme, setTheme] = useState<NullSpaceTheme>("dark")
  const [draftMessage, setDraftMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ReadonlyArray<ChatMessage>>([
    {
      id: "assistant-intro",
      role: "assistant",
      content: "你好，我是你的 AI 分身，可以基于记忆和上下文继续思考。",
      references: [],
      mode: "fallback",
    },
  ])
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0]
  const enteredCard = cards.find((card) => card.id === enteredCardId)
  const detail = enteredCard ? buildPlanetDetail(enteredCard, props) : undefined

  function zoomIn() {
    setZoom((current) => clampZoom(current + 10))
  }

  function zoomOut() {
    setZoom((current) => clampZoom(current - 10))
  }

  function zoomFromWheel(deltaY: number) {
    setZoom((current) =>
      clampZoom(current + (deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP))
    )
  }

  function resetCanvas() {
    setZoom(DEFAULT_ZOOM)
    setPan(DEFAULT_PAN)
    setSelectedCardId(cards[0]?.id ?? "garden")
    setEnteredCardId(undefined)
    setViewState("overview")
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  function selectCard(cardId: string) {
    setSelectedCardId(cardId)
  }

  function enterCard(cardId: string) {
    setSelectedCardId(cardId)
    setEnteredCardId(cardId)
    setViewState("inside")
  }

  function leaveCard() {
    setEnteredCardId(undefined)
    setViewState("overview")
  }

  function askTwin(cardId: string) {
    setSelectedCardId(cardId)
  }

  function showRelated(cardId: string) {
    setSelectedCardId(cardId)
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draftMessage.trim()

    if (!message || isSending) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    }
    const history = messages.map(({ role, content }) => ({ role, content }))

    setMessages((current) => [...current, userMessage])
    setDraftMessage("")
    setIsSending(true)

    try {
      const response = await fetch("/api/twin/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          history,
        }),
      })

      if (!response.ok) {
        throw new Error("Twin chat request failed")
      }

      const data = (await response.json()) as TwinChatResponse
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          mode: data.mode,
          references: data.references,
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "当前无法连接 Null AI，我已经保留了你的问题。",
          mode: "fallback",
          references: [],
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      data-testid="null-space-shell"
      data-theme={theme}
      data-view-state={viewState}
      className="null-space-shell relative isolate min-h-screen overflow-hidden"
    >
      <div className="null-space-grid absolute inset-0" aria-hidden="true" />
      <div className="null-space-noise absolute inset-0" aria-hidden="true" />
      <div className="null-space-vignette absolute inset-0" aria-hidden="true" />

      <UniverseSidebar />
      <UniverseTopbar theme={theme} onToggleTheme={toggleTheme} />
      <UniverseCanvas
        cards={cards}
        selectedCardId={selectedCardId}
        detail={detail}
        enteredCardId={enteredCardId}
        zoom={zoom}
        pan={pan}
        hasPlanets={props.planets.length > 0}
        viewState={viewState}
        onSelectCard={selectCard}
        onAskTwin={askTwin}
        onEnterCard={enterCard}
        onLeaveCard={leaveCard}
        onPanChange={setPan}
        onShowRelated={showRelated}
        onWheelZoom={zoomFromWheel}
      />
      <UniverseToolbar
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetCanvas}
      />
      <TwinConsole
        identity={props.twinIdentity}
        selectedCard={selectedCard}
        memoriesCount={props.memories.length}
        draftMessage={draftMessage}
        isSending={isSending}
        messages={messages}
        onDraftChange={setDraftMessage}
        onSubmit={submitMessage}
      />

      <div className="pointer-events-none absolute right-9 bottom-5 z-20 hidden items-center gap-5 font-mono text-xs text-[var(--ns-text-muted)] md:flex">
        <span>{props.essays.length} 文章</span>
        <span>{props.planets.length} 连接</span>
        <span>无限可能</span>
      </div>
    </div>
  )
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function buildUniverseCards({
  essays,
  notes,
  planets,
  profile,
  projects,
}: HomePageViewProps): ReadonlyArray<UniverseCardModel> {
  const visibleNotes = notes.slice(0, MAX_HOME_NOTE_PREVIEW_CARDS)
  const baseCards = [
    {
      id: "garden",
      kind: "core" as const,
      group: "self",
      importance: 10,
      ...CARD_SIZE.core,
      category: "数字花园",
      title: "构建你的数字花园",
      excerpt: profile.heroTitle || profile.heroIntro,
      date: "2024.05.12",
      tone: "teal" as const,
      status: "mature" as const,
      featured: true,
    },
    ...planets.map((planet, index) => ({
      id: `planet-${planet.id}`,
      kind: "planet" as const,
      group: planet.slug,
      importance: planet.weight ?? Math.max(1, planets.length - index),
      ...CARD_SIZE.planet,
      category: planet.slug,
      title: planet.name,
      excerpt: planet.summary,
      date: "2024.05.12",
      tone: toneByTheme[planet.theme] ?? "violet",
      status: "mature" as const,
      planetId: planet.id,
    })),
    ...(essays[0]
      ? [
          {
            id: `essay-${essays[0].slug}`,
            kind: "essay" as const,
            group: essays[0].slug,
            importance: 3,
            ...CARD_SIZE.feature,
            category: "技术趋势",
            title: essays[0].title,
            excerpt: essays[0].description,
            date: essays[0].publishedAt.replaceAll("-", "."),
            tone: "violet" as const,
            status: "growing" as const,
          },
        ]
      : []),
    ...(projects[0]
      ? [
          {
            id: `project-${projects[0].slug}`,
            kind: "project" as const,
            group: projects[0].slug,
            importance: 3,
            ...CARD_SIZE.feature,
            category: "产品思考",
            title: projects[0].title,
            excerpt: projects[0].description,
            date: "2024.04.26",
            tone: "violet" as const,
            status: "archived" as const,
          },
        ]
      : []),
    ...visibleNotes.map((note, index) => ({
      id: `note-${note.slug}`,
      kind: "note" as const,
      group: note.slug,
      importance: 2,
      ...CARD_SIZE.note,
      category: "碎片笔记",
      title: note.title,
      excerpt: note.body,
      date: note.publishedAt.replaceAll("-", "."),
      tone: index === 0 ? ("cyan" as const) : ("neutral" as const),
      status: "seedling" as const,
    })),
  ] satisfies ReadonlyArray<BaseUniverseCard>

  const placements = layoutUniverseCards(
    baseCards.map(({ group, height, id, importance, kind, width }) => ({
      group,
      height,
      id,
      importance,
      kind,
      width,
    })),
    UNIVERSE_VIEWPORT
  )
  const placementById = new Map(placements.map((placement) => [placement.id, placement]))

  return baseCards.map((card) => {
    const placement = placementById.get(card.id)

    if (!placement) {
      throw new Error(`Missing layout placement for universe card: ${card.id}`)
    }

    return {
      ...card,
      ...placement,
    }
  })
}

function buildPlanetDetail(
  card: UniverseCardModel,
  { essays, memories, notes, projects }: HomePageViewProps
): PlanetDetailModel {
  const keyMemories = memories
    .filter((memory) =>
      card.planetId
        ? memory.visibility === "public" && memory.planetId === card.planetId
        : memory.visibility === "public"
    )
    .slice(0, 3)
    .map((memory) => memory.title)
  const relatedTitles = [...essays, ...projects, ...notes]
    .map((item) => item.title)
    .slice(0, 4)

  return {
    card,
    counts: {
      essays: essays.length,
      memories: memories.length,
      notes: notes.length,
      projects: projects.length,
    },
    keyMemories:
      keyMemories.length > 0
        ? keyMemories
        : ["最近还没有公开记忆，但这个行星已经可以承载你的行为记录。"],
    recentChanges: [
      `${card.title} 正在形成更清晰的结构。`,
      "新的内容会在这里沉淀成时间线。",
    ],
    relatedTitles:
      relatedTitles.length > 0
        ? relatedTitles
        : ["关联内容正在形成，下一次沉淀会先出现在这里。"],
  }
}
