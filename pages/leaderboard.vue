<template>
  <main class="page">
    <div class="container">
      <div class="page-header">
        <p class="page-header-eyebrow">Global</p>
        <h1>Leaderboard</h1>
      </div>

      <!-- League filter -->
      <div class="filters card" style="padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap">
        <h3 style="margin-bottom:0">Filter by league</h3>
        <button
          v-for="l in leagues"
          :key="l.id"
          class="filter-pill"
          :class="{ active: selectedLeague === l.id }"
          @click="selectedLeague = selectedLeague === l.id ? null : l.id"
        >
          {{ l.name }}
        </button>
      </div>

      <section class="card" style="overflow:hidden">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>League</th>
              <th>Tier</th>
              <th>MMR</th>
              <th>Season W-L</th>
              <th>Career W-L</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in filteredRows" :key="`${row.league_id}-${row.profile_id}`">
              <td class="rank-cell">{{ i + 1 }}</td>
              <td>
                <NuxtLink :to="`/league/${row.league_slug}/player/${row.profile_id}`">
                  {{ row.display_name || row.username }}
                </NuxtLink>
              </td>
              <td>
                <NuxtLink :to="`/league/${row.league_slug}`" style="color: var(--txt-muted); font-size:0.8rem">
                  {{ row.league_name }}
                </NuxtLink>
              </td>
              <td><TierBadge :rating="Number(row.rating)" /></td>
              <td class="mono">{{ Number(row.rating).toFixed(1) }}</td>
              <td class="mono">{{ row.season_wins }}-{{ row.season_losses }}</td>
              <td class="mono">{{ row.career_wins }}-{{ row.career_losses }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'

definePageMeta({ layout: 'default' })

// SSR data fetch — this runs on the server for fast initial load
const client = useSupabaseClient<Database>()

const { data: rows } = await useAsyncData('leaderboard', async () => {
  const { data } = await client
    .from('leaderboard')
    .select('*')
    .limit(200)
  return data ?? []
})

const { data: leagues } = await useAsyncData('public-leagues', async () => {
  const { data } = await client
    .from('leagues')
    .select('id, name, slug')
    .eq('is_public', true)
    .order('name')
  return data ?? []
})

const selectedLeague = ref<string | null>(null)

const filteredRows = computed(() => {
  if (!selectedLeague.value) return rows.value ?? []
  return (rows.value ?? []).filter(r => r.league_id === selectedLeague.value)
})
</script>

<style scoped>
.rank-cell {
  font-family: var(--font-mono);
  color: var(--txt-muted);
  width: 2.5rem;
}

.mono {
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.filters { gap: 0.5rem; }

.filter-pill {
  background: var(--court-light);
  border: 1px solid var(--line);
  border-radius: 99px;
  color: var(--txt-secondary);
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-pill:hover  { border-color: var(--txt-secondary); color: var(--txt-primary); }
.filter-pill.active { border-color: var(--serve); color: var(--serve); background: rgba(240,180,41,0.08); }
</style>
