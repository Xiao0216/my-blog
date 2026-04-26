import { NoteTimeline } from "@/components/site/note-timeline"
import { PageIntro } from "@/components/site/page-intro"
import { getAllNotes } from "@/lib/content"

export const metadata = {
  title: "笔记",
}

export const dynamic = "force-dynamic"

export default function NotesPage() {
  return (
    <div className="page-frame story-section space-y-10">
      <PageIntro
        eyebrow="笔记"
        title="生活碎片"
        description="比文章更轻，但同样认真地保留那些值得记下来的观察。"
      />
      <NoteTimeline notes={getAllNotes()} />
    </div>
  )
}
