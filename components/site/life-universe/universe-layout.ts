import type {
  PlacedUniverseCard,
  UniverseLayoutInputCard,
  UniverseViewport,
} from "@/components/site/life-universe/types"

const SAFETY_MARGIN = 32
const RING_RADII = [0, 255, 410, 560] as const
const ANGLE_STEP = Math.PI / 18
const MAX_ATTEMPTS_PER_RING = 72
const FALLBACK_GRID_STEP = 8

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
  const firstExpanded = expandRect(first, margin)
  const secondExpanded = expandRect(second, margin)

  return !(
    firstExpanded.right < secondExpanded.left ||
    secondExpanded.right < firstExpanded.left ||
    firstExpanded.bottom < secondExpanded.top ||
    secondExpanded.bottom < firstExpanded.top
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

      if (canPlace(candidate, placedCards, viewport)) {
        return candidate
      }
    }
  }

  return findFallbackPlacement(card, placedCards, viewport, seedAngle)
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
  const x = clampToSafeBounds(rawX, card.width, viewport.width)
  const y = clampToSafeBounds(rawY, card.height, viewport.height)

  return {
    ...card,
    angle: round(angle),
    layoutStatus: "placed",
    posture: derivePosture(x + card.width / 2, y + card.height / 2, ring, viewport),
    ring,
    x: round(x),
    y: round(y),
  }
}

function findFallbackPlacement(
  card: UniverseLayoutInputCard,
  placedCards: ReadonlyArray<PlacedUniverseCard>,
  viewport: UniverseViewport,
  seedAngle: number
): PlacedUniverseCard {
  const bounds = getSafeBounds(card, viewport)
  const xPositions = buildScanPositions(bounds.minX, bounds.maxX, FALLBACK_GRID_STEP)
  const yPositions = buildScanPositions(bounds.minY, bounds.maxY, FALLBACK_GRID_STEP)
  let bestCandidate: PlacedUniverseCard | null = null
  let bestPenalty = Number.POSITIVE_INFINITY

  for (const y of yPositions) {
    for (const x of xPositions) {
      const candidate = createPlacedCardAtPoint(
        card,
        viewport,
        RING_RADII.length - 1,
        x,
        y,
        seedAngle
      )
      const penalty = overlapPenalty(candidate, placedCards)

      if (penalty === 0 && canPlace(candidate, placedCards, viewport)) {
        return candidate
      }

      if (
        bestCandidate === null ||
        penalty < bestPenalty ||
        (penalty === bestPenalty && compareCandidates(candidate, bestCandidate) < 0)
      ) {
        bestCandidate = candidate
        bestPenalty = penalty
      }
    }
  }

  // If every safe grid cell overlaps, return the least-bad deterministic candidate.
  return bestCandidate
    ? {
        ...bestCandidate,
        layoutStatus: "overlap-fallback",
      }
    : createPlacedCardAtPoint(
        card,
        viewport,
        RING_RADII.length - 1,
        bounds.minX,
        bounds.minY,
        seedAngle,
        "overlap-fallback"
      )
}

function createPlacedCardAtPoint(
  card: UniverseLayoutInputCard,
  viewport: UniverseViewport,
  ring: number,
  x: number,
  y: number,
  seedAngle: number,
  layoutStatus: PlacedUniverseCard["layoutStatus"] = "placed"
): PlacedUniverseCard {
  const roundedX = round(x)
  const roundedY = round(y)
  const centerX = roundedX + card.width / 2
  const centerY = roundedY + card.height / 2
  const angle = Math.atan2(centerY - viewport.centerY, centerX - viewport.centerX)
  const resolvedAngle = Number.isFinite(angle) ? angle : seedAngle

  return {
    ...card,
    angle: round(resolvedAngle),
    layoutStatus,
    posture: derivePosture(centerX, centerY, ring, viewport),
    ring,
    x: roundedX,
    y: roundedY,
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

function canPlace(
  candidate: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  placedCards: ReadonlyArray<PlacedUniverseCard>,
  viewport: UniverseViewport
) {
  return (
    isWithinSafetyBounds(candidate, viewport) &&
    !placedCards.some((placedCard) => cardsOverlap(candidate, placedCard))
  )
}

function isWithinSafetyBounds(
  candidate: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  viewport: UniverseViewport
) {
  const safeWidth = viewport.width - SAFETY_MARGIN * 2
  const safeHeight = viewport.height - SAFETY_MARGIN * 2

  if (candidate.width > safeWidth || candidate.height > safeHeight) {
    return false
  }

  const bounds = getSafeBounds(candidate, viewport)

  return (
    candidate.x >= bounds.minX &&
    candidate.y >= bounds.minY &&
    candidate.x <= bounds.maxX &&
    candidate.y <= bounds.maxY
  )
}

function getSafeBounds(
  card: Pick<PlacedUniverseCard, "height" | "width">,
  viewport: UniverseViewport
) {
  const maxX = Math.max(SAFETY_MARGIN, viewport.width - card.width - SAFETY_MARGIN)
  const maxY = Math.max(SAFETY_MARGIN, viewport.height - card.height - SAFETY_MARGIN)

  return {
    maxX,
    maxY,
    minX: SAFETY_MARGIN,
    minY: SAFETY_MARGIN,
  }
}

function clampToSafeBounds(value: number, size: number, viewportSize: number) {
  const min = SAFETY_MARGIN
  const max = Math.max(min, viewportSize - size - SAFETY_MARGIN)

  return clamp(value, min, max)
}

function overlapPenalty(
  candidate: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  placedCards: ReadonlyArray<PlacedUniverseCard>
) {
  return placedCards.reduce((total, placedCard) => total + overlapArea(candidate, placedCard), 0)
}

function overlapArea(
  first: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  second: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">
) {
  const firstExpanded = expandRect(first, SAFETY_MARGIN)
  const secondExpanded = expandRect(second, SAFETY_MARGIN)
  const overlapWidth = Math.max(0, Math.min(firstExpanded.right, secondExpanded.right) - Math.max(firstExpanded.left, secondExpanded.left))
  const overlapHeight = Math.max(0, Math.min(firstExpanded.bottom, secondExpanded.bottom) - Math.max(firstExpanded.top, secondExpanded.top))

  return overlapWidth * overlapHeight
}

function expandRect(
  rect: Pick<PlacedUniverseCard, "height" | "width" | "x" | "y">,
  margin: number
) {
  return {
    bottom: rect.y + rect.height + margin,
    left: rect.x - margin,
    right: rect.x + rect.width + margin,
    top: rect.y - margin,
  }
}

function compareCandidates(
  first: Pick<PlacedUniverseCard, "angle" | "ring" | "x" | "y">,
  second: Pick<PlacedUniverseCard, "angle" | "ring" | "x" | "y">
) {
  if (first.ring !== second.ring) {
    return first.ring - second.ring
  }

  if (first.y !== second.y) {
    return first.y - second.y
  }

  if (first.x !== second.x) {
    return first.x - second.x
  }

  return first.angle - second.angle
}

function buildScanPositions(min: number, max: number, step: number) {
  const positions: number[] = []

  for (let position = min; position <= max; position += step) {
    positions.push(position)
  }

  if (positions.length === 0 || positions[positions.length - 1] !== max) {
    positions.push(max)
  }

  return positions
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
