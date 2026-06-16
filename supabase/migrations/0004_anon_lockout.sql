-- ============================================================
-- dwee — anonymous user lockout (defensive)
-- ============================================================
-- Decision (MVP2, C1/C2): anonymous users stay on IndexedDB.
-- Only authenticated (email / OAuth) users are routed to Supabase
-- via src/data/index.ts. This migration adds a defensive RLS layer
-- so an accidental code path that calls Supabase while anonymous
-- gets rejected at the DB level rather than silently writing rows
-- belonging to a short-lived anonymous identity.
--
-- body_type_calls intentionally KEEPS anonymous access: the
-- magazine diagnose Edge Function counts calls per user including
-- anonymous, and storing the photo itself is prohibited so the
-- row is the only audit trail.
--
-- on_auth_user_created (SECURITY DEFINER) still runs for the
-- anonymous sign-in, so a profiles row is created; the anon user
-- just can't mutate it via RLS. Stale-anon-profile cleanup is a
-- separate operational task (future STEP).

create or replace function public.is_anonymous_jwt()
returns boolean language sql stable as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

-- Per-table owner policies: drop + recreate with anon lockout.

drop policy if exists profiles_owner             on public.profiles;
drop policy if exists period_logs_owner          on public.period_logs;
drop policy if exists condition_logs_owner       on public.condition_logs;
drop policy if exists home_photos_owner          on public.home_photos;
drop policy if exists home_decor_settings_owner  on public.home_decor_settings;

create policy profiles_owner on public.profiles
  for all
  using      (id = auth.uid() and not public.is_anonymous_jwt())
  with check (id = auth.uid() and not public.is_anonymous_jwt());

create policy period_logs_owner on public.period_logs
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

create policy condition_logs_owner on public.condition_logs
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

create policy home_photos_owner on public.home_photos
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

create policy home_decor_settings_owner on public.home_decor_settings
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());

-- Storage media bucket: same defensive rule.

drop policy if exists media_owner_read   on storage.objects;
drop policy if exists media_owner_insert on storage.objects;
drop policy if exists media_owner_update on storage.objects;
drop policy if exists media_owner_delete on storage.objects;

create policy media_owner_read on storage.objects for select
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not public.is_anonymous_jwt()
  );
create policy media_owner_insert on storage.objects for insert
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not public.is_anonymous_jwt()
  );
create policy media_owner_update on storage.objects for update
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not public.is_anonymous_jwt()
  );
create policy media_owner_delete on storage.objects for delete
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not public.is_anonymous_jwt()
  );
