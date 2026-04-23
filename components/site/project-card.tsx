import Link from "next/link"

import type { ProjectEntry } from "@/lib/content"

type ProjectCardProps = {
  project: ProjectEntry
}

export function ProjectCard({ project }: ProjectCardProps) {
  const className =
    "mt-6 inline-flex text-sm text-primary underline-offset-4 hover:underline"

  return (
    <article className="paper-card p-6">
      <h2 className="font-heading text-4xl text-foreground">{project.title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {project.description}
      </p>
      <p className="mt-4 text-sm leading-7 text-foreground/80">{project.note}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
      {/^https?:\/\//i.test(project.href) ? (
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
