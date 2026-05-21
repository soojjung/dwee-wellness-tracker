---
name: dwee MVP1 잔여 작업 마스터 계획 (2026-05-15)
description: STEP 7.5 + 9.0~9.6 + 10.x + 11.x 전체 분해. 진행 전 결정 항목 A1~C4 포함.
type: project
---

## 마스터 계획 작성일
2026-05-15

## 현황 (코드 실제 확인 기준)
- STEP 0~8 완료. 6개 화면 모두 placeholder 상태.
- 기존 자산: 3 stores, 3 repositories/adapters, domain/cycle 3파일, lib/insight 2 rules, i18n 사전 완비, conditionOptions.ts 완비.
- settings/page.tsx: 언어 토글만 있음 (데이터 초기화·알림 mock 없음).
- InsightKind: cycle_regularity, cycle_phase, pain_pattern, mood_trend, data_needed (types/insight.ts).

## 잔여 STEP 순서
7.5 → 9.0 → 9.1 → 9.2 → 9.3 → 9.4 → 9.5 → 9.6 → 10.1 → 10.2 → 10.3 → 11.1 → 11.2 → 11.3

## 핵심 결정 항목 (사용자 미답변)
- A2: 온보딩 주기 입력 방식 (슬라이더/숫자/라디오)
- A4: 홈 생리 기록 날짜 (즉시 오늘/날짜 선택기 ±2일)
- A9: 캘린더 주 시작 요일 (월요일 고정/설정 가능)
- B1: i18n 보간 처리 (정적 키 분리/tFn 헬퍼 도입)
- B2: Insight rule 본문 위치 (rule 파일 hardcode/copy.ts/i18n 사전)

## i18n 사전 신규 추가 필요 키 그룹
onboarding.*, home.phase.*, home.daysUntilPeriod, home.startPeriodButton, home.endPeriodButton,
home.todayLoggedBadge, calendar.*, insights.*, settings.notifications*, settings.dataReset*,
settings.version, settings.appVersion

## 다이어그램 생성 예정 위치
.claude/diagrams/onboarding-flow.md (9.1)
.claude/diagrams/home-state.md (9.2)
.claude/diagrams/calendar-cell-states.md (9.4)
.claude/diagrams/insight-generator.md (9.5)

## How to apply
새 세션은 이 파일 읽고 사용자에게 "결정 항목 A2, A4, A9, B1, B2 먼저 답해주세요" + "진행 방식 a/b/c 선택" 확인 후 STEP 7.5부터 픽업.
