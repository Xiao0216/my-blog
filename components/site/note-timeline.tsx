import type { NoteEntry } from "@/lib/content"

type NoteTimelineProps = {
  notes: ReadonlyArray<NoteEntry>
}

export function NoteTimeline({ notes }: NoteTimelineProps) {
  if (notes.length === 0) {
    return (
      <div className="null-space-panel flex items-center gap-3 p-4 text-sm text-[var(--ns-text-tertiary)]">
        <span className="grid h-6 w-6 place-items-center rounded-md border border-[var(--ns-glass-border)] font-mono text-xs">
          —
        </span>
        <span>还没有笔记。</span>
      </div>
    )
  }

  return (
    <div className="null-space-panel overflow-hidden">
      {notes.map((note) => (
        <article
          key={note.slug}
          className="flex flex-col gap-3 border-b border-[var(--ns-glass-border)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--ns-control-bg)] md:flex-row md:items-start md:justify-between"
        >
          <time
            className="shrink-0 font-mono text-xs text-[var(--ns-text-muted)]"
            dateTime={note.publishedAt}
          >
            {note.publishedAt}
          </time>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-base font-semibold text-[var(--ns-text-primary)]">
              {note.title}
            </h2>
            <p className="text-sm leading-7 text-[var(--ns-text-tertiary)]">
              {note.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
