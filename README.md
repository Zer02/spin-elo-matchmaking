# SPIN — Competitive Tennis League

A Nuxt 3 + Supabase app for running real Elo-rated tennis leagues with live standings, match challenges, and head-to-head history.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 3 (SSR) |
| Auth + DB | Supabase |
| State | Pinia |
| Ratings | Custom Elo (server-side) |
| Styling | Global CSS (no component library) |

---

## Project structure

```
spin/
├── assets/css/main.css          # Global design tokens + utility classes
├── components/
│   ├── match/
│   │   ├── MatchChallengeCard.vue
│   │   ├── MatchHistoryTable.vue
│   │   └── ResultModal.vue
│   └── ui/
│       ├── TierBadge.vue
│       └── QualityPill.vue
├── layouts/default.vue          # Nav + root layout
├── pages/
│   ├── index.vue                # Landing page
│   ├── login.vue                # Auth (password + magic link)
│   ├── confirm.vue              # Supabase auth callback
│   ├── dashboard.vue            # User's leagues
│   ├── leaderboard.vue          # Public SSR leaderboard
│   └── league/[slug].vue        # League standings + challenges
├── server/api/
│   ├── leagues/create.post.ts   # Create league (server-side)
│   └── matches/complete.post.ts # Elo recalculation (server-side, tamper-proof)
├── stores/league.ts             # Pinia store for league state
├── types/supabase.ts            # TypeScript types for DB schema
├── utils/elo.ts                 # Pure Elo math (shared client + server)
└── supabase-schema.sql          # Full DB schema — run this first
```

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then run the contents of `supabase-schema.sql` in the SQL editor.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values from **Supabase → Project Settings → API**:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

> ⚠️ `SUPABASE_SERVICE_KEY` is only used in server API routes and never exposed to the client.

### 3. Install and run

```bash
npm install
npm run dev
```

---

## How the Elo system works

All rating math happens **server-side** in `server/api/matches/complete.post.ts` so players can't manipulate their own MMR.

- **Base MMR:** 1500
- **K-factor:** Dynamic — scales with `uncertainty` (starts at 350, decays toward 60 as matches are played). New players' ratings move faster.
- **Match quality:** `max(0, 1 - |r1-r2| / 800)` — used for display only.
- **Tiers:** Rookie (0) → Bronze (1350) → Silver (1500) → Gold (1650) → Platinum (1800) → Diamond (2000+)

---

## Adding a player profile page

The route `/league/[slug]/player/[id]` is stubbed in links but not yet implemented. To add it:

1. Create `pages/league/[slug]/player/[id].vue`
2. Fetch from `league_members`, `matches`, and `elo_history` for that `profile_id`
3. Render the Elo history chart using `vue-chartjs` (already in `package.json`)

---

## Generating TypeScript types from Supabase

Once your schema is live, replace `types/supabase.ts` with generated types:

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

---

## Deployment

Deploy to any Node-compatible host (Vercel, Railway, Render, Fly.io):

```bash
npm run build
# output in .output/
```

Set the same environment variables in your host's dashboard.
