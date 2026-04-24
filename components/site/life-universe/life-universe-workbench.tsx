"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"

import type {
  CanvasPan,
  ChatMessage,
  HomePageViewProps,
  NullSpaceTheme,
  UniverseCardModel,
  UniverseCardTone,
} from "@/components/site/life-universe/types"
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

const planetSlots = [
  { x: 132, y: 78, width: 184, height: 142, rotate: -3 },
  { x: 110, y: 414, width: 168, height: 140, rotate: -3 },
  { x: 342, y: 248, width: 146, height: 112, rotate: 1 },
  { x: 534, y: 68, width: 148, height: 126, rotate: 1 },
  { x: 708, y: 108, width: 166, height: 142, rotate: 1 },
  { x: 722, y: 398, width: 168, height: 134, rotate: 5 },
] as const

const noteSlots = [
  { x: 504, y: 428, width: 164, height: 124, rotate: 0 },
  { x: 650, y: 280, width: 112, height: 106, rotate: 1 },
] as const

const toneByTheme: Record<string, UniverseCardTone> = {
  blue: "blue",
  cyan: "cyan",
  emerald: "emerald",
  teal: "teal",
  violet: "violet",
}

export function LifeUniverseWorkbench(props: HomePageViewProps) {
  const cards = useMemo(() => buildUniverseCards(props), [props])
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "garden")
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
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
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
        zoom={zoom}
        pan={pan}
        hasPlanets={props.planets.length > 0}
        onSelectCard={setSelectedCardId}
        onPanChange={setPan}
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
  const centerCard: UniverseCardModel = {
    id: "garden",
    category: "数字花园",
    title: "构建你的数字花园",
    excerpt: profile.heroTitle || profile.heroIntro,
    date: "2024.05.12",
    tone: "teal",
    status: "mature",
    x: 396,
    y: 216,
    width: 286,
    height: 190,
    rotate: -2,
    featured: true,
  }

  const planetCards = planets.slice(0, planetSlots.length).map((planet, index) => {
    const slot = planetSlots[index]

    return {
      id: `planet-${planet.id}`,
      category: planet.slug,
      title: planet.name,
      excerpt: planet.summary,
      date: "2024.05.12",
      tone: toneByTheme[planet.theme] ?? "violet",
      status: "mature",
      planetId: planet.id,
      ...slot,
    } satisfies UniverseCardModel
  })

  const projectCard = projects[0]
    ? ({
        id: `project-${projects[0].slug}`,
        category: "产品思考",
        title: projects[0].title,
        excerpt: projects[0].description,
        date: "2024.04.26",
        tone: "violet",
        status: "archived",
        x: 724,
        y: 404,
        width: 168,
        height: 132,
        rotate: 5,
      } satisfies UniverseCardModel)
    : undefined

  const essayCard = essays[0]
    ? ({
        id: `essay-${essays[0].slug}`,
        category: "技术趋势",
        title: essays[0].title,
        excerpt: essays[0].description,
        date: essays[0].publishedAt.replaceAll("-", "."),
        tone: "violet",
        status: "growing",
        x: 716,
        y: 100,
        width: 164,
        height: 138,
        rotate: 0,
      } satisfies UniverseCardModel)
    : undefined

  const noteCards = notes.slice(0, noteSlots.length).map((note, index) => {
    const slot = noteSlots[index]

    return {
      id: `note-${note.slug}`,
      category: "碎片笔记",
      title: note.title,
      excerpt: note.body,
      date: note.publishedAt.replaceAll("-", "."),
      tone: index === 0 ? "cyan" : "neutral",
      status: "seedling",
      ...slot,
    } satisfies UniverseCardModel
  })

  return [
    centerCard,
    ...planetCards,
    ...(essayCard ? [essayCard] : []),
    ...(projectCard ? [projectCard] : []),
    ...noteCards,
  ]
}
