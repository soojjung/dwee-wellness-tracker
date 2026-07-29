-- ============================================================
-- dwee — diary sticker placements (STEP 10.3b)
--
-- An instance of a sticker placed on the diary calendar for a specific
-- (year, month). Multiple placements can reference the same sticker
-- (the sticker itself lives in diary_stickers, added in 0008). Coordinate
-- system: x/y are pixel offsets at a nominal 358px calendar container
-- width, scale is a multiplier on the base sticker size (96px), rotation
-- is in degrees.
--
-- `on delete cascade` from diary_stickers → placements: deleting a
-- sticker from the library also removes all its placements.
-- Run via: supabase db push
-- ============================================================

create table if not exists public.diary_sticker_placements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id uuid not null references public.diary_stickers(id) on delete cascade,
  year int not null,
  month_index int not null check (month_index between 0 and 11),
  x real not null,
  y real not null,
  scale real not null default 1 check (scale > 0),
  rotation real not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diary_sticker_placements_user_month_idx
  on public.diary_sticker_placements (user_id, year, month_index);

alter table public.diary_sticker_placements enable row level security;

drop policy if exists diary_sticker_placements_owner on public.diary_sticker_placements;
create policy diary_sticker_placements_owner on public.diary_sticker_placements
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

create or replace function public.diary_sticker_placements_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists diary_sticker_placements_touch_trg on public.diary_sticker_placements;
create trigger diary_sticker_placements_touch_trg
  before update on public.diary_sticker_placements
  for each row execute function public.diary_sticker_placements_touch_updated_at();
