import Link from "next/link"

import { HeroIllustration } from "@/components/site/hero-illustration"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"

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
  return (
    <div className="page-frame">
      <section className="story-section grid gap-10 md:grid-cols-[1.1fr_.9fr] md:items-center">
        <Reveal className="space-y-6">
          <p className="story-label">序章</p>
          <h1 className="font-heading text-5xl leading-none text-foreground md:text-7xl">
            {profile.heroTitle}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            {profile.heroIntro}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border border-border px-4 py-2">
              开发者
            </span>
            <span className="rounded-full border border-border px-4 py-2">
              写作者
            </span>
            <span className="rounded-full border border-border px-4 py-2">
              观察生活的人
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <HeroIllustration />
        </Reveal>
      </section>

      <section className="story-section">
        <Reveal>
          <SectionHeading
            chapter="第一章"
            title="关于我"
            intro={profile.aboutSummary}
          />
        </Reveal>
      </section>

      <section className="story-section space-y-8">
        <Reveal>
          <SectionHeading
            chapter="第二章"
            title="生活碎片"
            intro="这里保留那些还没有长成文章、但值得被轻轻记下的片段。"
          />
        </Reveal>
        <div className="soft-grid">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <Reveal key={note.slug} delay={index * 80}>
                <article className="paper-card p-6">
                  <time className="story-label" dateTime={note.publishedAt}>
                    {note.publishedAt}
                  </time>
                  <h3 className="mt-3 font-heading text-3xl">{note.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {note.body}
                  </p>
                </article>
              </Reveal>
            ))
          ) : (
            <p className="paper-card p-6 text-muted-foreground">
              更多碎片正在整理中。
            </p>
          )}
        </div>
      </section>

      <section className="story-section space-y-8">
        <Reveal>
          <SectionHeading
            chapter="第三章"
            title="文章"
            intro="正式文章放在这里，保留更沉静的节奏和更完整的推演。"
          />
        </Reveal>
        <div className="soft-grid">
          {essays.length > 0 ? (
            essays.map((essay, index) => (
              <Reveal key={essay.slug} delay={index * 80}>
                <article className="paper-card p-6">
                  <time className="story-label" dateTime={essay.publishedAt}>
                    {essay.publishedAt}
                  </time>
                  <h3 className="mt-3 font-heading text-3xl">{essay.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {essay.description}
                  </p>
                </article>
              </Reveal>
            ))
          ) : (
            <p className="paper-card p-6 text-muted-foreground">
              第一篇文章正在写完最后一段。
            </p>
          )}
        </div>
        <Link
          href="/essays"
          className="inline-flex rounded-full border border-border px-5 py-3 text-sm transition-colors hover:border-foreground hover:text-foreground"
        >
          进入文章
        </Link>
      </section>

      <section className="story-section space-y-8">
        <Reveal>
          <SectionHeading
            chapter="第四章"
            title="项目"
            intro="它们不是简历上的罗列，而是那些真正值得我继续投入时间的作品。"
          />
        </Reveal>
        <div className="soft-grid">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 80}>
                <article className="paper-card p-6">
                  <h3 className="font-heading text-3xl">{project.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {project.description}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-foreground/80">
                    {project.note}
                  </p>
                </article>
              </Reveal>
            ))
          ) : (
            <p className="paper-card p-6 text-muted-foreground">
              正在整理值得被展开讲述的项目。
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
