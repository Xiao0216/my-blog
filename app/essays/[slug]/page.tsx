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
        <h1 className="font-heading text-5xl leading-none text-foreground md:text-6xl">
          {entry.meta.title}
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          {entry.meta.description}
        </p>
        <div className="mt-10">
          <Content />
        </div>
      </div>
    </article>
  )
}
