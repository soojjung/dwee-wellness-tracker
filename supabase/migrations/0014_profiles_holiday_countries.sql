-- ============================================================
-- dwee — 다이어리 공휴일 표시 나라 (profiles.holiday_countries)
--
-- 다이어리 달력에 얹을 공휴일 나라 목록. 공휴일 자체는 클라이언트가 규칙과
-- 표로 계산하므로 저장하지 않고, 어느 나라를 켰는지만 둔다.
--
-- null = "언어 따라 자동" (ko → KR, en → US). 사용자가 마이페이지에서 토글을
-- 건드리면 명시적 배열이 들어오고, 이후 언어를 바꿔도 그 선택은 유지된다.
-- 빈 배열은 "아무 나라도 표시하지 않음" 이라 null 과 구분된다.
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

alter table public.profiles
  add column if not exists holiday_countries text[] null;

alter table public.profiles
  drop constraint if exists profiles_holiday_countries_check;

alter table public.profiles
  add constraint profiles_holiday_countries_check
  check (holiday_countries is null or holiday_countries <@ array['KR', 'US']::text[]);
