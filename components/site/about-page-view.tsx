import type { ProfileData } from "@/lib/content"

type AboutPageViewProps = {
  profile: ProfileData
}

export function AboutPageView({ profile }: AboutPageViewProps) {
  return (
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
  )
}
