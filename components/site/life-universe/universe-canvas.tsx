import type { CSSProperties, MouseEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import type { MinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import type {
  CanvasPan,
  PlanetUniverseBodyModel,
  PlanetDetailModel,
  UniverseViewState,
} from "@/components/site/life-universe/types"
import {
  PlanetBody,
  type PlanetPoint,
} from "@/components/site/life-universe/planet-body"
import { PlanetHoverPreview } from "@/components/site/life-universe/planet-hover-preview"
import { PlanetUniverseScene } from "@/components/site/life-universe/planet-universe-scene"
import {
  buildPlanetPreview,
  getPlanetRenderLevel,
} from "@/components/site/life-universe/planet-universe-model"

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
  planets,
  threeScene,
  focusedPlanetId,
  hoveredPlanetId,
  relatedScopePlanetId,
  hoverPoint,
  detail,
  enteredPlanetId,
  zoom,
  pan,
  isMotionPaused,
  isReducedMotion,
  viewState,
  onSelectPlanet,
  onAskTwinPlanet,
  onEnterPlanet,
  onHoverPlanet,
  onLeavePlanet,
  onPanChange,
  onShowRelatedPlanet,
  onWheelZoom,
}: {
  readonly planets: ReadonlyArray<PlanetUniverseBodyModel>
  readonly threeScene: MinimalThreeScene
  readonly focusedPlanetId?: string
  readonly hoveredPlanetId?: string
  readonly relatedScopePlanetId?: string
  readonly hoverPoint?: PlanetPoint
  readonly detail?: PlanetDetailModel
  readonly enteredPlanetId?: string
  readonly zoom: number
  readonly pan: CanvasPan
  readonly isMotionPaused: boolean
  readonly isReducedMotion: boolean
  readonly viewState: UniverseViewState
  readonly onSelectPlanet: (planetId: string, point: PlanetPoint) => void
  readonly onAskTwinPlanet: (planetId: string) => void
  readonly onEnterPlanet: (planetId: string) => void
  readonly onHoverPlanet: (planetId: string, point: PlanetPoint) => void
  readonly onLeavePlanet: (planetId: string) => void
  readonly onPanChange: (pan: CanvasPan) => void
  readonly onShowRelatedPlanet: (planetId: string) => void
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
  const cameraGestureTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)
  const onPanChangeRef = useRef(onPanChange)
  const onWheelZoomRef = useRef(onWheelZoom)
  const onEnterPlanetRef = useRef(onEnterPlanet)
  const onSelectPlanetRef = useRef(onSelectPlanet)
  const onHoverPlanetRef = useRef(onHoverPlanet)
  const onLeavePlanetRef = useRef(onLeavePlanet)
  const isRelatedScopeActive = Boolean(relatedScopePlanetId)
  const hoveredPlanet = planets.find((planet) => planet.id === hoveredPlanetId)

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

  const scheduleWheel = useCallback(
    (deltaY: number) => {
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
    },
    [activateCameraGesture]
  )

  useEffect(() => {
    onPanChangeRef.current = onPanChange
  }, [onPanChange])

  useEffect(() => {
    onWheelZoomRef.current = onWheelZoom
  }, [onWheelZoom])

  useEffect(() => {
    onEnterPlanetRef.current = onEnterPlanet
  }, [onEnterPlanet])

  useEffect(() => {
    onSelectPlanetRef.current = onSelectPlanet
  }, [onSelectPlanet])

  useEffect(() => {
    onHoverPlanetRef.current = onHoverPlanet
  }, [onHoverPlanet])

  useEffect(() => {
    onLeavePlanetRef.current = onLeavePlanet
  }, [onLeavePlanet])

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

  const handlePlanetEnter = useCallback((planetId: string) => {
    onEnterPlanetRef.current(planetId)
  }, [])

  const handlePlanetSelect = useCallback(
    (planetId: string, point: PlanetPoint) => {
      onSelectPlanetRef.current(planetId, point)
    },
    []
  )

  const handlePlanetHover = useCallback(
    (planetId: string, point: PlanetPoint) => {
      onHoverPlanetRef.current(planetId, point)
    },
    []
  )

  const handlePlanetLeave = useCallback((planetId: string) => {
    onLeavePlanetRef.current(planetId)
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
      aria-label="空境宇宙画布"
      data-camera-gesture={isCameraGestureActive ? "true" : "false"}
      data-related-scope={isRelatedScopeActive ? "true" : "false"}
      data-view-state={viewState}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto absolute inset-x-3 top-20 bottom-24 cursor-grab overflow-hidden active:cursor-grabbing md:top-20 md:right-6 md:bottom-20 md:left-20"
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

      {planets.length === 0 ? (
        <div className="null-space-panel absolute top-1/2 left-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 p-4 text-center text-sm text-[var(--ns-text-tertiary)]">
          这个宇宙还没有星球。
        </div>
      ) : null}

      <div
        data-testid="universe-viewport"
        data-camera-mode={viewState === "inside" ? "inside" : "overview"}
        data-motion-paused={isMotionPaused ? "true" : "false"}
        data-related-scope={isRelatedScopeActive ? "true" : "false"}
        className="universe-scene-3d absolute inset-0 origin-center"
      >
        <div
          data-testid="universe-camera"
          className="universe-camera absolute inset-0 h-full w-full origin-center"
          style={{
            transform: cameraTransform,
          }}
        >
          <PlanetUniverseScene
            scene={threeScene}
            focusedPlanetId={focusedPlanetId}
            hoveredPlanetId={hoveredPlanetId}
            isMotionPaused={isMotionPaused}
            isReducedMotion={isReducedMotion}
            onEnterPlanet={handlePlanetEnter}
            onHoverPlanet={handlePlanetHover}
            onLeavePlanet={handlePlanetLeave}
          />
          <div className="planet-accessibility-controls absolute inset-0">
            <div className="planet-orbit-system absolute inset-0">
              {planets.map((planet) => {
                const isFocused = planet.id === focusedPlanetId
                const isHovered = planet.id === hoveredPlanetId
                const isRelated =
                  !relatedScopePlanetId || planet.id === relatedScopePlanetId
                const renderLevel = getPlanetRenderLevel({
                  distanceFromFocus: Math.abs(
                    planet.orbit.radius -
                      (planets.find((item) => item.id === focusedPlanetId)?.orbit
                        .radius ?? planet.orbit.radius)
                  ),
                  isFocused,
                  isHovered,
                  totalPlanets: planets.length,
                })

                return (
                  <div
                    key={planet.id}
                    data-planet-orbit-id={planet.id}
                    data-entered={
                      planet.id === enteredPlanetId ? "true" : "false"
                    }
                    data-related={isRelated ? "true" : "false"}
                    className="planet-orbit"
                  >
                    <div
                      aria-hidden="true"
                      className="planet-orbit-path"
                      style={
                        {
                          "--planet-orbit-radius": `${planet.orbit.radius}px`,
                        } as CSSProperties
                      }
                    />
                    <PlanetBody
                      planet={planet}
                      isFocused={isFocused}
                      isHovered={isHovered}
                      renderLevel={renderLevel}
                      onEnter={handlePlanetEnter}
                      onHover={handlePlanetHover}
                      onLeave={handlePlanetLeave}
                      onSelect={handlePlanetSelect}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {planets.map((planet) => (
          <article
            key={planet.id}
            data-testid="mobile-planet-card"
            data-planet-id={planet.id}
            data-related={
              !relatedScopePlanetId || planet.id === relatedScopePlanetId
                ? "true"
                : "false"
            }
            data-selected={planet.id === focusedPlanetId ? "true" : "false"}
            className="null-space-panel p-4 text-left data-[selected=true]:border-[var(--ns-accent-primary)]"
          >
            <span className="font-mono text-[0.68rem] text-[var(--ns-text-tertiary)]">
              行星
            </span>
            <span className="mt-2 block font-semibold text-[var(--ns-text-primary)]">
              {planet.name}
            </span>
            <span className="mt-2 block text-sm leading-6 text-[var(--ns-text-tertiary)]">
              {planet.summary}
            </span>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                aria-label={`移动端进入 ${planet.name}`}
                onClick={() => onEnterPlanet(planet.id)}
              >
                进入
              </button>
              <button
                type="button"
                aria-label={`移动端询问 ${planet.name}`}
                onClick={() => onAskTwinPlanet(planet.id)}
              >
                问分身
              </button>
              <button
                type="button"
                aria-label={`移动端查看 ${planet.name} 关联`}
                onClick={() => onShowRelatedPlanet(planet.id)}
              >
                关联
              </button>
            </div>
          </article>
        ))}
      </div>
      {hoveredPlanet && hoverPoint ? (
        <PlanetHoverPreview
          anchor={hoverPoint}
          preview={buildPlanetPreview(hoveredPlanet)}
          onEnter={() => handlePlanetEnter(hoveredPlanet.id)}
        />
      ) : null}
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

  if (
    target.closest('[data-testid="universe-card"]') ||
    target.closest('[data-testid="planet-body"]')
  ) {
    return false
  }

  return Boolean(target.closest("button,input,textarea,a"))
}
