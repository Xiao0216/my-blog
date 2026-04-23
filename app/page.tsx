import { HomePageView } from "@/components/site/home-page-view"
import {
  getEssaySummaries,
  getFeaturedNotes,
  getProfile,
  getProjects,
} from "@/lib/content"

export default function HomePage() {
  return (
    <HomePageView
      essays={getEssaySummaries().slice(0, 2)}
      notes={getFeaturedNotes(3)}
      profile={getProfile()}
      projects={getProjects().slice(0, 2)}
    />
  )
}
