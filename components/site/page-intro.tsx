type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase dark:text-zinc-400">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold leading-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
        {title}
      </h1>
      <p className="max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  )
}
