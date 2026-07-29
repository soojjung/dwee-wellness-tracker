-- ============================================================
-- dwee — link event_logs back to a period_log (STEP 10.2c)
--
-- When the 생리 toggle on the event-detail sheet is turned on, the client
-- auto-creates a period_log for the event's date range and stores its id
-- here. Turning the toggle off deletes that period_log and clears the
-- reference. `on delete set null` covers the case where the period is
-- removed independently (e.g. from the calendar screen).
-- Run via: supabase db push
-- ============================================================

alter table public.event_logs
  add column if not exists linked_period_id uuid
  references public.period_logs(id) on delete set null;

create index if not exists event_logs_linked_period_idx
  on public.event_logs (linked_period_id)
  where linked_period_id is not null;
