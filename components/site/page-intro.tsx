type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="null-space-panel relative overflow-hidden p-6 md:p-8">
      <div
        className="pointer-events-none absolute -top-24 right-8 h-44 w-44 rounded-full bg-[var(--ns-particle-glow)] blur-3xl"
        aria-hidden="true"
      />
      <div className="relative space-y-4">
        <p className="story-label text-[var(--ns-accent-primary)]">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-[var(--ns-text-primary)] md:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ns-text-tertiary)] md:text-base">
          {description}
        </p>
      </div>
    </section>
  )
}
