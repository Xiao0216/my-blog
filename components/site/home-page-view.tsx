"use client"

import {
  Bot,
  Focus,
  Home,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
} from "lucide-react"
import { type FormEvent, type ReactNode, useMemo, useState } from "react"

import type {
  StoredMemory,
  StoredPlanet,
  StoredTwinIdentity,
} from "@/lib/content"
import type { TwinChatResponse, TwinReference } from "@/lib/twin/types"

type HomePageProfile = {
  heroTitle: string
  heroIntro: string
  aboutSummary: string
}

type HomePageNote = {
  slug: string
  title: string
  body: string
  publishedAt: string
}

type HomePageEssay = {
  slug: string
  title: string
  description: string
  publishedAt: string
}

type HomePageProject = {
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

type Viewport = {
  x: number
  y: number
  scale: number
}

type ChatMessage = {
  readonly id: string
  readonly role: "user" | "assistant"
  readonly content: string
  readonly mode?: TwinChatResponse["mode"]
  readonly references?: ReadonlyArray<TwinReference>
}

const planetSizeClass = {
  small: "h-32 w-32",
  medium: "h-40 w-40",
  large: "h-52 w-52",
} satisfies Record<StoredPlanet["size"], string>

const planetGlow: Record<string, string> = {
  blue: "shadow-blue-500/25",
  cyan: "shadow-cyan-500/25",
  emerald: "shadow-emerald-500/25",
  teal: "shadow-teal-500/25",
  violet: "shadow-violet-500/25",
}

export function HomePageView({
  profile,
  essays,
  notes,
  projects,
  planets,
  memories,
  twinIdentity,
}: HomePageViewProps) {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 })
  const [dragStart, setDragStart] = useState<{
    pointerX: number
    pointerY: number
    viewportX: number
    viewportY: number
  } | null>(null)
  const [focusedPlanetId, setFocusedPlanetId] = useState(planets[0]?.id)
  const focusedPlanet =
    planets.find((planet) => planet.id === focusedPlanetId) ?? planets[0]
  const focusedMemories = useMemo(
    () =>
      focusedPlanet
        ? memories
            .filter((memory) => memory.planetId === focusedPlanet.id)
            .sort((first, second) => second.importance - first.importance)
        : [],
    [focusedPlanet, memories]
  )

  function updateScale(delta: number) {
    setViewport((current) => ({
      ...current,
      scale: Math.min(1.5, Math.max(0.68, Number((current.scale + delta).toFixed(2)))),
    }))
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#030712] text-zinc-50">
      <div className="life-universe-grid absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="life-universe-vignette absolute inset-0" aria-hidden="true" />
      <div className="spatial-noise absolute inset-0 opacity-[0.06]" aria-hidden="true" />

      <section className="relative grid min-h-screen grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[64px_minmax(0,1fr)_360px]">
        <UniverseRail />
        <main className="min-w-0">
          <UniverseTopBar profile={profile} />
          <div
            role="region"
            aria-label="Life universe canvas"
            className="life-universe-glass relative mt-4 hidden h-[720px] cursor-grab overflow-hidden rounded-lg md:block"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              setDragStart({
                pointerX: event.clientX,
                pointerY: event.clientY,
                viewportX: viewport.x,
                viewportY: viewport.y,
              })
            }}
            onPointerMove={(event) => {
              if (!dragStart) {
                return
              }

              setViewport((current) => ({
                ...current,
                x: dragStart.viewportX + event.clientX - dragStart.pointerX,
                y: dragStart.viewportY + event.clientY - dragStart.pointerY,
              }))
            }}
            onPointerUp={() => setDragStart(null)}
            onWheel={(event) => {
              event.preventDefault()
              updateScale(event.deltaY > 0 ? -0.06 : 0.06)
            }}
          >
            <div className="absolute left-4 top-4 z-20 rounded-md border border-white/10 bg-black/35 px-3 py-2 font-mono text-[0.68rem] text-zinc-400 backdrop-blur">
              x {Math.round(viewport.x)} / y {Math.round(viewport.y)} / z{" "}
              {viewport.scale.toFixed(2)}
            </div>

            <div
              className="absolute left-1/2 top-1/2 h-[820px] w-[1120px] origin-center transition-transform duration-150 ease-out"
              style={{
                transform: `translate(calc(-50% + ${viewport.x}px), calc(-50% + ${viewport.y}px)) scale(${viewport.scale})`,
              }}
            >
              <UniverseLines planets={planets} />
              {planets.map((planet) => (
                <PlanetButton
                  key={planet.id}
                  planet={planet}
                  isFocused={planet.id === focusedPlanet?.id}
                  onFocus={() => setFocusedPlanetId(planet.id)}
                />
              ))}
              {planets.length === 0 ? <UniverseEmptyState /> : null}
            </div>
          </div>

          <MobilePlanetStream
            planets={planets}
            memories={memories}
            onFocus={setFocusedPlanetId}
          />

          <UniverseBottomBar
            viewport={viewport}
            onZoomIn={() => updateScale(0.1)}
            onZoomOut={() => updateScale(-0.1)}
            onReset={() => setViewport({ x: 0, y: 0, scale: 1 })}
          />
        </main>

        <TwinPanel
          identity={twinIdentity}
          focusedPlanet={focusedPlanet}
          focusedMemories={focusedMemories}
          memories={memories}
          counts={{
            essays: essays.length,
            projects: projects.length,
            notes: notes.length,
            planets: planets.length,
          }}
        />
      </section>
    </div>
  )
}

function UniverseRail() {
  return (
    <aside className="life-universe-glass hidden rounded-lg py-3 lg:flex lg:flex-col lg:items-center lg:justify-between">
      <div className="grid gap-3">
        <RailButton label="Home">
          <Home className="h-4 w-4" />
        </RailButton>
        <RailButton label="Search">
          <Search className="h-4 w-4" />
        </RailButton>
        <RailButton label="Focus">
          <Focus className="h-4 w-4" />
        </RailButton>
      </div>
      <RailButton label="Twin">
        <Bot className="h-4 w-4" />
      </RailButton>
    </aside>
  )
}

function RailButton({
  label,
  children,
}: {
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-50"
    >
      {children}
    </button>
  )
}

function UniverseTopBar({ profile }: { readonly profile: HomePageProfile }) {
  return (
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/70 uppercase">
          Life Universe
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">人生宇宙</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          {profile.heroIntro}
        </p>
      </div>
      <div className="life-universe-glass flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-zinc-400">
        <Sparkles className="h-4 w-4 text-teal-200" />
        <span>{profile.heroTitle}</span>
      </div>
    </header>
  )
}

function UniverseLines({ planets }: { readonly planets: ReadonlyArray<StoredPlanet> }) {
  return (
    <svg
      data-universe-lines="true"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="-560 -410 1120 820"
    >
      {planets.slice(1).map((planet, index) => {
        const previous = planets[index]

        return (
          <line
            key={`${previous.id}-${planet.id}`}
            x1={previous.x}
            y1={previous.y}
            x2={planet.x}
            y2={planet.y}
            stroke="rgba(153, 246, 228, 0.2)"
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}

function PlanetButton({
  planet,
  isFocused,
  onFocus,
}: {
  readonly planet: StoredPlanet
  readonly isFocused: boolean
  readonly onFocus: () => void
}) {
  const glowClass = planetGlow[planet.theme] ?? "shadow-teal-500/25"

  return (
    <button
      type="button"
      aria-label={`聚焦 ${planet.name}`}
      onClick={onFocus}
      onPointerDown={(event) => event.stopPropagation()}
      className={`${planetSizeClass[planet.size]} ${glowClass} absolute -translate-x-1/2 -translate-y-1/2 rounded-full border p-5 text-left shadow-2xl backdrop-blur-xl transition duration-200 hover:scale-[1.03] ${
        isFocused
          ? "border-teal-200/70 bg-teal-200/[0.13]"
          : "border-white/10 bg-white/[0.065] hover:border-teal-200/40"
      }`}
      style={{
        left: `calc(50% + ${planet.x}px)`,
        top: `calc(50% + ${planet.y}px)`,
      }}
    >
      <span className="block font-mono text-[0.62rem] tracking-[0.14em] text-teal-100/70 uppercase">
        {planet.theme}
      </span>
      <span className="mt-3 block text-lg font-semibold text-zinc-50">
        {planet.name}
      </span>
      <span className="mt-2 line-clamp-3 block text-xs leading-5 text-zinc-400">
        {planet.summary}
      </span>
    </button>
  )
}

function MobilePlanetStream({
  planets,
  memories,
  onFocus,
}: {
  readonly planets: ReadonlyArray<StoredPlanet>
  readonly memories: ReadonlyArray<StoredMemory>
  readonly onFocus: (planetId: number) => void
}) {
  return (
    <section className="mt-6 md:hidden">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/70 uppercase">
        移动星球流
      </p>
      {planets.length > 0 ? (
        <div className="mt-4 space-y-3 border-l border-teal-200/20 pl-4">
          {planets.map((planet) => (
            <button
              key={planet.id}
              type="button"
              aria-label={`移动聚焦 ${planet.name}`}
              onClick={() => onFocus(planet.id)}
              className="relative w-full rounded-lg border border-white/10 bg-white/[0.07] p-4 text-left backdrop-blur"
            >
              <span className="absolute -left-[21px] top-5 h-2 w-2 rounded-full bg-teal-200 shadow-[0_0_20px_rgba(153,246,228,0.7)]" />
              <span className="font-mono text-[0.68rem] tracking-[0.14em] text-teal-200/70 uppercase">
                {planet.theme}
              </span>
              <span className="mt-2 block font-semibold text-zinc-50">
                {planet.name}
              </span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">
                {planet.summary}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.055] p-4 text-sm text-zinc-500">
          No planets in this universe yet
        </div>
      )}
      {memories.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No public memories attached yet</p>
      ) : null}
    </section>
  )
}

function UniverseEmptyState() {
  return (
    <div className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/[0.055] p-4 text-center text-sm text-zinc-500 backdrop-blur">
      No planets in this universe yet
    </div>
  )
}

function UniverseBottomBar({
  viewport,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  readonly viewport: Viewport
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onReset: () => void
}) {
  return (
    <div className="life-universe-glass mx-auto mt-4 flex w-fit items-center gap-2 rounded-lg px-3 py-2">
      <CanvasControl label="缩小" onClick={onZoomOut}>
        <Minus className="h-4 w-4" />
      </CanvasControl>
      <span className="rounded-md border border-white/10 px-3 py-2 font-mono text-xs text-zinc-400">
        {Math.round(viewport.scale * 100)}%
      </span>
      <CanvasControl label="放大" onClick={onZoomIn}>
        <Plus className="h-4 w-4" />
      </CanvasControl>
      <CanvasControl label="重置视角" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
      </CanvasControl>
    </div>
  )
}

function CanvasControl({
  label,
  onClick,
  children,
}: {
  readonly label: string
  readonly onClick: () => void
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.06] text-zinc-200 backdrop-blur transition-colors hover:border-teal-200/40 hover:bg-teal-200/10"
    >
      {children}
    </button>
  )
}

function TwinPanel({
  identity,
  focusedPlanet,
  focusedMemories,
  memories,
  counts,
}: {
  readonly identity: StoredTwinIdentity
  readonly focusedPlanet?: StoredPlanet
  readonly focusedMemories: ReadonlyArray<StoredMemory>
  readonly memories: ReadonlyArray<StoredMemory>
  readonly counts: {
    readonly essays: number
    readonly projects: number
    readonly notes: number
    readonly planets: number
  }
}) {
  const [messages, setMessages] = useState<ReadonlyArray<ChatMessage>>([
    {
      id: "intro",
      role: "assistant",
      content: "你好，我会基于公开记忆和允许的上下文回答问题。",
      references: [],
      mode: "fallback",
    },
  ])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = input.trim()

    if (!message || isSending) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    }
    setMessages((current) => [...current, userMessage])
    setInput("")
    setIsSending(true)

    try {
      const response = await fetch("/api/twin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          focusedPlanetId: focusedPlanet?.id,
        }),
      })
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
          content: "离线模式：当前无法连接数字分身接口。",
          mode: "fallback",
          references: [],
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <aside
      role="complementary"
      aria-label="Digital twin"
      className="life-universe-glass flex min-h-[640px] flex-col rounded-lg p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-teal-100/30 bg-teal-100/10 shadow-2xl shadow-teal-500/20">
          <Bot className="h-7 w-7 text-teal-100" />
        </div>
        <div>
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-teal-200/70 uppercase">
            Digital Twin
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-50">
            {identity.displayName}
          </h2>
          <p className="text-sm text-zinc-500">{identity.subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <Stat label="planets" value={counts.planets} />
        <Stat label="memories" value={memories.length} />
        <Stat label="essays" value={`${counts.essays} essays`} />
        <Stat label="projects" value={`${counts.projects} projects`} />
        <Stat label="notes" value={`${counts.notes} notes`} />
      </div>

      <section className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3">
        <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
          <MessageCircle className="h-4 w-4 text-teal-200" />
          {focusedPlanet?.name ?? "No focused planet"}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {focusedPlanet?.summary ?? "No planets in this universe yet"}
        </p>
        <div className="mt-3 space-y-2">
          {focusedMemories.length > 0 ? (
            focusedMemories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="rounded-md border border-white/10 p-2">
                <p className="text-sm font-medium text-zinc-100">{memory.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                  {memory.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No public memories attached yet</p>
          )}
        </div>
      </section>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg border p-3 text-sm leading-6 ${
              message.role === "assistant"
                ? "border-teal-200/15 bg-teal-200/[0.06] text-zinc-300"
                : "border-white/10 bg-white/[0.06] text-zinc-200"
            }`}
          >
            <p>{message.content}</p>
            {message.references && message.references.length > 0 ? (
              <div className="mt-3 space-y-1 border-t border-white/10 pt-2 text-xs text-zinc-500">
                {message.references.slice(0, 3).map((reference) => (
                  <p key={reference.id}>{reference.title}</p>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={submitMessage} className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="和数字分身聊聊..."
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-teal-200/40"
        />
        <button
          type="submit"
          aria-label="发送给数字分身"
          disabled={isSending}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-teal-200/30 px-3 text-sm font-medium text-teal-100 transition-colors hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          发送
        </button>
      </form>
    </aside>
  )
}

function Stat({ label, value }: { readonly label: string; readonly value: ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
      <p className="font-mono text-[0.62rem] uppercase text-zinc-600">{label}</p>
      <p className="mt-1 text-zinc-200">{value}</p>
    </div>
  )
}
