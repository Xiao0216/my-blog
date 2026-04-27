"use client"

import { useEffect, useRef } from "react"

import { ArrowLeft, Link2, MessageCircle, RotateCcw } from "lucide-react"

import type { PlanetDetailModel } from "@/components/site/life-universe/types"

export function PlanetDetailOverlay({
  detail,
  isModal,
  isRelatedScopeActive,
  onAskTwin,
  onClearRelated,
  onLeave,
  onShowRelated,
}: {
  readonly detail: PlanetDetailModel
  readonly isModal: boolean
  readonly isRelatedScopeActive: boolean
  readonly onAskTwin: () => void
  readonly onClearRelated: () => void
  readonly onLeave: () => void
  readonly onShowRelated: () => void
}) {
  const leaveButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    leaveButtonRef.current?.focus()
  }, [])

  return (
    <section
      role="dialog"
      aria-modal={isModal ? "true" : undefined}
      aria-label={`${detail.context.title} 行星详情`}
      className="planet-detail-overlay"
      onWheel={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onMouseMove={(event) => event.stopPropagation()}
      onMouseUp={(event) => event.stopPropagation()}
    >
      <header className="planet-detail-header">
        <div className="flex items-start gap-3">
          <button
            ref={leaveButtonRef}
            type="button"
            aria-label="返回宇宙"
            onClick={onLeave}
            className="planet-detail-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ns-text-muted)]">
              {detail.context.category}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ns-text-primary)]">
              {detail.context.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--ns-text-tertiary)]">
              {detail.context.excerpt}
            </p>
          </div>
        </div>
        <div className="planet-detail-status">
          <span>{statusLabel[detail.context.status]}</span>
        </div>
      </header>

      <div className="planet-detail-counts">
        <div>
          <span>记忆</span>
          <strong>{detail.counts.memories}</strong>
        </div>
        <div>
          <span>文章</span>
          <strong>{detail.counts.essays}</strong>
        </div>
        <div>
          <span>笔记</span>
          <strong>{detail.counts.notes}</strong>
        </div>
        <div>
          <span>项目</span>
          <strong>{detail.counts.projects}</strong>
        </div>
      </div>

      <div className="planet-detail-grid">
        <article>
          <h3>概览</h3>
          <p>{detail.context.excerpt}</p>
        </article>
        <article>
          <h3>最近变化</h3>
          <ul>
            {detail.recentChanges.map((item, index) => (
              <li key={`recent-changes-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>关键记忆</h3>
          <ul>
            {detail.keyMemories.map((item, index) => (
              <li key={`key-memories-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>关联内容</h3>
          <ul>
            {detail.relatedTitles.map((item, index) => (
              <li key={`related-titles-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <footer className="planet-detail-actions">
        <button type="button" onClick={onAskTwin} className="planet-detail-primary-action">
          <MessageCircle className="h-4 w-4" />
          <span>问分身</span>
        </button>
        {isRelatedScopeActive ? (
          <button
            type="button"
            onClick={onClearRelated}
            className="planet-detail-secondary-action"
          >
            <RotateCcw className="h-4 w-4" />
            <span>显示全部</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onShowRelated}
            className="planet-detail-secondary-action"
          >
            <Link2 className="h-4 w-4" />
            <span>只看关联</span>
          </button>
        )}
      </footer>
    </section>
  )
}

const statusLabel = {
  archived: "归档",
  growing: "生长",
  mature: "成熟",
  seedling: "萌芽",
} satisfies Record<PlanetDetailModel["context"]["status"], string>
