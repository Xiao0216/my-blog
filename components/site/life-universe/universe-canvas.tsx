import type { MouseEvent, WheelEvent } from "react"
import { useCallback, useEffect, useRef } from "react"

import type {
  CanvasPan,
  PlanetDetailModel,
  UniverseCardModel,
  UniverseViewState,
} from "@/components/site/life-universe/types"
import { PlanetDetailOverlay } from "@/components/site/life-universe/planet-detail-overlay"
import { UniverseCard } from "@/components/site/life-universe/universe-card"

const VIEWPORT_WIDTH = 960
const VIEWPORT_HEIGHT = 660
const ACTION_GROUP_WIDTH = 180
const ACTION_GROUP_HEIGHT = 48
const ACTION_GROUP_GAP = 14
const ACTION_GROUP_TOP_MARGIN = 8

export function UniverseCanvas({
  cards,
  selectedCardId,
  detail,
  enteredCardId,
  zoom,
  pan,
  hasPlanets,
  viewState,
  onSelectCard,
  onAskTwin,
  onEnterCard,
  onLeaveCard,
  onPanChange,
  onShowRelated,
  onWheelZoom,
}: {
  readonly cards: ReadonlyArray<UniverseCardModel>
  readonly selectedCardId: string
  readonly detail?: PlanetDetailModel
  readonly enteredCardId?: string
  readonly zoom: number
  readonly pan: CanvasPan
  readonly hasPlanets: boolean
  readonly viewState: UniverseViewState
  readonly onSelectCard: (cardId: string) => void
  readonly onAskTwin: (cardId: string) => void
  readonly onEnterCard: (cardId: string) => void
  readonly onLeaveCard: () => void
  readonly onPanChange: (pan: CanvasPan) => void
  readonly onShowRelated: (cardId: string) => void
  readonly onWheelZoom: (deltaY: number) => void
}) {
  const selectedCard = cards.find((card) => card.id === selectedCardId)
  const actionGroupPosition = selectedCard
    ? getActionGroupPosition(selectedCard)
    : undefined
  const cameraTransform = detail
    ? `translate(calc(-50% + ${480 - detail.card.x - detail.card.width / 2}px), calc(-50% + ${330 - detail.card.y - detail.card.height / 2}px)) scale(1.28)`
    : `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom / 78})`
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
  const onPanChangeRef = useRef(onPanChange)
  const onWheelZoomRef = useRef(onWheelZoom)
  const onEnterCardRef = useRef(onEnterCard)
  const onSelectCardRef = useRef(onSelectCard)

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
    }
  }, [])

  function schedulePan(nextPan: CanvasPan) {
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

  function scheduleWheel(deltaY: number) {
    if (typeof requestAnimationFrame === "undefined") {
      onWheelZoomRef.current(deltaY)
      return
    }

    if (wheelFrameRef.current !== undefined) {
      cancelAnimationFrame(wheelFrameRef.current)
    }

    wheelFrameRef.current = requestAnimationFrame(() => {
      wheelFrameRef.current = undefined
      onWheelZoomRef.current(deltaY)
    })
  }

  const handleCardEnter = useCallback((cardId: string) => {
    onEnterCardRef.current(cardId)
  }, [])

  const handleCardSelect = useCallback((cardId: string) => {
    onSelectCardRef.current(cardId)
  }, [])

  function handleWheel(event: WheelEvent<HTMLElement>) {
    event.preventDefault()
    scheduleWheel(event.deltaY)
  }

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

  return (
    <section
      role="region"
      aria-label="Null Space universe canvas"
      data-view-state={viewState}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      className="pointer-events-auto absolute inset-x-3 top-20 bottom-24 cursor-grab overflow-hidden active:cursor-grabbing md:left-20 md:right-6 md:top-20 md:bottom-20"
    >
      <div className="absolute inset-0 rounded-[2rem] border border-[var(--ns-glass-border)] bg-[var(--ns-canvas-wash)]" />
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
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="3"
            fill="var(--ns-accent-secondary)"
          />
        ))}
      </svg>

      {!hasPlanets ? (
        <div className="null-space-panel absolute left-1/2 top-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 p-4 text-center text-sm text-[var(--ns-text-tertiary)]">
          No planets in this universe yet
        </div>
      ) : null}

      <div
        data-testid="universe-viewport"
        data-camera-mode={viewState === "inside" ? "inside" : "overview"}
        className="universe-scene-3d absolute left-1/2 top-1/2 h-[660px] w-[960px] origin-center"
        style={{
          transform: cameraTransform,
        }}
      >
        {cards.map((card) => (
          <UniverseCard
            key={card.id}
            card={card}
            isEntered={card.id === enteredCardId}
            isSelected={card.id === selectedCardId}
            onEnter={handleCardEnter}
            onSelect={handleCardSelect}
          />
        ))}

        {selectedCard && !detail ? (
          <div
            data-testid="planet-action-group"
            data-layout-x={actionGroupPosition?.x}
            data-layout-y={actionGroupPosition?.y}
            className="planet-action-group"
            style={{
              left: actionGroupPosition?.x,
              top: actionGroupPosition?.y,
              width: ACTION_GROUP_WIDTH,
            }}
          >
            <button
              type="button"
              aria-label={`进入 ${selectedCard.title}`}
              onClick={() => onEnterCard(selectedCard.id)}
            >
              进入
            </button>
            <button
              type="button"
              aria-label={`询问 ${selectedCard.title}`}
              onClick={() => onAskTwin(selectedCard.id)}
            >
              问 AI
            </button>
            <button
              type="button"
              aria-label={`查看 ${selectedCard.title} 关联`}
              onClick={() => onShowRelated(selectedCard.id)}
            >
              关联
            </button>
          </div>
        ) : null}

      </div>

      {detail ? (
        <PlanetDetailOverlay
          detail={detail}
          onAskTwin={() => onAskTwin(detail.card.id)}
          onLeave={onLeaveCard}
        />
      ) : null}

      <div className="grid gap-3 md:hidden">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            aria-label={`移动聚焦 ${card.title}`}
            data-selected={card.id === selectedCardId ? "true" : "false"}
            onClick={() => onSelectCard(card.id)}
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
          </button>
        ))}
      </div>
    </section>
  )
}

function isInteractiveTarget(target: EventTarget) {
  return target instanceof HTMLElement
    ? Boolean(target.closest("button,input,textarea,a"))
    : false
}

function getActionGroupPosition(selectedCard: UniverseCardModel) {
  const preferredRightX =
    selectedCard.x + selectedCard.width + ACTION_GROUP_GAP
  const shouldFlipLeft =
    preferredRightX + ACTION_GROUP_WIDTH > VIEWPORT_WIDTH
  const x = shouldFlipLeft
    ? selectedCard.x - ACTION_GROUP_WIDTH - ACTION_GROUP_GAP
    : preferredRightX
  const y = selectedCard.y + ACTION_GROUP_TOP_MARGIN

  return {
    x: clamp(x, 0, VIEWPORT_WIDTH - ACTION_GROUP_WIDTH),
    y: clamp(y, 0, VIEWPORT_HEIGHT - ACTION_GROUP_HEIGHT),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
