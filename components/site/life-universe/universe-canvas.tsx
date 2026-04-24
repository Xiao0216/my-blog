import type {
  UniverseCardModel,
} from "@/components/site/life-universe/types"
import { UniverseCard } from "@/components/site/life-universe/universe-card"

export function UniverseCanvas({
  cards,
  selectedCardId,
  zoom,
  hasPlanets,
  onSelectCard,
}: {
  readonly cards: ReadonlyArray<UniverseCardModel>
  readonly selectedCardId: string
  readonly zoom: number
  readonly hasPlanets: boolean
  readonly onSelectCard: (cardId: string) => void
}) {
  return (
    <section
      role="region"
      aria-label="Null Space universe canvas"
      className="pointer-events-auto absolute inset-x-3 top-20 bottom-24 overflow-hidden md:left-20 md:right-[23rem] md:top-20 md:bottom-20"
    >
      <div className="absolute inset-0 rounded-[2rem] border border-white/[0.025] bg-black/[0.02]" />
      <svg
        data-universe-lines="true"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 960 660"
      >
        <path
          d="M135 134 L365 245 L505 112 L742 256 L623 454 L426 455 L260 360 L135 134"
          fill="none"
          stroke="rgba(148,163,184,0.16)"
          strokeWidth="1"
        />
        <path
          d="M260 360 L445 315 L623 454 M445 315 L742 256 M365 245 L445 315"
          fill="none"
          stroke="rgba(45,212,191,0.18)"
          strokeWidth="1"
        />
        {[
          [135, 134],
          [365, 245],
          [505, 112],
          [742, 256],
          [623, 454],
          [426, 455],
          [260, 360],
          [445, 315],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="3"
            fill="rgba(196,181,253,0.9)"
          />
        ))}
      </svg>

      {!hasPlanets ? (
        <div className="absolute left-1/2 top-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-center text-sm text-zinc-500 backdrop-blur-xl">
          No planets in this universe yet
        </div>
      ) : null}

      <div
        className="absolute left-1/2 top-1/2 h-[660px] w-[960px] origin-center transition-transform duration-200"
        style={{
          transform: `translate(-50%, -50%) scale(${zoom / 78})`,
        }}
      >
        {cards.map((card) => (
          <UniverseCard
            key={card.id}
            card={card}
            isSelected={card.id === selectedCardId}
            onSelect={() => onSelectCard(card.id)}
          />
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            aria-label={`移动聚焦 ${card.title}`}
            data-selected={card.id === selectedCardId ? "true" : "false"}
            onClick={() => onSelectCard(card.id)}
            className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left backdrop-blur-xl data-[selected=true]:border-teal-100/60"
          >
            <span className="font-mono text-[0.68rem] text-zinc-500">
              {card.category}
            </span>
            <span className="mt-2 block font-semibold text-zinc-100">
              {card.title}
            </span>
            <span className="mt-2 block text-sm leading-6 text-zinc-500">
              {card.excerpt}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
