"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

import { ArrowLeft, ExternalLink, Link2, MessageCircle } from "lucide-react"

import type { PlanetDetailModel } from "@/components/site/life-universe/types"

export function PlanetDetailOverlay({
  detail,
  isModal,
  onAskTwin,
  onLeave,
  onShowRelated,
}: {
  readonly detail: PlanetDetailModel
  readonly isModal: boolean
  readonly onAskTwin: () => void
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
      aria-label={`${detail.card.title} 行星详情`}
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
              {detail.card.category}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ns-text-primary)]">
              {detail.card.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--ns-text-tertiary)]">
              {detail.card.excerpt}
            </p>
          </div>
        </div>
        <div className="planet-detail-status">
          <span>{detail.card.status}</span>
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
          <p>{detail.card.excerpt}</p>
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
          <span>问 AI</span>
        </button>
        <button
          type="button"
          onClick={onShowRelated}
          className="planet-detail-secondary-action"
        >
          <Link2 className="h-4 w-4" />
          <span>只看关联</span>
        </button>
        {detail.card.href ? (
          <Link href={detail.card.href} className="planet-detail-secondary-action">
            <ExternalLink className="h-4 w-4" />
            <span>打开完整页</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="这个行星暂时没有独立详情页"
            className="planet-detail-secondary-action"
          >
            <ExternalLink className="h-4 w-4" />
            <span>打开完整页</span>
          </button>
        )}
      </footer>
    </section>
  )
}
