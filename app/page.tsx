import { HomePageView } from "@/components/site/home-page-view"
import {
  getEssaySummaries,
  getFeaturedNotes,
  getLifeMemories,
  getLifePlanets,
  getProfile,
  getProjects,
  getPublicTwinIdentity,
} from "@/lib/content"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <HomePageView
      essays={getEssaySummaries().slice(0, 2)}
      memories={getLifeMemories()}
      notes={getFeaturedNotes(3)}
      planets={getLifePlanets()}
      profile={getProfile()}
      projects={getProjects().slice(0, 2)}
      twinIdentity={getPublicTwinIdentity()}
    />
  )
}
