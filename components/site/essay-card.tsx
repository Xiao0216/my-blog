import Link from "next/link"

import type { EssaySummary } from "@/lib/content"

type EssayCardProps = {
  essay: EssaySummary
}

export function EssayCard({ essay }: EssayCardProps) {
  return (
    <article className="paper-card p-6">
      <p className="story-label">
        {essay.publishedAt} · {essay.readingTime}
      </p>
      <h2 className="mt-3 font-heading text-4xl text-foreground">
        <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
      </h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {essay.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {essay.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
