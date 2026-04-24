import { PageIntro } from "@/components/site/page-intro"
import { ProjectCard } from "@/components/site/project-card"
import { getProjects } from "@/lib/content"

export const metadata = {
  title: "Projects",
}

export const dynamic = "force-dynamic"

export default function ProjectsPage() {
  const projects = getProjects()

  return (
    <div className="page-frame story-section space-y-10">
      <PageIntro
        eyebrow="Projects"
        title="项目与作品"
        description="这里放的是我真正愿意继续投入时间、并且愿意反复打磨的东西。"
      />
      {projects.length > 0 ? (
        <div className="soft-grid">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800/70 dark:bg-zinc-950 dark:text-zinc-400">
          正在整理值得被展开讲述的项目。
        </p>
      )}
    </div>
  )
}
