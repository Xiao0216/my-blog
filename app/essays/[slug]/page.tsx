import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getAllEssaySlugs, getEssayDocumentBySlug } from "@/lib/content"

type EssayPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllEssaySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: EssayPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getEssayDocumentBySlug(slug)

  if (!entry) {
    return { title: "Essay" }
  }

  return {
    title: entry.meta.title,
    description: entry.meta.description,
  }
}

export default async function EssayDetailPage({ params }: EssayPageProps) {
  const { slug } = await params
  const entry = getEssayDocumentBySlug(slug)

  if (!entry) {
    notFound()
  }

  const { default: Content } = await entry.load()

  return (
    <article className="page-frame story-section">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="story-label">
          {entry.meta.publishedAt} · {entry.meta.readingTime}
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
          {entry.meta.title}
        </h1>
        <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          {entry.meta.description}
        </p>
        <div className="mt-10">
          <Content />
        </div>
      </div>
    </article>
  )
}
