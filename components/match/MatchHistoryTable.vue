<template>
  <div>
    <div v-if="!matches.length" class="empty">
      No matches played yet.
    </div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Season</th>
          <th>Winner</th>
          <th>Loser</th>
          <th>Score</th>
          <th>MMR Δ</th>
          <th>Quality</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in matches" :key="m.id">
          <td class="mono muted">S{{ m.season }}</td>
          <td class="result-win">
            {{ m.winner?.display_name || m.winner?.username || '—' }}
          </td>
          <td class="result-loss">
            {{
              m.winner_id === m.challenger_id
                ? (m.opponent?.display_name  || m.opponent?.username)
                : (m.challenger?.display_name || m.challenger?.username)
            }}
          </td>
          <td class="mono">
            <span v-if="m.challenger_score != null">
              {{ m.challenger_score }}–{{ m.opponent_score }}
            </span>
            <span v-else class="muted">—</span>
          </td>
          <td>
            <span v-if="m.winner_id" class="delta delta-pos">
              +{{ Math.round(Math.abs(Number(m.challenger_delta ?? 0))) }}
            </span>
          </td>
          <td>
            <QualityPill v-if="m.quality != null" :quality="Number(m.quality)" />
          </td>
          <td class="mono muted">{{ formatDate(m.completed_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{ matches: any[] }>()

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.mono  { font-family: var(--font-mono); font-size: 0.83rem; }
.muted { color: var(--txt-muted); }
.empty { padding: 2rem; text-align: center; color: var(--txt-muted); font-size: 0.875rem; }
</style>
