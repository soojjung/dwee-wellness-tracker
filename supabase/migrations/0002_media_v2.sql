-- ============================================================
-- dwee — media v2
-- Replaces single-photo `home_hero` with multi-slot `home_photos`
-- and adds `home_decor_settings` (photo count, text overlay).
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

-- =============== drop legacy home_hero ===============
drop trigger if exists trg_home_hero_touch on public.home_hero;
drop policy  if exists home_hero_owner    on public.home_hero;
drop table   if exists public.home_hero;

-- =============== home_photos (up to 4 slots per user) ===============
create table public.home_photos (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  slot         smallint    not null check (slot between 0 and 3),
  storage_path text        not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, slot)
);
create index home_photos_user_idx on public.home_photos (user_id);

-- =============== home_decor_settings (1:1 per user) ===============
create table public.home_decor_settings (
  user_id       uuid        primary key references auth.users(id) on delete cascade,
  photo_count   smallint    check (photo_count in (1, 2, 4)),
  text_position text        check (text_position in ('topLeft','topRight','bottomLeft','bottomRight')),
  text_order    text        check (text_order    in ('mainFirst','subFirst')),
  main_text     text        check (main_text is null or char_length(main_text) <= 40),
  sub_text      text        check (sub_text  is null or char_length(sub_text)  <= 20),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============== updated_at triggers ===============
create trigger trg_home_photos_touch         before update on public.home_photos         for each row execute function public.touch_updated_at();
create trigger trg_home_decor_settings_touch before update on public.home_decor_settings for each row execute function public.touch_updated_at();

-- =============== RLS ===============
alter table public.home_photos         enable row level security;
alter table public.home_decor_settings enable row level security;

create policy home_photos_owner         on public.home_photos         for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy home_decor_settings_owner on public.home_decor_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============== Storage cleanup (best-effort) ===============
-- 옛 `{user_id}/home_hero/*` 경로는 그대로 두어도 RLS 가 차단하므로 안전하나,
-- 점유 공간 정리를 원하면 별도 정리 스크립트로 제거 권장.
