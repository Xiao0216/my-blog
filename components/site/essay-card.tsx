import Link from "next/link"

import type { EssaySummary } from "@/lib/content"

type EssayCardProps = {
  essay: EssaySummary
}

export function EssayCard({ essay }: EssayCardProps) {
  return (
    <article className="null-space-card group relative">
      <p className="story-label text-[var(--ns-text-muted)]">
        {essay.publishedAt} · {essay.readingTime}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-[var(--ns-text-primary)]">
        <Link
          href={`/essays/${essay.slug}`}
          className="underline-offset-4 hover:text-[var(--ns-accent-primary)] hover:underline"
        >
          {essay.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--ns-text-tertiary)]">
        {essay.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {essay.tags.map((tag) => (
          <span key={tag} className="null-page-chip">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
