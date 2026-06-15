-- ============================================================
-- dwee — body type call log
-- Tracks per-user invocations of the body-type-analyze Edge
-- Function so the function can enforce a daily call limit.
-- Photos themselves are NEVER stored.
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

create table public.body_type_calls (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  called_at  timestamptz not null default now()
);

create index body_type_calls_user_called_at_idx
  on public.body_type_calls (user_id, called_at desc);

alter table public.body_type_calls enable row level security;

-- Users can read their own call log (e.g. to show "x of 5 left today")
create policy body_type_calls_select_own
  on public.body_type_calls
  for select
  using (auth.uid() = user_id);

-- Users can insert rows for themselves; the Edge Function does this
-- on behalf of the user using the request's anon/JWT-scoped client.
create policy body_type_calls_insert_own
  on public.body_type_calls
  for insert
  with check (auth.uid() = user_id);
