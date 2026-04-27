import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getEssayDocumentBySlug } from "@/lib/content"

type EssayPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: EssayPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getEssayDocumentBySlug(slug)

  if (!entry) {
    return { title: "文章" }
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

  return (
    <article className="page-frame story-section">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="null-space-panel relative overflow-hidden p-6 md:p-8">
          <div
            className="pointer-events-none absolute -top-24 right-8 h-44 w-44 rounded-full bg-[var(--ns-particle-glow)] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative space-y-4">
            <p className="story-label text-[var(--ns-accent-primary)]">
              {entry.meta.publishedAt} · {entry.meta.readingTime}
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-[var(--ns-text-primary)] md:text-5xl">
              {entry.meta.title}
            </h1>
            <p className="text-sm leading-7 text-[var(--ns-text-tertiary)] md:text-base">
              {entry.meta.description}
            </p>
          </div>
        </header>
        <MarkdownContent content={entry.content} />
      </div>
    </article>
  )
}

function MarkdownContent({ content }: { readonly content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className="null-space-panel space-y-6 p-6 text-sm leading-8 text-[var(--ns-text-secondary)] md:p-8">
      {blocks.map((block, index) => {
        const key = `${index}-${block.slice(0, 16)}`

        if (block.startsWith("## ")) {
          return (
            <h2
              key={key}
              className="pt-4 text-xl font-semibold text-[var(--ns-text-primary)]"
            >
              {block.replace(/^##\s+/, "")}
            </h2>
          )
        }

        if (block.startsWith("# ")) {
          return (
            <h2
              key={key}
              className="pt-4 text-xl font-semibold text-[var(--ns-text-primary)]"
            >
              {block.replace(/^#\s+/, "")}
            </h2>
          )
        }

        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={key}
              className="border-l border-[var(--ns-accent-primary)] pl-4 text-[var(--ns-text-tertiary)]"
            >
              {block.replace(/^>\s+/, "")}
            </blockquote>
          )
        }

        if (/^[-*]\s+/m.test(block)) {
          return (
            <ul key={key} className="list-disc space-y-2 pl-5">
              {block
                .split("\n")
                .map((item) => item.replace(/^[-*]\s+/, "").trim())
                .filter(Boolean)
                .map((item) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )
        }

        return <p key={key}>{block}</p>
      })}
    </div>
  )
}
