type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="space-y-4">
      <p className="story-label">{eyebrow}</p>
      <h1 className="font-heading text-5xl leading-none text-foreground md:text-6xl">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-8 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
