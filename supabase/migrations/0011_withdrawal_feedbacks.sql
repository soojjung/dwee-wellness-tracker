-- ============================================================
-- dwee — anonymous withdrawal feedback (015_10~14 사유 수집)
--
-- Users about to close their account can list one or more reasons for
-- leaving; those selections are useful analytics but must survive the
-- upcoming `deleteAccount` cascade. This table is intentionally
--   - anonymous (NO user_id column) so a deleted user has no
--     re-identifiable trail;
--   - INSERT-only from the client (RLS blocks SELECT/UPDATE/DELETE),
--     with reads reserved for the service_role side of the dashboard.
-- `reasons` mirrors the ReasonKey union in the client (nine preset
-- keys + 'other'); the free-form field is capped at 100 chars in the
-- UI but the DB accepts up to 500 as breathing room.
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

create table if not exists public.withdrawal_feedbacks (
  id uuid primary key default gen_random_uuid(),
  reasons text[] not null check (array_length(reasons, 1) between 1 and 10),
  other_text text check (char_length(other_text) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists withdrawal_feedbacks_created_idx
  on public.withdrawal_feedbacks (created_at desc);

alter table public.withdrawal_feedbacks enable row level security;

-- Only real (non-anonymous) signed-in users can leave feedback — anonymous
-- sessions can't and shouldn't spam the table. Nothing else is allowed via
-- the anon key; service_role bypasses RLS for dashboard reads.
drop policy if exists withdrawal_feedbacks_insert on public.withdrawal_feedbacks;
create policy withdrawal_feedbacks_insert on public.withdrawal_feedbacks
  for insert
  with check (auth.uid() is not null and not public.is_anonymous_jwt());
