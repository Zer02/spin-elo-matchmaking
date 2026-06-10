<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal card">
      <div class="modal-header">
        <h3>Submit match result</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="match-label">
          <strong>{{ match.challenger?.display_name || match.challenger?.username }}</strong>
          vs
          <strong>{{ match.opponent?.display_name || match.opponent?.username }}</strong>
        </p>

        <!-- Score inputs -->
        <div class="score-row">
          <div class="score-field">
            <label class="field-label">
              {{ match.challenger?.display_name || match.challenger?.username }} score
            </label>
            <input
              v-model.number="challengerScore"
              type="number"
              class="input"
              min="0"
              placeholder="6"
            />
          </div>
          <span class="score-sep">—</span>
          <div class="score-field">
            <label class="field-label">
              {{ match.opponent?.display_name || match.opponent?.username }} score
            </label>
            <input
              v-model.number="opponentScore"
              type="number"
              class="input"
              min="0"
              placeholder="4"
            />
          </div>
        </div>

        <!-- Winner select -->
        <div style="margin-top:1.25rem">
          <label class="field-label">Winner</label>
          <div class="winner-options">
            <label
              class="winner-option"
              :class="{ selected: winnerId === match.challenger_id }"
            >
              <input
                v-model="winnerId"
                type="radio"
                :value="match.challenger_id"
                style="display:none"
              />
              {{ match.challenger?.display_name || match.challenger?.username }}
            </label>
            <label
              class="winner-option"
              :class="{ selected: winnerId === match.opponent_id }"
            >
              <input
                v-model="winnerId"
                type="radio"
                :value="match.opponent_id"
                style="display:none"
              />
              {{ match.opponent?.display_name || match.opponent?.username }}
            </label>
          </div>
        </div>

        <div v-if="error" class="flash flash-error" style="margin-top:1rem">{{ error }}</div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
        <button
          class="btn btn-primary"
          :disabled="!winnerId || submitting"
          @click="submit"
        >
          <span v-if="submitting" class="spinner" style="width:14px;height:14px" />
          <span v-else>Confirm result</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ match: any }>()
const emit  = defineEmits(['close', 'submit'])

const winnerId       = ref<string>('')
const challengerScore = ref<number | null>(null)
const opponentScore   = ref<number | null>(null)
const submitting     = ref(false)
const error          = ref('')

async function submit() {
  if (!winnerId.value) return
  submitting.value = true
  error.value = ''

  try {
    emit('submit', {
      matchId:         props.match.id,
      winnerId:        winnerId.value,
      challengerScore: challengerScore.value,
      opponentScore:   opponentScore.value,
    })
  } catch (e: any) {
    error.value = e.message
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 460px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--line);
}

.close-btn {
  background: none;
  border: none;
  color: var(--txt-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.15s;
}

.close-btn:hover { color: var(--txt-primary); }

.modal-body {
  padding: 1.5rem;
}

.match-label {
  color: var(--txt-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.score-row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.score-field { flex: 1; }

.score-sep {
  padding-bottom: 0.6rem;
  color: var(--txt-muted);
  font-size: 1.1rem;
}

.field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--txt-muted);
  margin-bottom: 0.4rem;
}

.winner-options {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.4rem;
}

.winner-option {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--court-light);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--txt-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.winner-option:hover { border-color: var(--txt-secondary); color: var(--txt-primary); }

.winner-option.selected {
  border-color: var(--serve);
  color: var(--serve);
  background: rgba(240,180,41,0.08);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
