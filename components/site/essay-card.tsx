import Link from "next/link"

import type { EssaySummary } from "@/lib/content"

type EssayCardProps = {
  essay: EssaySummary
}

export function EssayCard({ essay }: EssayCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200/70 bg-white p-5 transition-colors hover:border-zinc-400/70 dark:border-zinc-800/70 dark:bg-zinc-950 dark:hover:border-zinc-600">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
        {essay.publishedAt} · {essay.readingTime}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
        <Link
          href={`/essays/${essay.slug}`}
          className="underline-offset-4 hover:underline"
        >
          {essay.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        {essay.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {essay.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
