-- ============================================================
-- dwee — diary events (STEP 10.2a)
--
-- Two per-user tables backing the /log Diary tab:
--   - event_categories: user-defined + built-in event types
--     (Family / Friend / Work / Club by default) with a color id
--     drawn from the 7-swatch palette.
--   - event_logs:      each event references a category and holds a
--     date range (single-day when start = end), title, memo, and a
--     `has_period_mark` flag (STEP 10.2c will link it to period_logs).
--
-- Anonymous users are blocked at the RLS layer (mirrors 0004).
-- Client-side, anon users still go through IndexedDB (see
-- src/store/authStore.ts::repoModeForUser).
-- Run via: supabase db push
-- ============================================================

-- =============== event_categories ===============
create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color_id text not null check (color_id in (
    'pink', 'lavender', 'gray', 'mint', 'melon', 'apricot', 'peach'
  )),
  is_built_in boolean not null default false,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_categories_user_order_idx
  on public.event_categories (user_id, "order");

alter table public.event_categories enable row level security;

drop policy if exists event_categories_owner on public.event_categories;
create policy event_categories_owner on public.event_categories
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

-- =============== event_logs ===============
create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  title text not null,
  memo text,
  category_id uuid not null references public.event_categories(id) on delete restrict,
  has_period_mark boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_logs_date_order check (end_date >= start_date)
);

create index if not exists event_logs_user_start_idx
  on public.event_logs (user_id, start_date);

alter table public.event_logs enable row level security;

drop policy if exists event_logs_owner on public.event_logs;
create policy event_logs_owner on public.event_logs
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

-- =============== updated_at trigger ===============
create or replace function public.event_logs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists event_logs_touch_updated_at_trg on public.event_logs;
create trigger event_logs_touch_updated_at_trg
  before update on public.event_logs
  for each row execute function public.event_logs_touch_updated_at();
