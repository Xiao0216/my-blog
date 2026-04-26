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
    <div className="mt-10 space-y-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
      {blocks.map((block, index) => {
        const key = `${index}-${block.slice(0, 16)}`

        if (block.startsWith("## ")) {
          return (
            <h2
              key={key}
              className="pt-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50"
            >
              {block.replace(/^##\s+/, "")}
            </h2>
          )
        }

        if (block.startsWith("# ")) {
          return (
            <h2
              key={key}
              className="pt-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50"
            >
              {block.replace(/^#\s+/, "")}
            </h2>
          )
        }

        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={key}
              className="border-l border-zinc-300 pl-4 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
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
