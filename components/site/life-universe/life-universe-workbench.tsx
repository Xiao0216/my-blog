"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"

import type {
  CanvasPan,
  ChatMessage,
  HomePageViewProps,
  NullSpaceTheme,
  PlanetDetailModel,
  PlanetUniverseBodyModel,
  UniverseCardModel,
  UniverseViewState,
} from "@/components/site/life-universe/types"
import type { PlanetPoint } from "@/components/site/life-universe/planet-body"
import { PlanetDetailOverlay } from "@/components/site/life-universe/planet-detail-overlay"
import { buildMinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import { buildPlanetUniverseModel } from "@/components/site/life-universe/planet-universe-model"
import { TwinOrb } from "@/components/site/life-universe/twin-orb"
import { UniverseCanvas } from "@/components/site/life-universe/universe-canvas"
import { UniverseSidebar } from "@/components/site/life-universe/universe-sidebar"
import { UniverseTopbar } from "@/components/site/life-universe/universe-topbar"
import type { TwinChatResponse } from "@/lib/twin/types"

const DEFAULT_ZOOM = 78
const WHEEL_DELTA_PER_ZOOM_POINT = 15
const MIN_ZOOM = 50
const MAX_ZOOM = 150
const DEFAULT_PAN: CanvasPan = { x: 0, y: 0 }
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export function LifeUniverseWorkbench(props: HomePageViewProps) {
  const isReducedMotion = useSyncExternalStore(
    subscribeToReducedMotionPreference,
    getReducedMotionPreferenceSnapshot,
    getReducedMotionPreferenceServerSnapshot
  )
  const universe = useMemo(
    () =>
      buildPlanetUniverseModel({
        memories: props.memories,
        planets: props.planets,
      }),
    [props.memories, props.planets]
  )
  const threeScene = useMemo(
    () => buildMinimalThreeScene(universe.planets),
    [universe.planets]
  )
  const [focusedPlanetId, setFocusedPlanetId] = useState<string | undefined>(
    universe.planets[0]?.id
  )
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | undefined>(
    undefined
  )
  const [hoverPoint, setHoverPoint] = useState<PlanetPoint | undefined>(
    undefined
  )
  const [relatedScopePlanetId, setRelatedScopePlanetId] = useState<
    string | undefined
  >(undefined)
  const [viewState, setViewState] = useState<UniverseViewState>("overview")
  const [enteredPlanetId, setEnteredPlanetId] = useState<string | undefined>(
    undefined
  )
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pan, setPan] = useState<CanvasPan>(DEFAULT_PAN)
  const [theme, setTheme] = useState<NullSpaceTheme>("dark")
  const [draftMessage, setDraftMessage] = useState("")
  const [isTwinExpanded, setIsTwinExpanded] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ReadonlyArray<ChatMessage>>([
    {
      id: "assistant-intro",
      role: "assistant",
      content: "你好，我是你的数字分身，可以基于记忆和上下文继续思考。",
      references: [],
      mode: "fallback",
    },
  ])
  const interactiveShellRef = useRef<HTMLDivElement | null>(null)
  const effectiveFocusedPlanet = useMemo(
    () =>
      universe.planets.find((planet) => planet.id === focusedPlanetId) ??
      universe.planets[0],
    [focusedPlanetId, universe.planets]
  )
  const effectiveFocusedPlanetId = effectiveFocusedPlanet?.id
  const enteredPlanet = useMemo(
    () => universe.planets.find((planet) => planet.id === enteredPlanetId),
    [enteredPlanetId, universe.planets]
  )
  const activeContextPlanet = enteredPlanet ?? effectiveFocusedPlanet
  const contextCard = useMemo(() => {
    return activeContextPlanet
      ? buildContextCard(activeContextPlanet)
      : undefined
  }, [activeContextPlanet])
  const detail = useMemo(
    () => (enteredPlanet ? buildPlanetDetail(enteredPlanet, props) : undefined),
    [enteredPlanet, props]
  )
  const isMotionPaused = Boolean(hoveredPlanetId || enteredPlanetId)

  function zoomFromWheel(deltaY: number) {
    setZoom((current) =>
      clampZoom(current - deltaY / WHEEL_DELTA_PER_ZOOM_POINT)
    )
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  function selectPlanet(planetId: string, point: PlanetPoint) {
    setFocusedPlanetId(planetId)
    setHoveredPlanetId(planetId)
    setHoverPoint(point)
    setRelatedScopePlanetId(undefined)
  }

  function hoverPlanet(planetId: string, point: PlanetPoint) {
    setFocusedPlanetId(planetId)
    setHoveredPlanetId(planetId)
    setHoverPoint(point)
  }

  function leavePlanet(planetId: string) {
    setHoveredPlanetId((current) =>
      current === planetId ? undefined : current
    )
    setHoverPoint(undefined)
  }

  function enterPlanet(planetId: string) {
    setFocusedPlanetId(planetId)
    setHoveredPlanetId(undefined)
    setHoverPoint(undefined)
    setRelatedScopePlanetId(undefined)
    setEnteredPlanetId(planetId)
    setViewState("inside")
  }

  function leavePlanetDetail() {
    setEnteredPlanetId(undefined)
    setViewState("overview")
  }

  useEffect(() => {
    const interactiveShell = interactiveShellRef.current

    if (!interactiveShell) {
      return
    }

    if (detail) {
      interactiveShell.setAttribute("inert", "")
      return
    }

    interactiveShell.removeAttribute("inert")
  }, [detail])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      if (isTwinExpanded) {
        setIsTwinExpanded(false)
        return
      }
      if (viewState === "inside") {
        setEnteredPlanetId(undefined)
        setViewState("overview")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isTwinExpanded, viewState])

  function askTwin(planetId: string) {
    setFocusedPlanetId(planetId)
    setIsTwinExpanded(true)
  }

  function showRelated(planetId: string) {
    setFocusedPlanetId(planetId)
    setRelatedScopePlanetId(planetId)
    setEnteredPlanetId(undefined)
    setHoveredPlanetId(undefined)
    setHoverPoint(undefined)
    setViewState("overview")
  }

  function clearRelatedScope() {
    setRelatedScopePlanetId(undefined)
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
          contextCard: activeContextPlanet
            ? {
                category: "行星",
                id: activeContextPlanet.id,
                planetId: activeContextPlanet.planetId,
                title: activeContextPlanet.name,
              }
            : undefined,
          focusedPlanetId: activeContextPlanet?.planetId,
          history,
          message,
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
          content: "当前无法连接数字分身，我已经保留了你的问题。",
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
      data-motion-paused={isMotionPaused ? "true" : "false"}
      data-related-scope={relatedScopePlanetId ? "true" : "false"}
      data-theme={theme}
      data-view-state={viewState}
      className="null-space-shell relative isolate min-h-screen overflow-hidden"
    >
      <div className="null-space-grid absolute inset-0" aria-hidden="true" />
      <div className="null-space-noise absolute inset-0" aria-hidden="true" />
      <div
        className="null-space-vignette absolute inset-0"
        aria-hidden="true"
      />
      <div
        ref={interactiveShellRef}
        data-testid="universe-interactive-shell"
        aria-hidden={detail ? "true" : undefined}
      >
        <UniverseSidebar />
        <UniverseTopbar theme={theme} onToggleTheme={toggleTheme} />
        <UniverseCanvas
          planets={universe.planets}
          threeScene={threeScene}
          focusedPlanetId={effectiveFocusedPlanetId}
          hoveredPlanetId={hoveredPlanetId}
          relatedScopePlanetId={relatedScopePlanetId}
          hoverPoint={hoverPoint}
          detail={detail}
          enteredPlanetId={enteredPlanetId}
          zoom={zoom}
          pan={pan}
          isMotionPaused={isMotionPaused}
          isReducedMotion={isReducedMotion}
          viewState={viewState}
          onSelectPlanet={selectPlanet}
          onAskTwinPlanet={askTwin}
          onEnterPlanet={enterPlanet}
          onHoverPlanet={hoverPlanet}
          onLeavePlanet={leavePlanet}
          onClearRelatedPlanets={clearRelatedScope}
          onShowRelatedPlanet={showRelated}
          onWheelZoom={zoomFromWheel}
        />
        <div className="pointer-events-none absolute right-9 bottom-5 z-20 hidden items-center gap-5 font-mono text-xs text-[var(--ns-text-muted)] md:flex">
          <span>{props.essays.length} 文章</span>
          <span>{props.planets.length} 连接</span>
          <span>无限可能</span>
        </div>
      </div>
      {!detail || isTwinExpanded ? (
        <TwinOrb
          identity={props.twinIdentity}
          contextCard={contextCard}
          memoriesCount={props.memories.length}
          draftMessage={draftMessage}
          isExpanded={isTwinExpanded}
          isSending={isSending}
          messages={messages}
          onDraftChange={setDraftMessage}
          onSubmit={submitMessage}
          onToggle={() => setIsTwinExpanded((current) => !current)}
        />
      ) : null}
      {detail ? (
        <PlanetDetailOverlay
          detail={detail}
          isModal={!isTwinExpanded}
          isRelatedScopeActive={relatedScopePlanetId === detail.card.id}
          onAskTwin={() => askTwin(detail.card.id)}
          onClearRelated={clearRelatedScope}
          onLeave={leavePlanetDetail}
          onShowRelated={() => showRelated(detail.card.id)}
        />
      ) : null}
    </div>
  )
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function subscribeToReducedMotionPreference(onStoreChange: () => void) {
  const mediaQueryList = getReducedMotionMediaQueryList()

  if (!mediaQueryList) {
    return () => {}
  }

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", onStoreChange)

    return () => mediaQueryList.removeEventListener("change", onStoreChange)
  }

  if (typeof mediaQueryList.addListener === "function") {
    mediaQueryList.addListener(onStoreChange)

    return () => mediaQueryList.removeListener(onStoreChange)
  }

  return () => {}
}

function getReducedMotionPreferenceSnapshot() {
  return getReducedMotionMediaQueryList()?.matches ?? false
}

function getReducedMotionPreferenceServerSnapshot() {
  return false
}

function getReducedMotionMediaQueryList() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return undefined
  }

  return window.matchMedia(REDUCED_MOTION_QUERY)
}

function buildPlanetDetail(
  planet: PlanetUniverseBodyModel,
  { essays, memories, notes, projects }: HomePageViewProps
): PlanetDetailModel {
  const card = buildContextCard(planet)
  const publicPlanetMemories = memories
    .filter(
      (memory) =>
        memory.visibility === "public" && memory.planetId === planet.planetId
    )
  const keyMemories = publicPlanetMemories
    .slice(0, 3)
    .map((memory) => memory.title)
  const relatedTitles = [...essays, ...projects, ...notes]
    .map((item) => item.title)
    .slice(0, 4)

  return {
    card,
    counts: {
      essays: essays.length,
      memories: publicPlanetMemories.length,
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

function buildContextCard(planet: PlanetUniverseBodyModel): UniverseCardModel {
  const angle = planet.orbit.startAngle
  const radians = (angle * Math.PI) / 180
  const width = planet.size
  const height = planet.size

  return {
    id: planet.id,
    kind: "planet",
    group: planet.slug,
    importance: Math.max(
      1,
      planet.publicMemoryCount + planet.assistantMemoryCount
    ),
    width,
    height,
    x: 480 + Math.cos(radians) * planet.orbit.radius - width / 2,
    y: 330 + Math.sin(radians) * planet.orbit.radius - height / 2,
    ring: planet.level,
    angle,
    posture: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateZ: 0,
    },
    layoutStatus: "placed",
    category: "行星",
    title: planet.name,
    excerpt: planet.summary,
    date: "2024.05.12",
    tone: planet.tone,
    status: "mature",
    planetId: planet.planetId,
  }
}
