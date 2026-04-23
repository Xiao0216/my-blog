import type { ComponentType } from "react"

import { essaySummaries } from "@/data/essays"

type EssayModule = {
  default: ComponentType
}

const bySlug = Object.fromEntries(
  essaySummaries.map((essay) => [essay.slug, essay])
) as Record<string, (typeof essaySummaries)[number]>

export const essayDocuments = {
  "making-space-for-thought": {
    meta: bySlug["making-space-for-thought"],
    load: () => import("./making-space-for-thought.mdx"),
  },
  "quiet-loops-at-night": {
    meta: bySlug["quiet-loops-at-night"],
    load: () => import("./quiet-loops-at-night.mdx"),
  },
} satisfies Record<
  string,
  {
    meta: (typeof essaySummaries)[number]
    load: () => Promise<EssayModule>
  }
>
