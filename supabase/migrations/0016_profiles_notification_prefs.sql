-- ============================================================
-- dwee — 알림 세부 설정 (profiles.notif_*)
--
-- 마이페이지 > 알림의 세부 토글 3개와 "며칠 전" 시점. 지금까지는 마스터
-- (notifications_enabled) 만 컬럼이 있어서, 로그인 상태(원격 저장)에서는 세부
-- 토글을 눌러도 저장되지 않고 항상 꺼진 채로 돌아왔다 (실기기 QA 2026-09-24).
-- 알림 자체는 기기 로컬 알림이지만 설정값은 다른 프로필 설정과 함께 계정에 둔다.
-- Run via: paste into SQL editor  (remote has no migration history — see README)
-- ============================================================

alter table public.profiles
  add column if not exists notif_period_due_enabled boolean not null default false,
  add column if not exists notif_period_delay_enabled boolean not null default false,
  add column if not exists notif_fertile_enabled boolean not null default false,
  add column if not exists notif_period_due_lead_days smallint not null default 5
    check (notif_period_due_lead_days between 0 and 14);
