import type { ProfileData } from "@/lib/content"

type AboutPageViewProps = {
  profile: ProfileData
}

export function AboutPageView({ profile }: AboutPageViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profile.longBio.map((paragraph, index) => (
        <article
          key={`${paragraph}-${profile.longBio
            .slice(0, index)
            .filter((item) => item === paragraph).length}`}
          className="null-space-card relative"
        >
          <p className="story-label text-[var(--ns-accent-primary)]">
            记忆节点 {String(index + 1).padStart(2, "0")}
          </p>
          <p className="mt-4 text-sm leading-8 text-[var(--ns-text-secondary)] md:text-base">
            {paragraph}
          </p>
        </article>
      ))}
    </div>
  )
}
