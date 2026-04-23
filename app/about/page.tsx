import { AboutPageView } from "@/components/site/about-page-view"
import { getProfile } from "@/lib/content"

export const metadata = {
  title: "About",
}

export default function AboutPage() {
  return (
    <div className="page-frame story-section">
      <AboutPageView profile={getProfile()} />
    </div>
  )
}
