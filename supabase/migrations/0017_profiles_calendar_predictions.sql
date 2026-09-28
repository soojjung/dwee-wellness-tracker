-- ============================================================
-- dwee — 다이어리 달력 예측 표시 (profiles.show_calendar_predictions)
--
-- 마이페이지 > 설정의 "예정일 표시"(en "Calendar predictions") 스위치. 켜져 있으면 다이어리 달력에
-- 다음 예상 생리일·예상 가임기를 홈과 같은 색으로 표시한다 (TestFlight R4-6).
-- 다른 프로필 설정처럼 계정에 두어 기기 간 같은 값을 쓴다.
-- Run via: paste into SQL editor  (remote has no migration history — see README)
-- ============================================================

alter table public.profiles
  add column if not exists show_calendar_predictions boolean not null default true;
