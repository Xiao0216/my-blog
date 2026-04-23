type SectionHeadingProps = {
  chapter: string
  title: string
  intro: string
}

export function SectionHeading({
  chapter,
  title,
  intro,
}: SectionHeadingProps) {
  return (
    <div className="space-y-4">
      <p className="story-label">{chapter}</p>
      <h2 className="font-heading text-4xl leading-tight text-foreground md:text-5xl">
        {title}
      </h2>
      <p className="max-w-2xl text-base leading-8 text-muted-foreground">
        {intro}
      </p>
    </div>
  )
}
