import type {
  PlacedUniverseCard,
  UniverseLayoutInputCard,
  UniverseViewport,
} from "@/components/site/life-universe/types"

const SAFETY_MARGIN = 32
const RING_RADII = [0, 255, 410, 560] as const
const ANGLE_STEP = Math.PI / 18
const MAX_ATTEMPTS_PER_RING = 72

export function layoutUniverseCards(
  cards: ReadonlyArray<UniverseLayoutInputCard>,
  viewport: UniverseViewport
): ReadonlyArray<PlacedUniverseCard> {
  const sortedCards = [...cards].sort((a, b) => {
    if (b.importance !== a.importance) {
      return b.importance - a.importance
    }

    return a.id.localeCompare(b.id)
  })
  const placedCards: PlacedUniverseCard[] = []

  for (const card of sortedCards) {
    placedCards.push(placeCard(card, placedCards, viewport))
  }

  return sortByOriginalOrder(cards, placedCards)
}

export function cardsOverlap(
  first: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  second: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  margin = SAFETY_MARGIN
) {
  return !(
    first.x + first.width + margin <= second.x ||
    second.x + second.width + margin <= first.x ||
    first.y + first.height + margin <= second.y ||
    second.y + second.height + margin <= first.y
  )
}

function placeCard(
  card: UniverseLayoutInputCard,
  placedCards: ReadonlyArray<PlacedUniverseCard>,
  viewport: UniverseViewport
): PlacedUniverseCard {
  const preferredRing = getPreferredRing(card)
  const seedAngle = getSeedAngle(card.id)

  for (let ring = preferredRing; ring < RING_RADII.length; ring += 1) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_RING; attempt += 1) {
      const angle = seedAngle + attempt * ANGLE_STEP
      const candidate = createPlacedCard(card, viewport, ring, angle)

      if (!placedCards.some((placedCard) => cardsOverlap(candidate, placedCard))) {
        return candidate
      }
    }
  }

  const fallbackRing = RING_RADII.length - 1
  return createPlacedCard(
    card,
    viewport,
    fallbackRing,
    seedAngle + placedCards.length * ANGLE_STEP
  )
}

function createPlacedCard(
  card: UniverseLayoutInputCard,
  viewport: UniverseViewport,
  ring: number,
  angle: number
): PlacedUniverseCard {
  const radius = RING_RADII[ring]
  const rawX = viewport.centerX + Math.cos(angle) * radius - card.width / 2
  const rawY = viewport.centerY + Math.sin(angle) * radius - card.height / 2
  const x = clamp(rawX, SAFETY_MARGIN, viewport.width - card.width - SAFETY_MARGIN)
  const y = clamp(rawY, SAFETY_MARGIN, viewport.height - card.height - SAFETY_MARGIN)

  return {
    ...card,
    angle: round(angle),
    posture: derivePosture(x + card.width / 2, y + card.height / 2, ring, viewport),
    ring,
    x: round(x),
    y: round(y),
  }
}

function derivePosture(
  centerX: number,
  centerY: number,
  ring: number,
  viewport: UniverseViewport
) {
  if (ring === 0) {
    return {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateZ: 84,
    }
  }

  const dx = centerX - viewport.centerX
  const dy = centerY - viewport.centerY

  return {
    rotateX: round(clamp((-dy / viewport.height) * 24, -10, 10)),
    rotateY: round(clamp((dx / viewport.width) * -34, -18, 18)),
    rotateZ: round(clamp((dx / viewport.width) * 8, -5, 5)),
    translateZ: Math.max(12, 64 - ring * 14),
  }
}

function getPreferredRing(card: UniverseLayoutInputCard) {
  if (card.kind === "core") {
    return 0
  }

  if (card.kind === "planet") {
    return 1
  }

  if (card.kind === "essay" || card.kind === "project" || card.kind === "memory") {
    return 2
  }

  return 3
}

function getSeedAngle(id: string) {
  let hash = 0

  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360
  }

  return (hash / 360) * Math.PI * 2
}

function sortByOriginalOrder(
  sourceCards: ReadonlyArray<UniverseLayoutInputCard>,
  placedCards: ReadonlyArray<PlacedUniverseCard>
) {
  const order = new Map(sourceCards.map((card, index) => [card.id, index]))

  return [...placedCards].sort(
    (first, second) => (order.get(first.id) ?? 0) - (order.get(second.id) ?? 0)
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number) {
  return Number(value.toFixed(3))
}
