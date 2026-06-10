<template>
  <div>
    <nav class="nav">
      <div class="nav-inner">
        <NuxtLink to="/" class="nav-logo">SPIN</NuxtLink>

        <div class="nav-links">
          <NuxtLink to="/leaderboard" class="nav-link" activeClass="active">
            Leaderboard
          </NuxtLink>

          <template v-if="user">
            <NuxtLink to="/dashboard" class="nav-link" activeClass="active">
              My Leagues
            </NuxtLink>
            <button class="btn btn-ghost" style="padding: 0.4rem 0.9rem" @click="signOut">
              Sign out
            </button>
          </template>

          <template v-else>
            <NuxtLink to="/login" class="btn btn-primary">Sign in</NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <slot />
  </div>
</template>

<script setup lang="ts">
const user   = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

async function signOut() {
  await client.auth.signOut()
  router.push('/')
}
</script>
