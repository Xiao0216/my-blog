import Link from "next/link"

import type { ProjectEntry } from "@/lib/content"

type ProjectCardProps = {
  project: ProjectEntry
}

export function ProjectCard({ project }: ProjectCardProps) {
  const className =
    "mt-5 inline-flex text-sm font-medium text-[var(--ns-accent-primary)] underline-offset-4 hover:underline"
  const isExternalHref = /^(https?:)?\/\//i.test(project.href)

  return (
    <article className="null-space-card relative">
      <p className="story-label text-[var(--ns-text-muted)]">Project</p>
      <h2 className="mt-3 text-xl font-semibold text-[var(--ns-text-primary)]">
        {project.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--ns-text-tertiary)]">
        {project.description}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--ns-text-secondary)]">
        {project.note}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <span key={item} className="null-page-chip">
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
