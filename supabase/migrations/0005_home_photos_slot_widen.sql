-- ============================================================
-- dwee — widen home_photos.slot to 0..6
-- Backs the per-count photo layout: count=1 → [0], count=2 → [1,2],
-- count=4 → [3,4,5,6]. Existing rows keep their slot number and are
-- migrated to the range matching whatever photo_count they were saved
-- under, so switching counts preserves each independent photo set.
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

-- =============== drop old check, migrate existing rows, add new check ===============
alter table public.home_photos drop constraint if exists home_photos_slot_check;

-- Relocate legacy slots 0..3 into the new per-count ranges.
-- Uses a temporary offset (+10) so target slots never collide with source rows
-- mid-update (both share primary key user_id + slot).
update public.home_photos hp
set slot = case s.photo_count
  when 2 then (case hp.slot when 0 then 11 when 1 then 12 end)
  when 4 then (case hp.slot when 0 then 13 when 1 then 14 when 2 then 15 when 3 then 16 end)
  else null
end
from public.home_decor_settings s
where hp.user_id = s.user_id
  and s.photo_count in (2, 4)
  and hp.slot between 0 and 3
  and case s.photo_count
    when 2 then hp.slot between 0 and 1
    when 4 then hp.slot between 0 and 3
    else false
  end;

update public.home_photos set slot = slot - 10 where slot between 11 and 16;

alter table public.home_photos add constraint home_photos_slot_check check (slot between 0 and 6);
