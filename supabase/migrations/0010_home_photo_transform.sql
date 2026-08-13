-- ============================================================
-- dwee — non-destructive photo edit transform
--
-- Adds `transform jsonb` to `home_photos` so pan/zoom edits are stored
-- separately from the original blob. Payload shape:
--   { "scale": number, "offsetXNorm": number, "offsetYNorm": number }
-- `null` means "no user edit" (render with default cover fit).
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

alter table public.home_photos
  add column if not exists transform jsonb;
