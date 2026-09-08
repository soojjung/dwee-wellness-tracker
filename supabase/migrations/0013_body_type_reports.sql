-- ============================================================
-- dwee — body-type reading results (매거진 퍼스널 체형 분석)
--
-- 결과를 기기에만 두면 앱을 지우거나 다른 기기로 옮길 때 사라진다.
-- 마이페이지 `나의 테스트` 가 이 값을 보고 "결과" 행을 띄우므로,
-- 로그인 사용자는 어느 기기에서든 같은 결과를 봐야 한다.
--
-- 사용자당 한 행만 둔다 (user_id primary key). 다시 진단하면 덮어쓰며,
-- 이전 결과 이력은 남기지 않는다 — 화면이 최신 결과 하나만 보여준다.
--
-- `report` 는 Edge Function 이 돌려준 BodyTypeReport 를 통째로 담는다.
-- 필드가 자주 바뀌는 리딩 결과라 컬럼으로 펼치지 않고 jsonb 로 둔다.
-- `primary_type` 만 따로 뽑아 두는 건 공유 카드(OG) 처럼 타입만 필요한
-- 조회에서 jsonb 를 파싱하지 않으려는 것.
--
-- 익명 사용자는 RLS 에서 막는다 (0004, 0006 과 동일). 클라이언트에서도
-- 익명은 IndexedDB 를 쓴다 (src/store/authStore.ts::repoModeForUser).
-- Run via: supabase db push  (or paste into SQL editor)
-- ============================================================

create table if not exists public.body_type_reports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_type text not null check (primary_type in ('straight', 'wave', 'natural')),
  report jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.body_type_reports enable row level security;

drop policy if exists body_type_reports_owner on public.body_type_reports;
create policy body_type_reports_owner on public.body_type_reports
  for all
  using      (user_id = auth.uid() and not public.is_anonymous_jwt())
  with check (user_id = auth.uid() and not public.is_anonymous_jwt());
