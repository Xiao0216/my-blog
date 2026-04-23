import type { NoteEntry } from "@/lib/content"

type NoteTimelineProps = {
  notes: ReadonlyArray<NoteEntry>
}

export function NoteTimeline({ notes }: NoteTimelineProps) {
  if (notes.length === 0) {
    return <p className="paper-card p-6 text-muted-foreground">碎片正在路上。</p>
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <article
          key={note.slug}
          className="paper-card grid gap-4 p-6 md:grid-cols-[140px_1fr]"
        >
          <time className="story-label" dateTime={note.publishedAt}>
            {note.publishedAt}
          </time>
          <div className="space-y-3">
            <h2 className="font-heading text-3xl text-foreground">
              {note.title}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {note.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
