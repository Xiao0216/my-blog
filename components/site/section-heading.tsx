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
    <div className="space-y-2">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
        {chapter}
      </p>
      <h2 className="text-2xl font-semibold leading-tight text-zinc-950 md:text-3xl dark:text-zinc-50">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        {intro}
      </p>
    </div>
  )
}
