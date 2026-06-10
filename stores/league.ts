// stores/league.ts
import { defineStore } from 'pinia'
import type { Database } from '~/types/supabase'

type League = Database['public']['Tables']['leagues']['Row']
type Member = Database['public']['Tables']['league_members']['Row'] & {
  profiles: { username: string; display_name: string | null; avatar_url: string | null }
}
type Match = Database['public']['Tables']['matches']['Row'] & {
  challenger: { username: string; display_name: string | null }
  opponent:   { username: string; display_name: string | null }
  winner:     { username: string; display_name: string | null } | null
}

export const useLeagueStore = defineStore('league', () => {
  const client = useSupabaseClient<Database>()

  // ── State ──────────────────────────────────────────
  const league    = ref<League | null>(null)
  const members   = ref<Member[]>([])
  const matches   = ref<Match[]>([])
  const loading   = ref(false)
  const error     = ref<string | null>(null)

  // ── Getters ────────────────────────────────────────
  const sortedMembers = computed(() =>
    [...members.value].sort((a, b) => Number(b.rating) - Number(a.rating))
  )

  const pendingMatches = computed(() =>
    matches.value.filter(m => m.status === 'pending' || m.status === 'accepted')
  )

  const completedMatches = computed(() =>
    matches.value.filter(m => m.status === 'completed')
  )

  // ── Actions ────────────────────────────────────────
  async function fetchLeague(slug: string) {
    loading.value = true
    error.value = null

    const { data, error: err } = await client
      .from('leagues')
      .select('*')
      .eq('slug', slug)
      .single()

    if (err) { error.value = err.message; loading.value = false; return }
    league.value = data

    await Promise.all([fetchMembers(), fetchMatches()])
    loading.value = false
  }

  async function fetchMembers() {
    if (!league.value) return

    const { data, error: err } = await client
      .from('league_members')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('league_id', league.value.id)

    if (!err && data) members.value = data as Member[]
  }

  async function fetchMatches() {
    if (!league.value) return

    const { data, error: err } = await client
      .from('matches')
      .select(`
        *,
        challenger:profiles!matches_challenger_id_fkey(username, display_name),
        opponent:profiles!matches_opponent_id_fkey(username, display_name),
        winner:profiles!matches_winner_id_fkey(username, display_name)
      `)
      .eq('league_id', league.value.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!err && data) matches.value = data as Match[]
  }

  async function submitMatchResult(
    matchId: string,
    winnerId: string,
    challengerScore: number,
    opponentScore: number,
  ) {
    // Call a server API route that handles Elo recalculation server-side
    const { data, error: err } = await useFetch('/api/matches/complete', {
      method: 'POST',
      body: { matchId, winnerId, challengerScore, opponentScore },
    })

    if (err.value) throw new Error(err.value.message)

    // Refresh state after update
    await Promise.all([fetchMembers(), fetchMatches()])
    return data.value
  }

  async function challengePlayer(opponentId: string) {
    if (!league.value) return

    const user = useSupabaseUser()
    if (!user.value) return

    const { error: err } = await client.from('matches').insert({
      league_id:     league.value.id,
      season:        league.value.season,
      challenger_id: user.value.id,
      opponent_id:   opponentId,
      status:        'pending',
    })

    if (err) throw new Error(err.message)
    await fetchMatches()
  }

  async function respondToChallenge(matchId: string, accept: boolean) {
    const { error: err } = await client
      .from('matches')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', matchId)

    if (err) throw new Error(err.message)
    await fetchMatches()
  }

  function $reset() {
    league.value  = null
    members.value = []
    matches.value = []
    error.value   = null
  }

  return {
    league, members, matches, loading, error,
    sortedMembers, pendingMatches, completedMatches,
    fetchLeague, fetchMembers, fetchMatches,
    submitMatchResult, challengePlayer, respondToChallenge,
    $reset,
  }
})
