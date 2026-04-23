import type { ProfileData } from "@/lib/content"

type AboutPageViewProps = {
  profile: ProfileData
}

export function AboutPageView({ profile }: AboutPageViewProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="story-label">About</p>
        <h1 className="font-heading text-5xl leading-none text-foreground md:text-6xl">
          {profile.name}
        </h1>
        <p className="max-w-2xl text-base leading-8 text-muted-foreground">
          {profile.aboutSummary}
        </p>
      </header>

      <div className="space-y-6">
        {profile.longBio.map((paragraph) => (
          <p
            key={paragraph}
            className="max-w-3xl text-lg leading-9 text-foreground/90"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
