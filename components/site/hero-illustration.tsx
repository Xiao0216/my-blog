export function HeroIllustration() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.65),rgba(235,228,219,0.75))] p-8">
      <div className="absolute inset-6 rounded-full border border-border/60" />
      <div className="absolute left-[12%] top-[15%] h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute right-[12%] top-[24%] h-32 w-32 rounded-[2rem] bg-accent/30 blur-2xl" />
      <div className="absolute bottom-[14%] left-[30%] h-24 w-24 rounded-full border border-foreground/10" />
      <div className="relative grid min-h-80 place-items-center">
        <div className="h-48 w-48 rounded-full border border-foreground/15 bg-white/35 shadow-inner" />
      </div>
    </div>
  )
}
