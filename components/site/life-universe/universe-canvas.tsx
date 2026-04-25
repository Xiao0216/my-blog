import type { CSSProperties, MouseEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import type {
  CanvasPan,
  PlanetDetailModel,
  UniverseCardModel,
  UniverseViewState,
} from "@/components/site/life-universe/types"
import { UniverseCard } from "@/components/site/life-universe/universe-card"

const BASE_ZOOM = 78
const AMBIENT_STARS = [
  { delay: "0s", dx: "18px", dy: "-14px", left: "12%", size: 5, top: "18%" },
  { delay: "1.1s", dx: "-16px", dy: "10px", left: "24%", size: 3, top: "72%" },
  { delay: "2.3s", dx: "12px", dy: "18px", left: "42%", size: 4, top: "28%" },
  { delay: "0.7s", dx: "-20px", dy: "-8px", left: "62%", size: 5, top: "66%" },
  { delay: "1.8s", dx: "14px", dy: "-18px", left: "76%", size: 3, top: "22%" },
  { delay: "3.2s", dx: "-12px", dy: "16px", left: "88%", size: 4, top: "48%" },
] as const

export function UniverseCanvas({
  cards,
  selectedCardId,
  relatedScopeCardId,
  detail,
  enteredCardId,
  zoom,
  pan,
  hasPlanets,
  viewState,
  onSelectCard,
  onAskTwin,
  onEnterCard,
  onPanChange,
  onShowRelated,
  onWheelZoom,
}: {
  readonly cards: ReadonlyArray<UniverseCardModel>
  readonly selectedCardId: string
  readonly relatedScopeCardId?: string
  readonly detail?: PlanetDetailModel
  readonly enteredCardId?: string
  readonly zoom: number
  readonly pan: CanvasPan
  readonly hasPlanets: boolean
  readonly viewState: UniverseViewState
  readonly onSelectCard: (cardId: string) => void
  readonly onAskTwin: (cardId: string) => void
  readonly onEnterCard: (cardId: string) => void
  readonly onPanChange: (pan: CanvasPan) => void
  readonly onShowRelated: (cardId: string) => void
  readonly onWheelZoom: (deltaY: number) => void
}) {
  const [isCameraGestureActive, setIsCameraGestureActive] = useState(false)
  const cameraScale = detail ? 1.28 : zoom / BASE_ZOOM
  const cameraPan = detail
    ? {
        x: 480 - detail.card.x - detail.card.width / 2,
        y: 330 - detail.card.y - detail.card.height / 2,
      }
    : pan
  const cameraTransform = `translate(${cameraPan.x}px, ${cameraPan.y}px) scale(${cameraScale})`
  const canvasRef = useRef<HTMLElement | null>(null)
  const dragStartRef = useRef<
    | {
        readonly clientX: number
        readonly clientY: number
        readonly pan: CanvasPan
      }
    | undefined
  >(undefined)
  const panFrameRef = useRef<number | undefined>(undefined)
  const wheelFrameRef = useRef<number | undefined>(undefined)
  const wheelDeltaRef = useRef(0)
  const cameraGestureActiveRef = useRef(false)
  const cameraGestureTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const onPanChangeRef = useRef(onPanChange)
  const onWheelZoomRef = useRef(onWheelZoom)
  const onEnterCardRef = useRef(onEnterCard)
  const onSelectCardRef = useRef(onSelectCard)
  const onAskTwinRef = useRef(onAskTwin)
  const onShowRelatedRef = useRef(onShowRelated)
  const isRelatedScopeActive = Boolean(relatedScopeCardId)

  const activateCameraGesture = useCallback(() => {
    if (!cameraGestureActiveRef.current) {
      cameraGestureActiveRef.current = true
      setIsCameraGestureActive(true)
    }

    if (cameraGestureTimeoutRef.current !== undefined) {
      clearTimeout(cameraGestureTimeoutRef.current)
    }

    cameraGestureTimeoutRef.current = setTimeout(() => {
      cameraGestureActiveRef.current = false
      cameraGestureTimeoutRef.current = undefined
      setIsCameraGestureActive(false)
    }, 140)
  }, [])

  const scheduleWheel = useCallback((deltaY: number) => {
    activateCameraGesture()

    if (typeof requestAnimationFrame === "undefined") {
      onWheelZoomRef.current(deltaY)
      return
    }

    if (wheelFrameRef.current !== undefined) {
      wheelDeltaRef.current += deltaY
      return
    }

    wheelDeltaRef.current += deltaY
    wheelFrameRef.current = requestAnimationFrame(() => {
      const nextDelta = wheelDeltaRef.current

      wheelDeltaRef.current = 0
      wheelFrameRef.current = undefined
      onWheelZoomRef.current(nextDelta)
    })
  }, [activateCameraGesture])

  useEffect(() => {
    onPanChangeRef.current = onPanChange
  }, [onPanChange])

  useEffect(() => {
    onWheelZoomRef.current = onWheelZoom
  }, [onWheelZoom])

  useEffect(() => {
    onEnterCardRef.current = onEnterCard
  }, [onEnterCard])

  useEffect(() => {
    onSelectCardRef.current = onSelectCard
  }, [onSelectCard])

  useEffect(() => {
    onAskTwinRef.current = onAskTwin
  }, [onAskTwin])

  useEffect(() => {
    onShowRelatedRef.current = onShowRelated
  }, [onShowRelated])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    function handleNativeWheel(event: globalThis.WheelEvent) {
      event.preventDefault()
      scheduleWheel(event.deltaY)
    }

    // Trackpad pinch zoom must be canceled by a non-passive native listener.
    canvas.addEventListener("wheel", handleNativeWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleNativeWheel)
  }, [scheduleWheel])

  useEffect(() => {
    return () => {
      if (
        panFrameRef.current !== undefined &&
        typeof cancelAnimationFrame !== "undefined"
      ) {
        cancelAnimationFrame(panFrameRef.current)
      }
      if (
        wheelFrameRef.current !== undefined &&
        typeof cancelAnimationFrame !== "undefined"
      ) {
        cancelAnimationFrame(wheelFrameRef.current)
      }
      if (cameraGestureTimeoutRef.current !== undefined) {
        clearTimeout(cameraGestureTimeoutRef.current)
      }
    }
  }, [])

  function schedulePan(nextPan: CanvasPan) {
    activateCameraGesture()

    if (typeof requestAnimationFrame === "undefined") {
      onPanChangeRef.current(nextPan)
      return
    }

    if (panFrameRef.current !== undefined) {
      cancelAnimationFrame(panFrameRef.current)
    }

    panFrameRef.current = requestAnimationFrame(() => {
      panFrameRef.current = undefined
      onPanChangeRef.current(nextPan)
    })
  }

  const handleCardEnter = useCallback((cardId: string) => {
    onEnterCardRef.current(cardId)
  }, [])

  const handleCardSelect = useCallback((cardId: string) => {
    onSelectCardRef.current(cardId)
  }, [])

  const handleCardAskTwin = useCallback((cardId: string) => {
    onAskTwinRef.current(cardId)
  }, [])

  const handleCardShowRelated = useCallback((cardId: string) => {
    onShowRelatedRef.current(cardId)
  }, [])

  function handleMouseDown(event: MouseEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) {
      return
    }

    dragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      pan,
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const dragStart = dragStartRef.current

    if (!dragStart) {
      return
    }

    schedulePan({
      x: dragStart.pan.x + event.clientX - dragStart.clientX,
      y: dragStart.pan.y + event.clientY - dragStart.clientY,
    })
  }

  function stopDrag() {
    dragStartRef.current = undefined
  }

  function handleMouseLeave() {
    stopDrag()
  }

  return (
    <section
      ref={canvasRef}
      role="region"
      aria-label="Null Space universe canvas"
      data-camera-gesture={isCameraGestureActive ? "true" : "false"}
      data-related-scope={isRelatedScopeActive ? "true" : "false"}
      data-view-state={viewState}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto absolute inset-x-3 top-20 bottom-24 cursor-grab overflow-hidden active:cursor-grabbing md:left-20 md:right-6 md:top-20 md:bottom-20"
    >
      <div className="absolute inset-0 rounded-[2rem] border border-[var(--ns-glass-border)] bg-[var(--ns-canvas-wash)]" />
      <div
        data-testid="universe-ambient-field"
        aria-hidden="true"
        className="universe-ambient-field"
      >
        {AMBIENT_STARS.map((star) => (
          <span
            key={`${star.left}-${star.top}`}
            style={
              {
                "--star-dx": star.dx,
                "--star-dy": star.dy,
                "--star-size": `${star.size}px`,
                animationDelay: star.delay,
                left: star.left,
                top: star.top,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {!hasPlanets ? (
        <div className="null-space-panel absolute left-1/2 top-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 p-4 text-center text-sm text-[var(--ns-text-tertiary)]">
          No planets in this universe yet
        </div>
      ) : null}

      <div
        data-testid="universe-viewport"
        data-camera-mode={viewState === "inside" ? "inside" : "overview"}
        data-related-scope={isRelatedScopeActive ? "true" : "false"}
        className="universe-scene-3d absolute left-1/2 top-1/2 h-[660px] w-[960px] origin-center"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          data-testid="universe-camera"
          className="universe-camera absolute inset-0 h-full w-full origin-center"
          style={{
            transform: cameraTransform,
          }}
        >
          <svg
            data-universe-lines="true"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-70"
            viewBox="0 0 960 660"
          >
            <path
              d="M135 134 L365 245 L505 112 L742 256 L623 454 L426 455 L260 360 L135 134"
              fill="none"
              className="connection-line"
              strokeWidth="1"
            />
            <path
              d="M260 360 L445 315 L623 454 M445 315 L742 256 M365 245 L445 315"
              fill="none"
              className="connection-line animated"
              strokeWidth="1"
            />
            {[
              [135, 134],
              [365, 245],
              [505, 112],
              [742, 256],
              [623, 454],
              [426, 455],
              [260, 360],
              [445, 315],
            ].map(([cx, cy], index) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="3"
                className="constellation-node"
                fill="var(--ns-accent-secondary)"
                style={
                  {
                    "--node-delay": `${index * 0.34}s`,
                  } as CSSProperties
                }
              />
            ))}
          </svg>

          {cards.map((card) => (
            <UniverseCard
              key={card.id}
              card={card}
              isEntered={card.id === enteredCardId}
              isRelated={!relatedScopeCardId || card.id === relatedScopeCardId}
              isSelected={card.id === selectedCardId}
              onAskTwin={handleCardAskTwin}
              onEnter={handleCardEnter}
              onSelect={handleCardSelect}
              onShowRelated={handleCardShowRelated}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {cards.map((card) => (
          <article
            key={card.id}
            data-testid="mobile-universe-card"
            data-card-id={card.id}
            data-related={!relatedScopeCardId || card.id === relatedScopeCardId ? "true" : "false"}
            data-selected={card.id === selectedCardId ? "true" : "false"}
            className="null-space-panel p-4 text-left data-[selected=true]:border-[var(--ns-accent-primary)]"
          >
            <span className="font-mono text-[0.68rem] text-[var(--ns-text-tertiary)]">
              {card.category}
            </span>
            <span className="mt-2 block font-semibold text-[var(--ns-text-primary)]">
              {card.title}
            </span>
            <span className="mt-2 block text-sm leading-6 text-[var(--ns-text-tertiary)]">
              {card.excerpt}
            </span>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                aria-label={`移动端进入 ${card.title}`}
                onClick={() => onEnterCard(card.id)}
              >
                进入
              </button>
              <button
                type="button"
                aria-label={`移动端询问 ${card.title}`}
                onClick={() => onAskTwin(card.id)}
              >
                问 AI
              </button>
              <button
                type="button"
                aria-label={`移动端查看 ${card.title} 关联`}
                onClick={() => onShowRelated(card.id)}
              >
                关联
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function isInteractiveTarget(target: EventTarget) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.closest('[data-universe-card-menu="true"]')) {
    return true
  }

  if (target.closest('[data-testid="universe-card"]')) {
    return false
  }

  return Boolean(target.closest("button,input,textarea,a"))
}
