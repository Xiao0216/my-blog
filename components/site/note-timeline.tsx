import type { NoteEntry } from "@/lib/content"

type NoteTimelineProps = {
  notes: ReadonlyArray<NoteEntry>
}

export function NoteTimeline({ notes }: NoteTimelineProps) {
  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200/70 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800/70 dark:bg-zinc-950 dark:text-zinc-400">
        <span className="grid h-6 w-6 place-items-center rounded-md border border-zinc-200 font-mono text-xs dark:border-zinc-800">
          —
        </span>
        <span>还没有笔记。</span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-zinc-950">
      {notes.map((note) => (
        <article
          key={note.slug}
          className="flex items-start justify-between gap-4 border-b border-zinc-200/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/70 dark:hover:bg-zinc-900/55"
        >
          <time
            className="shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400"
            dateTime={note.publishedAt}
          >
            {note.publishedAt}
          </time>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {note.title}
            </h2>
            <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
              {note.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
