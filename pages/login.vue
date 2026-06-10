<template>
  <main class="page">
    <div class="container">
      <div class="auth-wrap">
        <NuxtLink to="/" class="nav-logo" style="display:block; margin-bottom: 2rem">SPIN</NuxtLink>

        <div class="auth-card card">
          <!-- Tabs -->
          <div class="auth-tabs">
            <button
              class="auth-tab"
              :class="{ active: tab === 'login' }"
              @click="tab = 'login'"
            >Sign in</button>
            <button
              class="auth-tab"
              :class="{ active: tab === 'signup' }"
              @click="tab = 'signup'"
            >Create account</button>
          </div>

          <div class="auth-body">
            <div v-if="flash" class="flash" :class="`flash-${flashType}`">
              {{ flash }}
            </div>

            <!-- Login form -->
            <form v-if="tab === 'login'" @submit.prevent="handleLogin">
              <label class="field-label">Email</label>
              <input
                v-model="email"
                type="email"
                class="input"
                placeholder="you@example.com"
                required
              />

              <label class="field-label" style="margin-top:1rem">Password</label>
              <input
                v-model="password"
                type="password"
                class="input"
                placeholder="••••••••"
                required
              />

              <button
                type="submit"
                class="btn btn-primary"
                style="width:100%; margin-top:1.5rem; justify-content:center"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner" style="width:14px;height:14px" />
                <span v-else>Sign in</span>
              </button>

              <div class="auth-divider">or</div>

              <button
                type="button"
                class="btn btn-ghost"
                style="width:100%; justify-content:center"
                :disabled="loading"
                @click="handleMagicLink"
              >
                Send magic link
              </button>
            </form>

            <!-- Signup form -->
            <form v-else @submit.prevent="handleSignup">
              <label class="field-label">Display name</label>
              <input
                v-model="displayName"
                type="text"
                class="input"
                placeholder="Roger F."
                required
              />

              <label class="field-label" style="margin-top:1rem">Email</label>
              <input
                v-model="email"
                type="email"
                class="input"
                placeholder="you@example.com"
                required
              />

              <label class="field-label" style="margin-top:1rem">Password</label>
              <input
                v-model="password"
                type="password"
                class="input"
                placeholder="At least 8 characters"
                minlength="8"
                required
              />

              <button
                type="submit"
                class="btn btn-primary"
                style="width:100%; margin-top:1.5rem; justify-content:center"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner" style="width:14px;height:14px" />
                <span v-else>Create account</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const router = useRouter()

const tab         = ref<'login' | 'signup'>('login')
const email       = ref('')
const password    = ref('')
const displayName = ref('')
const loading     = ref(false)
const flash       = ref('')
const flashType   = ref<'error' | 'success'>('error')

function setFlash(msg: string, type: 'error' | 'success' = 'error') {
  flash.value     = msg
  flashType.value = type
}

async function handleLogin() {
  loading.value = true
  flash.value   = ''

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (error) { setFlash(error.message); return }
  router.push('/dashboard')
}

async function handleMagicLink() {
  if (!email.value) { setFlash('Enter your email first'); return }
  loading.value = true

  const { error } = await client.auth.signInWithOtp({ email: email.value })
  loading.value = false

  if (error) { setFlash(error.message); return }
  setFlash('Magic link sent — check your inbox.', 'success')
}

async function handleSignup() {
  loading.value = true
  flash.value   = ''

  const { error } = await client.auth.signUp({
    email:    email.value,
    password: password.value,
    options: {
      data: { display_name: displayName.value },
    },
  })

  loading.value = false

  if (error) { setFlash(error.message); return }
  setFlash('Account created! Check your email to confirm.', 'success')
}
</script>

<style scoped>
.auth-wrap {
  max-width: 420px;
  margin: 5rem auto;
}

.auth-card { overflow: hidden; }

.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--line);
}

.auth-tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  color: var(--txt-muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.03em;
}

.auth-tab:hover { color: var(--txt-secondary); }

.auth-tab.active {
  color: var(--txt-primary);
  box-shadow: 0 -2px 0 var(--serve) inset;
}

.auth-body { padding: 1.75rem; }

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--txt-muted);
  margin-bottom: 0.4rem;
}

.auth-divider {
  text-align: center;
  color: var(--txt-muted);
  font-size: 0.8rem;
  margin: 1rem 0;
  position: relative;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: var(--line);
}

.auth-divider::before { left: 0; }
.auth-divider::after  { right: 0; }
</style>
