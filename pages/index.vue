<template>
  <main class="page">
    <div class="container">
      <!-- Hero -->
      <section class="hero">
        <p class="page-header-eyebrow">Competitive Tennis League</p>
        <h1>Track every serve.<br /><em>Own every rank.</em></h1>
        <p class="hero-sub">
          SPIN gives your league real Elo ratings, live standings, and
          match-by-match history — built for players who take the game seriously.
        </p>
        <div class="hero-cta">
          <NuxtLink to="/login" class="btn btn-primary" style="font-size:1rem; padding: 0.75rem 2rem">
            Start a league →
          </NuxtLink>
          <NuxtLink to="/leaderboard" class="btn btn-ghost" style="font-size:1rem; padding: 0.75rem 2rem">
            View leaderboard
          </NuxtLink>
        </div>
      </section>

      <div class="section-divider" style="margin: 4rem 0" />

      <!-- Feature grid -->
      <section class="features">
        <h3 style="margin-bottom: 2rem">How it works</h3>
        <div class="feature-grid">
          <div class="feature-card card">
            <span class="feature-icon">🎾</span>
            <h4>Challenge anyone</h4>
            <p>Send a challenge to any league member. They accept, you play, both confirm the result.</p>
          </div>
          <div class="feature-card card">
            <span class="feature-icon">📈</span>
            <h4>Live Elo ratings</h4>
            <p>Dynamic K-factor means your MMR moves faster early on, stabilising as you play more.</p>
          </div>
          <div class="feature-card card">
            <span class="feature-icon">🏆</span>
            <h4>Tier system</h4>
            <p>Rookie → Bronze → Silver → Gold → Platinum → Diamond. Climb the court.</p>
          </div>
          <div class="feature-card card">
            <span class="feature-icon">📊</span>
            <h4>Deep stats</h4>
            <p>Head-to-head records, seasonal charts, career history — your whole game in one place.</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<style scoped>
.hero {
  padding: 6rem 0 4rem;
  max-width: 680px;
}

.hero h1 {
  margin: 0.75rem 0 1.25rem;
  color: var(--txt-primary);
}

.hero h1 em {
  font-style: italic;
  color: var(--serve);
}

.hero-sub {
  font-size: 1.1rem;
  color: var(--txt-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 540px;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.features { padding-bottom: 4rem; }

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-icon { font-size: 1.75rem; }

.feature-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--txt-primary);
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--txt-secondary);
  line-height: 1.6;
}
</style>
