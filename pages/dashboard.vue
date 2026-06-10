<template>
  <main class="page">
    <div class="container">
      <div class="page-header">
        <p class="page-header-eyebrow">Dashboard</p>
        <h1>My Leagues</h1>
      </div>

      <!-- Create League -->
      <section class="create-section card" style="padding:1.5rem; margin-bottom:2rem">
        <h3 style="margin-bottom:1rem">Start a new league</h3>

        <div v-if="createError" class="flash flash-error">{{ createError }}</div>

        <div class="create-form">
          <input
            v-model="newLeagueName"
            class="input"
            placeholder="League name"
            @keydown.enter="createLeague"
          />
          <input
            v-model="newLeagueDesc"
            class="input"
            placeholder="Description (optional)"
          />
          <button
            class="btn btn-primary"
            :disabled="creating || !newLeagueName.trim()"
            @click="createLeague"
          >
            <span v-if="creating" class="spinner" style="width:14px;height:14px" />
            <span v-else>Create</span>
          </button>
        </div>
      </section>

      <!-- My leagues -->
      <section>
        <div v-if="pending" class="muted" style="padding: 2rem 0">Loading…</div>

        <div v-else-if="!leagues?.length" class="empty-state">
          <p>You haven't joined any leagues yet.</p>
        </div>

        <div v-else class="league-grid">
          <NuxtLink
            v-for="l in leagues"
            :key="l.id"
            :to="`/league/${l.slug}`"
            class="league-card card"
          >
            <div class="league-card-top">
              <h2 class="league-name">{{ l.name }}</h2>
              <span class="status status-accepted">S{{ l.season }}</span>
            </div>
            <p v-if="l.description" class="league-desc">{{ l.description }}</p>
            <div class="league-meta">
              <span>{{ l._memberCount }} players</span>
              <span v-if="l.owner_id === user?.id" class="owner-badge">Owner</span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'

definePageMeta({ layout: 'default', middleware: 'auth' })

const client = useSupabaseClient<Database>()
const user   = useSupabaseUser()
const router = useRouter()

const newLeagueName = ref('')
const newLeagueDesc = ref('')
const creating      = ref(false)
const createError   = ref('')

// Fetch user's leagues (leagues where they are a member)
const { data: leagues, pending, refresh } = await useAsyncData('my-leagues', async () => {
  if (!user.value) return []

  const { data: memberships } = await client
    .from('league_members')
    .select('league_id')
    .eq('profile_id', user.value.id)

  if (!memberships?.length) return []

  const leagueIds = memberships.map(m => m.league_id)

  const { data } = await client
    .from('leagues')
    .select('*')
    .in('id', leagueIds)
    .order('created_at', { ascending: false })

  // Fetch member counts
  const withCounts = await Promise.all((data ?? []).map(async (l) => {
    const { count } = await client
      .from('league_members')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', l.id)
    return { ...l, _memberCount: count ?? 0 }
  }))

  return withCounts
})

async function createLeague() {
  if (!newLeagueName.value.trim()) return
  creating.value = true
  createError.value = ''

  try {
    const { data } = await $fetch<{ slug: string }>('/api/leagues/create', {
      method: 'POST',
      body: {
        name:        newLeagueName.value,
        description: newLeagueDesc.value,
        isPublic:    true,
      },
    })

    router.push(`/league/${data.slug}`)
  } catch (e: any) {
    createError.value = e.data?.message ?? 'Failed to create league'
    creating.value = false
  }
}
</script>

<style scoped>
.create-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .create-form { grid-template-columns: 1fr; }
}

.league-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.league-card {
  padding: 1.5rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.15s, transform 0.1s;
}

.league-card:hover {
  border-color: var(--serve);
  transform: translateY(-2px);
}

.league-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.league-name {
  font-size: 1.25rem;
  color: var(--txt-primary);
}

.league-desc {
  font-size: 0.85rem;
  color: var(--txt-muted);
  line-height: 1.5;
}

.league-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--txt-muted);
  margin-top: auto;
  padding-top: 0.5rem;
}

.owner-badge {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--serve);
  background: rgba(240,180,41,0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--txt-muted);
}

.muted { color: var(--txt-muted); }
</style>
