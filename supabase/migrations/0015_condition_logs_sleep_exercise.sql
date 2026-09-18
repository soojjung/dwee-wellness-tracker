-- 컨디션 기록에 수면·운동 추가 (2026-09-18).
-- 아이디어 콘테스트 문서의 "감정·증상·식욕·수면·운동·일기" 항목 중 수면·운동이 빠져 있었다.
alter table public.condition_logs
  add column sleep text check (sleep in ('good','fair','poor')),
  add column exercise text check (exercise in ('none','light','active'));
