import { LifeUniverseWorkbench } from "@/components/site/life-universe/life-universe-workbench"
import type { HomePageViewProps } from "@/components/site/life-universe/types"

export type { HomePageViewProps }

export function HomePageView(props: HomePageViewProps) {
  return <LifeUniverseWorkbench {...props} />
}
