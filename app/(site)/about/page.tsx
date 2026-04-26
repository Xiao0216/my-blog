import { AboutPageView } from "@/components/site/about-page-view"
import { PageIntro } from "@/components/site/page-intro"
import { getProfile } from "@/lib/content"

export const metadata = {
  title: "关于",
}

export const dynamic = "force-dynamic"

export default function AboutPage() {
  const profile = getProfile()

  return (
    <div className="page-frame story-section space-y-10">
      <PageIntro
        eyebrow="关于"
        title={profile.name}
        description={profile.aboutSummary}
      />
      <AboutPageView profile={profile} />
    </div>
  )
}
