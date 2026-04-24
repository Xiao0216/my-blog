"use client"

import { Minus, Plus, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

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
}

type NodeKind = "Essay" | "Project" | "Note"

type SpatialNode = {
  id: string
  kind: NodeKind
  title: string
  description: string
  href: string
  date?: string
  x: number
  y: number
  size: "large" | "medium" | "small"
}

type Viewport = {
  x: number
  y: number
  scale: number
}

const essayCoordinates = [
  { x: 220, y: 120 },
  { x: 670, y: 360 },
  { x: 420, y: 640 },
]

const projectCoordinates = [
  { x: 560, y: 120 },
  { x: 900, y: 420 },
  { x: 180, y: 520 },
]

const noteCoordinates = [
  { x: 820, y: 180 },
  { x: 360, y: 330 },
  { x: 720, y: 650 },
]

export function HomePageView({
  profile,
  essays,
  notes,
  projects,
}: HomePageViewProps) {
  const nodes = useMemo(
    () => buildSpatialNodes({ essays, notes, projects }),
    [essays, notes, projects]
  )
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 })
  const [dragStart, setDragStart] = useState<{
    pointerX: number
    pointerY: number
    viewportX: number
    viewportY: number
  } | null>(null)
  const [focusedNodeId, setFocusedNodeId] = useState(nodes[0]?.id ?? "")
  const focusedNode = nodes.find((node) => node.id === focusedNodeId) ?? nodes[0]

  function updateScale(delta: number) {
    setViewport((current) => ({
      ...current,
      scale: Math.min(1.45, Math.max(0.72, Number((current.scale + delta).toFixed(2)))),
    }))
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#050608] text-zinc-50">
      <div className="spatial-grid absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(20,184,166,0.16),transparent_28%),radial-gradient(circle_at_78%_32%,rgba(148,163,184,0.13),transparent_28%),linear-gradient(180deg,rgba(5,6,8,0.1),rgba(5,6,8,0.94))]" />
      <div className="absolute inset-0 spatial-noise opacity-[0.07]" aria-hidden="true" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)_310px]">
          <IdentityConsole profile={profile} nodes={nodes} />

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/70 uppercase">
                  Spatial Index
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-50">知识星图</h2>
              </div>
              <div className="flex items-center gap-2">
                <CanvasControl label="缩小" onClick={() => updateScale(-0.1)}>
                  <Minus className="h-4 w-4" />
                </CanvasControl>
                <CanvasControl label="放大" onClick={() => updateScale(0.1)}>
                  <Plus className="h-4 w-4" />
                </CanvasControl>
                <CanvasControl
                  label="重置视角"
                  onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
                >
                  <RotateCcw className="h-4 w-4" />
                </CanvasControl>
              </div>
            </div>

            <div
              role="region"
              aria-label="Spatial knowledge canvas"
              className="relative hidden h-[680px] cursor-grab overflow-hidden rounded-lg border border-white/10 bg-zinc-950/50 shadow-2xl shadow-black/40 backdrop-blur md:block"
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
                <GraphLines nodes={nodes} />
                {nodes.map((node) => (
                  <SpatialNodeButton
                    key={node.id}
                    node={node}
                    isFocused={node.id === focusedNode?.id}
                    onFocus={() => setFocusedNodeId(node.id)}
                  />
                ))}
                {nodes.length === 0 ? <OrbitEmptyState /> : null}
              </div>
            </div>

            <MobileConstellation nodes={nodes} onFocus={setFocusedNodeId} />
          </div>

          <FocusPanel node={focusedNode} />
        </div>
      </section>
    </div>
  )
}

function buildSpatialNodes({
  essays,
  notes,
  projects,
}: Pick<HomePageViewProps, "essays" | "notes" | "projects">): ReadonlyArray<SpatialNode> {
  return [
    ...essays.map((essay, index) => ({
      id: `essay-${essay.slug}`,
      kind: "Essay" as const,
      title: essay.title,
      description: essay.description,
      href: `/essays/${essay.slug}`,
      date: essay.publishedAt,
      size: "large" as const,
      ...essayCoordinates[index % essayCoordinates.length],
    })),
    ...projects.map((project, index) => ({
      id: `project-${project.slug}`,
      kind: "Project" as const,
      title: project.title,
      description: project.note || project.description,
      href: "/projects",
      size: "medium" as const,
      ...projectCoordinates[index % projectCoordinates.length],
    })),
    ...notes.map((note, index) => ({
      id: `note-${note.slug}`,
      kind: "Note" as const,
      title: note.title,
      description: note.body,
      href: "/notes",
      date: note.publishedAt,
      size: "small" as const,
      ...noteCoordinates[index % noteCoordinates.length],
    })),
  ]
}

function IdentityConsole({
  profile,
  nodes,
}: {
  readonly profile: HomePageProfile
  readonly nodes: ReadonlyArray<SpatialNode>
}) {
  return (
    <aside className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/70 uppercase">
        Identity Console
      </p>
      <h1 className="mt-4 text-2xl font-semibold leading-tight text-zinc-50">
        {profile.heroTitle}
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400">{profile.heroIntro}</p>
      <div className="mt-6 grid gap-3 border-t border-white/10 pt-4 font-mono text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <span>nodes</span>
          <span className="text-zinc-100">{nodes.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>mode</span>
          <span className="text-teal-200">pan / zoom / focus</span>
        </div>
        <div className="flex items-center justify-between">
          <span>signal</span>
          <span className="text-zinc-100">live from SQLite</span>
        </div>
      </div>
      <p className="mt-6 text-sm leading-7 text-zinc-500">{profile.aboutSummary}</p>
    </aside>
  )
}

function CanvasControl({
  label,
  onClick,
  children,
}: {
  readonly label: string
  readonly onClick: () => void
  readonly children: React.ReactNode
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

function GraphLines({ nodes }: { readonly nodes: ReadonlyArray<SpatialNode> }) {
  if (nodes.length < 2) {
    return (
      <svg
        data-spatial-lines="true"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
    )
  }

  return (
    <svg
      data-spatial-lines="true"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1120 820"
    >
      {nodes.slice(1).map((node, index) => {
        const previous = nodes[index]

        return (
          <line
            key={`${previous.id}-${node.id}`}
            x1={previous.x}
            y1={previous.y}
            x2={node.x}
            y2={node.y}
            stroke="rgba(153, 246, 228, 0.22)"
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}

function SpatialNodeButton({
  node,
  isFocused,
  onFocus,
}: {
  readonly node: SpatialNode
  readonly isFocused: boolean
  readonly onFocus: () => void
}) {
  const sizeClass = {
    large: "w-64",
    medium: "w-56",
    small: "w-48",
  }[node.size]

  return (
    <button
      type="button"
      aria-label={`聚焦 ${node.title}`}
      onClick={onFocus}
      onPointerDown={(event) => event.stopPropagation()}
      className={`${sizeClass} absolute rounded-lg border p-4 text-left shadow-2xl backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:scale-[1.015] ${
        isFocused
          ? "border-teal-200/70 bg-teal-200/[0.12] shadow-teal-950/60"
          : "border-white/10 bg-white/[0.07] shadow-black/30 hover:border-teal-200/40"
      }`}
      style={{
        left: node.x,
        top: node.y,
      }}
    >
      <span className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/75 uppercase">
        {node.kind}
      </span>
      <span className="mt-3 block text-base font-semibold text-zinc-50">
        {node.title}
      </span>
      <span className="mt-2 line-clamp-3 block text-sm leading-6 text-zinc-400">
        {node.description}
      </span>
      {node.date ? (
        <time className="mt-3 block font-mono text-xs text-zinc-500" dateTime={node.date}>
          {node.date}
        </time>
      ) : null}
    </button>
  )
}

function FocusPanel({ node }: { readonly node?: SpatialNode }) {
  return (
    <aside
      role="complementary"
      aria-label="Focused node"
      className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]"
    >
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/70 uppercase">
        Focused Node
      </p>
      {node ? (
        <div className="mt-5">
          <p className="font-mono text-xs text-zinc-500">{node.kind}</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-50">{node.title}</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{node.description}</p>
          {node.date ? (
            <time className="mt-4 block font-mono text-xs text-zinc-500" dateTime={node.date}>
              {node.date}
            </time>
          ) : null}
          <Link
            href={node.href}
            className="mt-6 inline-flex rounded-md border border-teal-200/30 px-3 py-2 text-sm font-medium text-teal-100 transition-colors hover:bg-teal-200/10"
          >
            打开 {node.title}
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-2 text-sm text-zinc-500">
          <p>No essays in orbit</p>
          <p>No projects in orbit</p>
          <p>No notes in orbit</p>
        </div>
      )}
    </aside>
  )
}

function MobileConstellation({
  nodes,
  onFocus,
}: {
  readonly nodes: ReadonlyArray<SpatialNode>
  readonly onFocus: (nodeId: string) => void
}) {
  return (
    <section className="mt-6 md:hidden">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-teal-200/70 uppercase">
        移动星图流
      </p>
      {nodes.length > 0 ? (
        <div className="mt-4 space-y-3 border-l border-teal-200/20 pl-4">
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              aria-label={`移动聚焦 ${node.title}`}
              onClick={() => onFocus(node.id)}
              className="relative w-full rounded-lg border border-white/10 bg-white/[0.07] p-4 text-left backdrop-blur"
            >
              <span className="absolute -left-[21px] top-5 h-2 w-2 rounded-full bg-teal-200 shadow-[0_0_20px_rgba(153,246,228,0.7)]" />
              <span className="font-mono text-[0.68rem] tracking-[0.14em] text-teal-200/70 uppercase">
                {node.kind}
              </span>
              <span className="mt-2 block font-semibold text-zinc-50">{node.title}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">
                {node.description}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.055] p-4 text-sm text-zinc-500">
          <p>No essays in orbit</p>
          <p>No projects in orbit</p>
          <p>No notes in orbit</p>
        </div>
      )}
    </section>
  )
}

function OrbitEmptyState() {
  return (
    <div className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/[0.055] p-4 text-center text-sm text-zinc-500 backdrop-blur">
      <p>No essays in orbit</p>
      <p>No projects in orbit</p>
      <p>No notes in orbit</p>
    </div>
  )
}
