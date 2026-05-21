-- ============================================================
-- dwee — initial schema (profiles · period · condition · media)
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

-- =============== profiles (1:1 with auth.users) ===============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'ko' check (locale in ('ko','en')),
  average_cycle_length smallint not null default 28 check (average_cycle_length between 15 and 60),
  average_period_length smallint not null default 5 check (average_period_length between 1 and 14),
  notifications_enabled boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============== period_logs ===============
create table public.period_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint period_logs_end_after_start check (end_date is null or end_date >= start_date),
  constraint period_logs_user_start_unique unique (user_id, start_date)
);
create index period_logs_user_start_idx on public.period_logs (user_id, start_date desc);

-- =============== condition_logs ===============
create table public.condition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  mood text check (mood in ('great','good','neutral','down','low')),
  energy text check (energy in ('high','medium','low')),
  pain text check (pain in ('none','mild','moderate','severe')),
  bloating text check (bloating in ('none','mild','severe')),
  appetite text check (appetite in ('low','normal','high')),
  skin text check (skin in ('clear','oily','dry','breakout')),
  memo text check (memo is null or char_length(memo) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint condition_logs_user_date_unique unique (user_id, date)
);
create index condition_logs_user_date_idx on public.condition_logs (user_id, date desc);

-- =============== home_hero (1:1 per user) ===============
create table public.home_hero (
  user_id uuid primary key references auth.users(id) on delete cascade,
  storage_path text not null,
  width smallint,
  height smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============== home_overlays (1:N per user) ===============
create table public.home_overlays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  position_x real not null default 0.5 check (position_x between 0 and 1),
  position_y real not null default 0.5 check (position_y between 0 and 1),
  order_index smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index home_overlays_user_order_idx on public.home_overlays (user_id, order_index);

-- =============== updated_at 자동 갱신 ===============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_profiles_touch       before update on public.profiles       for each row execute function public.touch_updated_at();
create trigger trg_period_logs_touch    before update on public.period_logs    for each row execute function public.touch_updated_at();
create trigger trg_condition_logs_touch before update on public.condition_logs for each row execute function public.touch_updated_at();
create trigger trg_home_hero_touch      before update on public.home_hero      for each row execute function public.touch_updated_at();
create trigger trg_home_overlays_touch  before update on public.home_overlays  for each row execute function public.touch_updated_at();

-- =============== 신규 가입 시 profile 자동 생성 ===============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============== RLS ===============
alter table public.profiles       enable row level security;
alter table public.period_logs    enable row level security;
alter table public.condition_logs enable row level security;
alter table public.home_hero      enable row level security;
alter table public.home_overlays  enable row level security;

create policy profiles_owner       on public.profiles       for all using (id = auth.uid())       with check (id = auth.uid());
create policy period_logs_owner    on public.period_logs    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy condition_logs_owner on public.condition_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy home_hero_owner      on public.home_hero      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy home_overlays_owner  on public.home_overlays  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============== Storage bucket: media (private) ===============
-- Supabase 콘솔에서 'media' 버킷을 private로 먼저 만든 뒤, 아래 정책 적용.
insert into storage.buckets (id, name, public) values ('media', 'media', false)
on conflict (id) do nothing;

create policy media_owner_read on storage.objects for select
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_owner_insert on storage.objects for insert
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_owner_update on storage.objects for update
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy media_owner_delete on storage.objects for delete
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- =============== Realtime publication (선택) ===============
-- 다기기 라이브 동기화가 필요해진 시점에 추가
-- alter publication supabase_realtime add table public.period_logs;
-- alter publication supabase_realtime add table public.condition_logs;
-- alter publication supabase_realtime add table public.home_overlays;
