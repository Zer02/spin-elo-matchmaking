<template>
  <div class="challenge-card">
    <div class="challenge-info">
      <div class="challenge-players">
        <span class="player-name">{{ match.challenger?.display_name || match.challenger?.username }}</span>
        <span class="vs">vs</span>
        <span class="player-name">{{ match.opponent?.display_name || match.opponent?.username }}</span>
      </div>
      <span class="status" :class="`status-${match.status}`">{{ match.status }}</span>
    </div>

    <div class="challenge-actions">
      <!-- Incoming pending challenge: opponent sees accept/decline -->
      <template v-if="match.status === 'pending' && match.opponent_id === currentUserId">
        <button class="btn btn-primary" style="padding:0.4rem 0.9rem" @click="$emit('accepted')">
          Accept
        </button>
        <button class="btn btn-danger" style="padding:0.4rem 0.9rem" @click="$emit('declined')">
          Decline
        </button>
      </template>

      <!-- Accepted match: either player can submit result -->
      <template v-else-if="match.status === 'accepted' && isParticipant">
        <button class="btn btn-primary" style="padding:0.4rem 0.9rem" @click="$emit('result', match)">
          Submit result
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  match: any
  currentUserId?: string
}>()

defineEmits(['accepted', 'declined', 'result'])

const isParticipant = computed(() =>
  props.currentUserId &&
  (props.match.challenger_id === props.currentUserId ||
   props.match.opponent_id   === props.currentUserId)
)
</script>

<style scoped>
.challenge-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--court-mid);
  border: 1px solid var(--serve);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.challenge-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.challenge-players {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-name {
  font-weight: 600;
  color: var(--txt-primary);
}

.vs {
  font-size: 0.75rem;
  color: var(--txt-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.challenge-actions { display: flex; gap: 0.5rem; }
</style>
