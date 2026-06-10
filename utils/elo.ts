// utils/elo.ts
// Pure Elo + matchmaking logic — no Vue/Nuxt deps

export const BASE_MMR = 1500
export const BASE_K = 32
export const BASE_UNCERTAINTY = 350

export interface EloPlayer {
  rating: number
  uncertainty: number
}

export function expectedScore(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400))
}

export function effectiveK(uncertainty: number): number {
  return BASE_K * (uncertainty / BASE_UNCERTAINTY)
}

export function applyResult(
  winner: EloPlayer,
  loser: EloPlayer,
): { winnerDelta: number; loserDelta: number } {
  const kW = effectiveK(winner.uncertainty)
  const kL = effectiveK(loser.uncertainty)

  const winnerDelta = kW * (1 - expectedScore(winner.rating, loser.rating))
  const loserDelta = kL * (0 - expectedScore(loser.rating, winner.rating))

  return { winnerDelta, loserDelta }
}

export function decayUncertainty(u: number): number {
  return Math.max(60, u * 0.97)
}

export function matchQuality(r1: number, r2: number): number {
  return Math.max(0, 1 - Math.abs(r1 - r2) / 800)
}

export interface Tier {
  label: string
  key: string
  emoji: string
  min: number
}

export const TIERS: Tier[] = [
  { label: 'Diamond', key: 'diamond', emoji: '💎', min: 2000 },
  { label: 'Platinum', key: 'platinum', emoji: '🔥', min: 1800 },
  { label: 'Gold', key: 'gold', emoji: '🥇', min: 1650 },
  { label: 'Silver', key: 'silver', emoji: '🥈', min: 1500 },
  { label: 'Bronze', key: 'bronze', emoji: '🥉', min: 1350 },
  { label: 'Rookie', key: 'rookie', emoji: '🪨', min: 0 },
]

export function getTier(rating: number): Tier {
  return TIERS.find(t => rating >= t.min) ?? TIERS[TIERS.length - 1]
}

export function qualityLabel(q: number): { label: string; key: string } {
  if (q > 0.9)  return { label: '🔥 Elite', key: 'elite' }
  if (q > 0.75) return { label: '⚖️ Competitive', key: 'competitive' }
  if (q > 0.5)  return { label: '📉 Uneven', key: 'uneven' }
  return { label: '🚨 Mismatch', key: 'mismatch' }
}
