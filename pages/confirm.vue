<template>
  <main class="page">
    <div class="container" style="text-align:center; padding: 6rem 0">
      <span class="spinner" style="width:32px;height:32px;border-width:3px" />
      <p style="margin-top:1rem; color: var(--txt-muted)">Confirming your login…</p>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// @nuxtjs/supabase handles the token exchange automatically
// This page just shows a spinner while it redirects
const router = useRouter()

onMounted(async () => {
  await new Promise(r => setTimeout(r, 1500))
  router.push('/dashboard')
})
</script>
