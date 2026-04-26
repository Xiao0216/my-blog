import { EssayCard } from "@/components/site/essay-card"
import { PageIntro } from "@/components/site/page-intro"
import { getEssaySummaries } from "@/lib/content"

export const metadata = {
  title: "文章",
}

export const dynamic = "force-dynamic"

export default function EssaysPage() {
  const essays = getEssaySummaries()

  return (
    <div className="page-frame story-section space-y-10">
      <PageIntro
        eyebrow="文章"
        title="正式文章"
        description="保留更长的呼吸、更完整的结构，以及那些值得慢慢读完的内容。"
      />
      <div className="space-y-6">
        {essays.map((essay) => (
          <EssayCard key={essay.slug} essay={essay} />
        ))}
      </div>
    </div>
  )
}
