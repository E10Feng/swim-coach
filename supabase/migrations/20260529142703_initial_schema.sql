-- user_profiles (references Supabase's built-in auth.users)
create table public.user_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  experience_level text not null check (experience_level in ('beginner', 'recreational', 'masters', 'former_competitive')),
  goal text not null check (goal in ('fitness', 'triathlon', 'get_faster', 'consistency', 'enjoyment')),
  strokes text[] not null default '{"freestyle"}',
  session_duration_min int not null default 45,
  days_per_week int not null default 3,
  pool_format text not null check (pool_format in ('yards_25', 'meters_25', 'meters_50')),
  physical_notes text,
  subscription_status text not null default 'free' check (subscription_status in ('free', 'paid')),
  stripe_customer_id text,
  updated_at timestamptz not null default now()
);

-- sets (expert-curated database)
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  stroke text not null check (stroke in ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'IM', 'mixed')),
  energy_system text not null check (energy_system in ('aerobic', 'threshold', 'anaerobic', 'speed')),
  technique_tags text[] not null default '{}',
  estimated_duration_min int not null,
  estimated_distance_yards int not null,
  difficulty int not null check (difficulty between 1 and 5),
  pool_format text not null check (pool_format in ('yards', 'meters', 'both')),
  set_text text not null,
  coach_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- generated_sets (AI-adapted output stored per user)
create table public.generated_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  base_set_id uuid references public.sets(id) not null,
  session_input jsonb not null,
  generated_set_text text not null,
  coach_commentary text not null,
  energy_system text not null check (energy_system in ('aerobic', 'threshold', 'anaerobic', 'speed')),
  technique_tags text[] not null default '{}',
  difficulty int not null check (difficulty between 1 and 5),
  created_at timestamptz not null default now()
);

-- completed_workouts
create table public.completed_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  generated_set_id uuid references public.generated_sets(id) not null,
  completed_at timestamptz not null default now(),
  rating text check (rating in ('thumbs_up', 'thumbs_down')),
  notes text,
  xp_earned int not null default 0,
  duration_min int
);

-- user_progress (one row per user, auto-created by trigger below)
create table public.user_progress (
  user_id uuid references auth.users(id) on delete cascade primary key,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  total_xp int not null default 0,
  level text not null default 'Lap Swimmer',
  last_completed_at timestamptz,
  sets_generated_this_week int not null default 0,
  week_start date not null default current_date
);

-- badges (static reference data)
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null
);

-- user_badges (junction)
create table public.user_badges (
  user_id uuid references auth.users(id) on delete cascade,
  badge_id uuid references public.badges(id),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- Seed badges
insert into public.badges (slug, name, description) values
  ('first_set',         'First Stroke',    'Complete your first set'),
  ('first_butterfly',   'Butterfly Effect','Complete your first butterfly set'),
  ('streak_7',          '7-Week Streak',   'Hit your weekly goal 7 weeks in a row'),
  ('streak_30',         '30-Week Streak',  'Hit your weekly goal 30 weeks in a row'),
  ('yards_10k',         '10,000 Yards',    'Log 10,000 yards in total'),
  ('all_four_strokes',  'All Four',        'Complete sets in all four strokes');

-- Row Level Security
alter table public.user_profiles enable row level security;
alter table public.sets enable row level security;
alter table public.generated_sets enable row level security;
alter table public.completed_workouts enable row level security;
alter table public.user_progress enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- user_profiles
create policy "users: select own"   on public.user_profiles for select using (auth.uid() = user_id);
create policy "users: insert own"   on public.user_profiles for insert with check (auth.uid() = user_id);
create policy "users: update own"   on public.user_profiles for update using (auth.uid() = user_id);

-- sets (public read for active sets; admin writes handled outside RLS via service role)
create policy "sets: public read active" on public.sets for select using (is_active = true);

-- generated_sets
create policy "gen_sets: select own" on public.generated_sets for select using (auth.uid() = user_id);
create policy "gen_sets: insert own" on public.generated_sets for insert with check (auth.uid() = user_id);

-- completed_workouts
create policy "workouts: select own" on public.completed_workouts for select using (auth.uid() = user_id);
create policy "workouts: insert own" on public.completed_workouts for insert with check (auth.uid() = user_id);

-- user_progress
create policy "progress: select own" on public.user_progress for select using (auth.uid() = user_id);
create policy "progress: insert own" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "progress: update own" on public.user_progress for update using (auth.uid() = user_id);

-- badges (public read)
create policy "badges: public read" on public.badges for select using (true);

-- user_badges
create policy "user_badges: select own" on public.user_badges for select using (auth.uid() = user_id);
create policy "user_badges: insert own" on public.user_badges for insert with check (auth.uid() = user_id);

-- Auto-create user_progress row whenever a user_profile is inserted
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_progress (user_id)
  values (new.user_id);
  return new;
end;
$$;

create trigger on_user_profile_created
  after insert on public.user_profiles
  for each row execute procedure public.handle_new_user_profile();
