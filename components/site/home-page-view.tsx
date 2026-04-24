import Link from "next/link"

type HomePageProfile = {
  heroTitle: string
  heroIntro: string
  aboutSummary: string
}

type HomePageNote = {
  slug: string
  title: string
  body: string
  publishedAt: string
}

type HomePageEssay = {
  slug: string
  title: string
  description: string
  publishedAt: string
}

type HomePageProject = {
  slug: string
  title: string
  description: string
  note: string
}

export type HomePageViewProps = {
  profile: HomePageProfile
  essays: ReadonlyArray<HomePageEssay>
  notes: ReadonlyArray<HomePageNote>
  projects: ReadonlyArray<HomePageProject>
}

export function HomePageView({
  profile,
  essays,
  notes,
  projects,
}: HomePageViewProps) {
  const feedItems = [
    essays[0] && {
      type: "Essay",
      title: essays[0].title,
      description: essays[0].description,
      date: essays[0].publishedAt,
    },
    projects[0] && {
      type: "Project",
      title: projects[0].title,
      description: projects[0].note,
    },
    notes[0] && {
      type: "Note",
      title: notes[0].title,
      description: notes[0].body,
      date: notes[0].publishedAt,
    },
  ].filter(
    (
      item
    ): item is {
      type: string
      title: string
      description: string
      date?: string
    } => Boolean(item)
  )

  const emptyState = (label: string) => (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200/70 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800/70 dark:bg-zinc-950 dark:text-zinc-400">
      <span className="grid h-6 w-6 place-items-center rounded-md border border-zinc-200 font-mono text-xs dark:border-zinc-800">
        —
      </span>
      <span>{label}</span>
    </div>
  )

  const sectionHeading = (label: string, title: string, intro: string) => (
    <div className="space-y-2">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
        {label}
      </p>
      <h2 className="text-2xl font-semibold leading-tight text-zinc-950 md:text-3xl dark:text-zinc-50">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        {intro}
      </p>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-5 text-zinc-950 sm:px-6 dark:text-zinc-50">
      <section className="grid gap-6 py-10 md:grid-cols-[0.8fr_1.2fr] md:py-16">
        <div className="rounded-lg border border-zinc-200/70 bg-white p-5 md:p-6 dark:border-zinc-800/70 dark:bg-zinc-950">
          <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
            Identity
          </p>
          <h1 className="mt-4 max-w-xl text-2xl font-semibold leading-tight md:text-3xl">
            {profile.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            {profile.heroIntro}
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between border-t border-zinc-200/70 pt-3 dark:border-zinc-800/70">
              <span className="text-zinc-500 dark:text-zinc-400">Role</span>
              <span className="font-medium">Developer / Writer</span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200/70 pt-3 dark:border-zinc-800/70">
              <span className="text-zinc-500 dark:text-zinc-400">Focus</span>
              <span className="font-medium">Code, essays, projects</span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200/70 pt-3 dark:border-zinc-800/70">
              <span className="text-zinc-500 dark:text-zinc-400">Status</span>
              <span className="font-medium">Maintaining this archive</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70">
            <div>
              <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
                Latest
              </p>
              <h2 className="mt-1 text-base font-semibold">Recent activity</h2>
            </div>
            <Link
              href="/essays"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              View all essays
            </Link>
          </div>
          {feedItems.length > 0 ? (
            <div>
              {feedItems.map((item) => (
                <article
                  key={`${item.type}-${item.title}`}
                  className="flex items-start justify-between gap-4 border-b border-zinc-200/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/70 dark:hover:bg-zinc-900/55"
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 rounded-md border border-zinc-200 px-2 py-1 font-mono text-[0.68rem] font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      {item.type}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {item.date ? (
                    <time
                      className="hidden shrink-0 text-xs text-zinc-500 sm:block dark:text-zinc-400"
                      dateTime={item.date}
                    >
                      {item.date}
                    </time>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="p-4">{emptyState("No entries yet")}</div>
          )}
        </div>
      </section>

      <section className="space-y-5 py-10 md:py-14">
        {sectionHeading(
          "Essays",
          "正式文章",
          "更完整的结构、更慢的推演，以及值得留给长阅读的内容。"
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {essays.length > 0 ? (
            essays.map((essay) => (
              <article
                key={essay.slug}
                className="rounded-lg border border-zinc-200/70 bg-white p-5 transition-colors hover:border-zinc-400/70 dark:border-zinc-800/70 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <h3 className="text-lg font-semibold">{essay.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                  {essay.description}
                </p>
              </article>
            ))
          ) : (
            emptyState("No essays yet")
          )}
        </div>
      </section>

      <section className="space-y-5 py-10 md:py-14">
        {sectionHeading(
          "Projects",
          "项目",
          "正在打磨、值得长期维护，或者足以说明工作方式的作品。"
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {projects.length > 0 ? (
            projects.map((project) => (
              <article
                key={project.slug}
                className="rounded-lg border border-zinc-200/70 bg-white p-5 transition-colors hover:border-zinc-400/70 dark:border-zinc-800/70 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                  {project.description}
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                  {project.note}
                </p>
              </article>
            ))
          ) : (
            emptyState("No projects yet")
          )}
        </div>
      </section>

      <section className="space-y-5 py-10 md:py-14">
        {sectionHeading(
          "Notes",
          "生活碎片",
          "轻量记录，但依然保持可回看、可整理的结构。"
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {notes.length > 0 ? (
            notes.map((note) => (
              <article
                key={note.slug}
                className="rounded-lg border border-zinc-200/70 bg-white p-5 transition-colors hover:border-zinc-400/70 dark:border-zinc-800/70 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                  {note.body}
                </p>
              </article>
            ))
          ) : (
            emptyState("No notes yet")
          )}
        </div>
      </section>
    </div>
  )
}
