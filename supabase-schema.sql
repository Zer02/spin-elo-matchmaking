-- =====================================================
-- SPIN — Supabase Schema
-- Run this in your Supabase SQL editor
-- =====================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────
-- One row per auth.users entry
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Leagues ─────────────────────────────────────────
create table public.leagues (
  id          uuid default uuid_generate_v4() primary key,
  owner_id    uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  slug        text unique not null,
  description text,
  is_public   boolean default true,
  season      int default 1,
  created_at  timestamptz default now()
);

alter table public.leagues enable row level security;

create policy "Public leagues are viewable by everyone"
  on leagues for select using (is_public = true);

create policy "Owners can manage their league"
  on leagues for all using (auth.uid() = owner_id);


-- ── League Members ───────────────────────────────────
create table public.league_members (
  id           uuid default uuid_generate_v4() primary key,
  league_id    uuid references public.leagues(id) on delete cascade not null,
  profile_id   uuid references public.profiles(id) on delete cascade not null,
  rating       numeric default 1500,
  uncertainty  numeric default 350,
  season_wins  int default 0,
  season_losses int default 0,
  career_wins  int default 0,
  career_losses int default 0,
  joined_at    timestamptz default now(),
  unique (league_id, profile_id)
);

alter table public.league_members enable row level security;

create policy "Members of a league can view members"
  on league_members for select using (true);

create policy "League owner can manage members"
  on league_members for all using (
    exists (
      select 1 from leagues
      where leagues.id = league_id
      and leagues.owner_id = auth.uid()
    )
  );

create policy "Users can join leagues"
  on league_members for insert with check (auth.uid() = profile_id);


-- ── Matches ──────────────────────────────────────────
-- Represents a challenge/match between two players
create table public.matches (
  id              uuid default uuid_generate_v4() primary key,
  league_id       uuid references public.leagues(id) on delete cascade not null,
  season          int not null,
  challenger_id   uuid references public.profiles(id) not null,
  opponent_id     uuid references public.profiles(id) not null,
  winner_id       uuid references public.profiles(id),   -- null until confirmed
  challenger_score int,
  opponent_score   int,
  status          text default 'pending'
                  check (status in ('pending','accepted','completed','declined','disputed')),
  quality         numeric,   -- 0..1 match quality score
  challenger_delta numeric,  -- MMR change for challenger
  opponent_delta   numeric,  -- MMR change for opponent
  notes           text,
  created_at      timestamptz default now(),
  completed_at    timestamptz
);

alter table public.matches enable row level security;

create policy "League members can view matches"
  on matches for select using (true);

create policy "Players can create challenges"
  on matches for insert with check (auth.uid() = challenger_id);

create policy "Participants can update their match"
  on matches for update using (
    auth.uid() = challenger_id or auth.uid() = opponent_id
  );


-- ── Elo History ──────────────────────────────────────
create table public.elo_history (
  id          uuid default uuid_generate_v4() primary key,
  league_id   uuid references public.leagues(id) on delete cascade not null,
  profile_id  uuid references public.profiles(id) not null,
  season      int not null,
  rating      numeric not null,
  match_id    uuid references public.matches(id),
  recorded_at timestamptz default now()
);

alter table public.elo_history enable row level security;

create policy "Elo history is publicly viewable"
  on elo_history for select using (true);


-- ── Useful views ─────────────────────────────────────
create or replace view public.leaderboard as
  select
    lm.league_id,
    lm.profile_id,
    p.username,
    p.display_name,
    p.avatar_url,
    lm.rating,
    lm.uncertainty,
    lm.season_wins,
    lm.season_losses,
    lm.career_wins,
    lm.career_losses,
    l.name as league_name,
    l.slug as league_slug,
    l.season as current_season
  from league_members lm
  join profiles p on p.id = lm.profile_id
  join leagues l on l.id = lm.league_id
  order by lm.rating desc;
