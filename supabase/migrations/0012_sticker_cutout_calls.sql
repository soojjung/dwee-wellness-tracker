-- ============================================================
-- dwee — sticker cutout call log
-- Tracks per-user invocations of the sticker-cutout Edge
-- Function so the function can enforce a daily call limit.
-- Photos themselves are NEVER stored.
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

create table public.sticker_cutout_calls (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  called_at  timestamptz not null default now()
);

create index sticker_cutout_calls_user_called_at_idx
  on public.sticker_cutout_calls (user_id, called_at desc);

alter table public.sticker_cutout_calls enable row level security;

create policy sticker_cutout_calls_select_own
  on public.sticker_cutout_calls
  for select
  using (auth.uid() = user_id);

create policy sticker_cutout_calls_insert_own
  on public.sticker_cutout_calls
  for insert
  with check (auth.uid() = user_id);
