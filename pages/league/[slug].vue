<template>
  <main class="page">
    <div class="container">
      <!-- Loading -->
      <div v-if="store.loading" style="padding: 4rem 0; text-align:center">
        <span class="spinner" style="width:28px;height:28px;border-width:3px" />
      </div>

      <template v-else-if="store.league">
        <!-- Header -->
        <div class="page-header">
          <p class="page-header-eyebrow">Season {{ store.league.season }}</p>
          <div class="league-header-row">
            <h1>{{ store.league.name }}</h1>
            <div class="league-header-actions">
              <button
                v-if="isMember && !isOwner"
                class="btn btn-ghost btn-sm"
                @click="joinLeaveToggle"
              >Leave league</button>
              <button
                v-if="!isMember && user"
                class="btn btn-primary"
                :disabled="joining"
                @click="joinLeague"
              >
                <span v-if="joining" class="spinner" style="width:12px;height:12px" />
                <span v-else>Join league</span>
              </button>
              <NuxtLink v-if="!user" to="/login" class="btn btn-primary">
                Sign in to join
              </NuxtLink>
            </div>
          </div>
          <p v-if="store.league.description" class="league-desc">
            {{ store.league.description }}
          </p>
        </div>

        <!-- Flash -->
        <div v-if="flash" class="flash" :class="`flash-${flashType}`">{{ flash }}</div>

        <!-- Pending challenges for me -->
        <section v-if="incomingChallenges.length" style="margin-bottom:2rem">
          <h3 style="margin-bottom:0.75rem">Incoming challenges</h3>
          <div class="challenge-list">
            <MatchChallengeCard
              v-for="m in incomingChallenges"
              :key="m.id"
              :match="m"
              :current-user-id="user?.id"
              @accepted="store.respondToChallenge(m.id, true)"
              @declined="store.respondToChallenge(m.id, false)"
              @result="handleResult"
            />
          </div>
        </section>

        <!-- Accepted matches awaiting result -->
        <section v-if="acceptedMatches.length" style="margin-bottom:2rem">
          <h3 style="margin-bottom:0.75rem">Active matches</h3>
          <div class="challenge-list">
            <MatchChallengeCard
              v-for="m in acceptedMatches"
              :key="m.id"
              :match="m"
              :current-user-id="user?.id"
              @result="handleResult"
            />
          </div>
        </section>

        <!-- Standings -->
        <section class="card" style="margin-bottom:2rem; overflow:hidden">
          <div class="section-header">
            <h3>Standings</h3>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Tier</th>
                <th>MMR</th>
                <th>Season</th>
                <th>Career</th>
                <th v-if="isMember && user"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(m, i) in store.sortedMembers"
                :key="m.id"
                :class="{ 'my-row': m.profile_id === user?.id }"
              >
                <td class="rank-cell">{{ i + 1 }}</td>
                <td>
                  <NuxtLink :to="`/league/${slug}/player/${m.profile_id}`">
                    {{ m.profiles?.display_name || m.profiles?.username }}
                  </NuxtLink>
                </td>
                <td>
                  <TierBadge :rating="Number(m.rating)" />
                </td>
                <td class="mono">{{ Number(m.rating).toFixed(1) }}</td>
                <td class="mono">{{ m.season_wins }}-{{ m.season_losses }}</td>
                <td class="mono">{{ m.career_wins }}-{{ m.career_losses }}</td>
                <td v-if="isMember && user && m.profile_id !== user.id">
                  <button
                    class="btn btn-ghost"
                    style="padding:0.3rem 0.7rem; font-size:0.75rem"
                    @click="challenge(m.profile_id)"
                  >
                    Challenge
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Recent matches -->
        <section class="card" style="overflow:hidden">
          <div class="section-header">
            <h3>Recent matches</h3>
          </div>
          <MatchHistoryTable :matches="store.completedMatches.slice(0, 20)" />
        </section>
      </template>

      <!-- Result modal -->
      <ResultModal
        v-if="resultModal"
        :match="resultModal"
        @close="resultModal = null"
        @submit="submitResult"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'

definePageMeta({ layout: 'default' })

const route  = useRoute()
const user   = useSupabaseUser()
const client = useSupabaseClient<Database>()
const store  = useLeagueStore()

const slug     = route.params.slug as string
const joining  = ref(false)
const flash    = ref('')
const flashType = ref<'error' | 'success'>('error')
const resultModal = ref<any>(null)

await store.fetchLeague(slug)

const isMember = computed(() =>
  !!store.members.find(m => m.profile_id === user.value?.id)
)

const isOwner = computed(() =>
  store.league?.owner_id === user.value?.id
)

const incomingChallenges = computed(() =>
  store.pendingMatches.filter(
    m => m.opponent_id === user.value?.id && m.status === 'pending'
  )
)

const acceptedMatches = computed(() =>
  store.pendingMatches.filter(
    m =>
      m.status === 'accepted' &&
      (m.challenger_id === user.value?.id || m.opponent_id === user.value?.id)
  )
)

async function joinLeague() {
  if (!user.value || !store.league) return
  joining.value = true

  try {
    await client.from('league_members').insert({
      league_id:  store.league.id,
      profile_id: user.value.id,
    })
    await store.fetchMembers()
  } catch (e: any) {
    flash.value = e.message
    flashType.value = 'error'
  }

  joining.value = false
}

async function joinLeaveToggle() {
  if (!user.value || !store.league) return

  await client
    .from('league_members')
    .delete()
    .eq('league_id', store.league.id)
    .eq('profile_id', user.value.id)

  await store.fetchMembers()
}

async function challenge(opponentId: string) {
  try {
    await store.challengePlayer(opponentId)
    flash.value = 'Challenge sent!'
    flashType.value = 'success'
  } catch (e: any) {
    flash.value = e.message
    flashType.value = 'error'
  }
}

function handleResult(match: any) {
  resultModal.value = match
}

async function submitResult({ matchId, winnerId, challengerScore, opponentScore }: any) {
  try {
    await store.submitMatchResult(matchId, winnerId, challengerScore, opponentScore)
    resultModal.value = null
    flash.value = 'Result recorded!'
    flashType.value = 'success'
  } catch (e: any) {
    flash.value = e.message
    flashType.value = 'error'
  }
}

// Clean up store on leave
onUnmounted(() => store.$reset())
</script>

<style scoped>
.league-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.league-header-actions { display: flex; gap: 0.5rem; }

.league-desc {
  margin-top: 0.5rem;
  color: var(--txt-muted);
  font-size: 0.9rem;
}

.section-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.rank-cell {
  font-family: var(--font-mono);
  color: var(--txt-muted);
  width: 2.5rem;
}

.mono {
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.my-row td { background: rgba(240,180,41,0.04); }

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
