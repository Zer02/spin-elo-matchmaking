// server/api/matches/complete.post.ts
// Handles Elo recalculation server-side so clients can't tamper with ratings

import { serverSupabaseServiceRole } from '#supabase/server'
import { applyResult, decayUncertainty, matchQuality } from '~/utils/elo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { matchId, winnerId, challengerScore, opponentScore } = body

  if (!matchId || !winnerId) {
    throw createError({ statusCode: 400, message: 'matchId and winnerId required' })
  }

  // Use service-role client to bypass RLS for atomic updates
  const client = serverSupabaseServiceRole(event)

  // 1. Fetch match + both players' current ratings
  const { data: match, error: matchErr } = await client
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (matchErr || !match) {
    throw createError({ statusCode: 404, message: 'Match not found' })
  }

  if (match.status === 'completed') {
    throw createError({ statusCode: 409, message: 'Match already completed' })
  }

  // Validate winner is one of the participants
  if (winnerId !== match.challenger_id && winnerId !== match.opponent_id) {
    throw createError({ statusCode: 400, message: 'Winner must be a match participant' })
  }

  const loserId = winnerId === match.challenger_id
    ? match.opponent_id
    : match.challenger_id

  // 2. Fetch both member records
  const { data: members } = await client
    .from('league_members')
    .select('*')
    .eq('league_id', match.league_id)
    .in('profile_id', [match.challenger_id, match.opponent_id])

  if (!members || members.length < 2) {
    throw createError({ statusCode: 404, message: 'Players not found in league' })
  }

  const winnerMember = members.find(m => m.profile_id === winnerId)!
  const loserMember  = members.find(m => m.profile_id === loserId)!

  // 3. Calculate Elo deltas
  const quality = matchQuality(Number(winnerMember.rating), Number(loserMember.rating))
  const { winnerDelta, loserDelta } = applyResult(
    { rating: Number(winnerMember.rating), uncertainty: Number(winnerMember.uncertainty) },
    { rating: Number(loserMember.rating),  uncertainty: Number(loserMember.uncertainty) },
  )

  const newWinnerRating     = Number(winnerMember.rating) + winnerDelta
  const newLoserRating      = Number(loserMember.rating)  + loserDelta
  const newWinnerUncert     = decayUncertainty(Number(winnerMember.uncertainty))
  const newLoserUncert      = decayUncertainty(Number(loserMember.uncertainty))

  const challengerDelta = winnerId === match.challenger_id ? winnerDelta : loserDelta
  const opponentDelta   = winnerId === match.opponent_id   ? winnerDelta : loserDelta

  // 4. Determine which player is challenger vs opponent
  const challengerIsWinner = winnerId === match.challenger_id

  // 5. Atomic updates via Promise.all
  const [matchUpdate, winnerUpdate, loserUpdate] = await Promise.all([
    // Update match record
    client.from('matches').update({
      winner_id:        winnerId,
      challenger_score: challengerScore ?? null,
      opponent_score:   opponentScore ?? null,
      status:           'completed',
      quality,
      challenger_delta: challengerDelta,
      opponent_delta:   opponentDelta,
      completed_at:     new Date().toISOString(),
    }).eq('id', matchId),

    // Update winner member
    client.from('league_members').update({
      rating:       newWinnerRating,
      uncertainty:  newWinnerUncert,
      season_wins:  winnerMember.season_wins + 1,
      career_wins:  winnerMember.career_wins + 1,
    }).eq('id', winnerMember.id),

    // Update loser member
    client.from('league_members').update({
      rating:         newLoserRating,
      uncertainty:    newLoserUncert,
      season_losses:  loserMember.season_losses + 1,
      career_losses:  loserMember.career_losses + 1,
    }).eq('id', loserMember.id),
  ])

  // 6. Record Elo history snapshots
  await client.from('elo_history').insert([
    {
      league_id:  match.league_id,
      profile_id: winnerId,
      season:     match.season,
      rating:     newWinnerRating,
      match_id:   matchId,
    },
    {
      league_id:  match.league_id,
      profile_id: loserId,
      season:     match.season,
      rating:     newLoserRating,
      match_id:   matchId,
    },
  ])

  return {
    ok: true,
    winnerDelta,
    loserDelta,
    winnerNewRating: newWinnerRating,
    loserNewRating:  newLoserRating,
  }
})
