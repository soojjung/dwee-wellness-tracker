-- ============================================================
-- dwee — diary sticker library (STEP 10.3a)
--
-- Per-user library of stickers used to decorate the /log Diary calendar.
--   - Metadata (ratio, source type, storage path) lives in this table.
--   - Actual PNG/JPEG bytes live in the `media` bucket under
--     {user_id}/diary_stickers/{sticker_id}.{ext} — same convention as
--     home_photos, so anon-lockout policy in 0004_anon_lockout.sql (for
--     Storage) already applies.
--   - `source` distinguishes plain photos (photo) from background-removed
--     stickers (sticker) — STEP 10.3d will populate 'sticker'.
--   - Sticker placements on the calendar (position/rotation/scale) will
--     be added in STEP 10.3b via a separate table.
-- Run via: supabase db push
-- ============================================================

create table if not exists public.diary_stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  ratio text not null check (ratio in ('1:1', '4:3')),
  source text not null check (source in ('photo', 'sticker')),
  created_at timestamptz not null default now()
);

create index if not exists diary_stickers_user_created_idx
  on public.diary_stickers (user_id, created_at desc);

alter table public.diary_stickers enable row level security;

drop policy if exists diary_stickers_owner on public.diary_stickers;
create policy diary_stickers_owner on public.diary_stickers
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());
