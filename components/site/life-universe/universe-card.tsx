import type { UniverseCardModel } from "@/components/site/life-universe/types"

const toneClass = {
  blue: "shadow-blue-500/20 before:bg-blue-300/60",
  cyan: "shadow-cyan-500/20 before:bg-cyan-200/70",
  emerald: "shadow-emerald-500/20 before:bg-emerald-200/70",
  neutral: "shadow-zinc-300/10 before:bg-zinc-200/70",
  teal: "shadow-teal-500/25 before:bg-teal-200/70",
  violet: "shadow-violet-500/25 before:bg-violet-300/70",
} satisfies Record<UniverseCardModel["tone"], string>

export function UniverseCard({
  card,
  isSelected,
  onSelect,
}: {
  readonly card: UniverseCardModel
  readonly isSelected: boolean
  readonly onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={`聚焦 ${card.title}`}
      data-selected={isSelected ? "true" : "false"}
      onClick={onSelect}
      className={`null-space-card group absolute hidden text-left outline-none transition duration-200 before:absolute before:right-7 before:bottom-6 before:h-2 before:w-2 before:rounded-full before:shadow-[0_0_24px_currentColor] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-teal-100/60 md:block ${
        toneClass[card.tone]
      } ${
        card.featured
          ? "z-20 border-teal-100/35 bg-teal-100/[0.055] shadow-2xl"
          : "z-10 border-white/10 bg-white/[0.045] shadow-xl"
      } ${isSelected ? "border-teal-100/70 shadow-teal-300/30" : ""}`}
      style={{
        height: card.height,
        left: card.x,
        top: card.y,
        transform: `rotate(${card.rotate}deg)`,
        width: card.width,
      }}
    >
      <span className="font-mono text-[0.66rem] text-zinc-500">
        {card.category}
      </span>
      <span
        className={`mt-4 block font-semibold leading-tight text-zinc-100 ${
          card.featured ? "text-3xl" : "text-base"
        }`}
      >
        {card.title}
      </span>
      <span
        className={`mt-3 block text-zinc-500 ${
          card.featured ? "max-w-[17rem] text-sm leading-7" : "line-clamp-2 text-xs leading-5"
        }`}
      >
        {card.excerpt}
      </span>
      <span className="absolute bottom-5 left-5 font-mono text-[0.66rem] text-zinc-600">
        {card.date}
      </span>
      <span className="absolute top-4 right-5 text-zinc-600">...</span>
    </button>
  )
}
