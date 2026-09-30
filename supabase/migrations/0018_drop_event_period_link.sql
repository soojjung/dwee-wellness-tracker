-- ============================================================
-- dwee — 일정의 생리 연결 컬럼 삭제 (event_logs.has_period_mark / linked_period_id)
--
-- 일정 시트의 생리 토글은 TestFlight R4-10(2026-09-28)에서 없어졌고, 생리 기록은 홈·주기
-- 리포트에서만 입력한다. 두 컬럼(0006·0007)은 그 뒤로 앱이 쓰지 않는다. 출시 전이라 기존
-- 데이터는 보존하지 않는다 (사용자 결정 2026-09-30).
--
-- 적용 순서: 이 컬럼을 쓰지 않는 빌드(6)가 배포된 뒤에 적용할 것 — 빌드 5 이하는 일정을
-- 만들 때 has_period_mark 를 넣어서, 먼저 적용하면 구 빌드의 일정 저장이 실패한다.
-- Run via: paste into SQL editor  (remote has no migration history — see README)
-- ============================================================

alter table public.event_logs
  drop column if exists linked_period_id,
  drop column if exists has_period_mark;
