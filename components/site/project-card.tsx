import Link from "next/link"

import type { ProjectEntry } from "@/lib/content"

type ProjectCardProps = {
  project: ProjectEntry
}

export function ProjectCard({ project }: ProjectCardProps) {
  const className =
    "mt-5 inline-flex text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
  const isExternalHref = /^(https?:)?\/\//i.test(project.href)

  return (
    <article className="rounded-lg border border-zinc-200/70 bg-white p-5 transition-colors hover:border-zinc-400/70 dark:border-zinc-800/70 dark:bg-zinc-950 dark:hover:border-zinc-600">
      <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
        {project.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        {project.description}
      </p>
      <p className="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        {project.note}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <span
            key={item}
            className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {item}
          </span>
        ))}
      </div>
      {isExternalHref ? (
        <a
          href={project.href}
          aria-label={`查看项目：${project.title}`}
          className={className}
          rel="noopener noreferrer"
          target="_blank"
        >
          查看项目
        </a>
      ) : (
        <Link
          href={project.href}
          aria-label={`查看项目：${project.title}`}
          className={className}
        >
          查看项目
        </Link>
      )}
    </article>
  )
}
