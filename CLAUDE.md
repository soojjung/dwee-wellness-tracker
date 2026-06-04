# dwee — Claude 작업 가이드

## 프로젝트 컨텍스트

- 여성의 생리 주기와 컨디션을 함께 기록하는 가벼운 웰니스 앱.
- 단계: **MVP2 — 서버 연동/인증 도입.** MVP1 (STEP 0–9.2) 핵심 플로우 완료. 잔여 polish(예: STEP 9.3 Log)는 MVP2 와 병행.
- 사용자 노출 텍스트: **English (en-US) 1차, 한국어 2차.** 메인 타겟 시장 미국. 카피는 en 사전을 source-of-truth 로 작성하고 ko 가 번역물.

## 기술 스택

- Next.js (App Router) + Capacitor / TypeScript strict
- 상태: Zustand (+ persist) / 저장: IndexedDB (로컬) + Supabase (원격) via Repository 추상화
- UI: Tailwind CSS / 날짜: date-fns / 폼: react-hook-form
- 패키지 매니저: pnpm

## 핵심 가치

**MVP1 (완료)** 1. 생리 시작/종료 기록 2. 평균 주기 기반 예측 3. 오늘의 컨디션 기록 4. 캘린더 확인 5. rule-based 인사이트

**MVP2 (진행 중)** 6. Supabase 인증 7. 클라우드 동기화 8. 다기기 사용

## 명시적 제외 (추가 금지)

- AI 챗봇, 실제 푸시
- Apple Health / Google Fit 연동
- 체중·칼로리·운동·식단·다이어트 유도
- 임신·피임·성생활·커뮤니티
- ML/AI 라이브러리 (rule-based only)

## 도메인 표현 규칙

- "당신은 배란기입니다" ❌ → "배란기로 추정돼요" ✅
- "정상 주기입니다" ❌ → "최근 주기는 평균 28일이에요" ✅
- "체중 관리에 좋은" ❌ (사용 금지)
- "진단", "치료", "처방" ❌ (사용 금지)
- 수치/예측에는 항상 "예상", "추정", "참고용", "패턴" 중 하나 동반
- 데이터가 부족할 땐 추정값을 만들지 말고 "아직 예측하기 어려워요" 표시

## 코딩 표준

- TypeScript strict. `any` 금지(꼭 필요하면 주석으로 사유).
- 화면(UI)과 비즈니스 로직 분리: 화면은 store/service 호출만.
- 의존성 방향: app → store → data/repositories → data/adapters. 역방향 import 금지.
- domain/cycle, lib/insight는 부수효과 없는 순수 함수로 작성 (외부 호출·저장 금지).
- 날짜 계산은 `lib/date/` 또는 `domain/cycle/`에 모음. 화면에서 직접 계산 금지.
- 저장소 직접 import 금지. 반드시 Repository 인터페이스 경유.
- 하드코딩 문구는 `constants/copy.ts`에 모아 재사용.
- 컴포넌트는 작게 분리. 100줄 넘으면 분할 검토.
- Store(Zustand): `'use client'`, hydrate/loading/error 3-state, mutation은 repo → in-memory 순. 외부에 set 노출 금지.
- 주석은 "왜"가 비자명할 때만. "무엇"은 코드로 말한다.

## UX 원칙

- 다국어: en (source) / ko (번역). `Dictionary = typeof en` 강제 → en 키 누락 시 컴파일 실패. 모든 사용자 노출 텍스트는 `useT()` 훅 경유. 인라인 문자열 금지. 추가 locale 도입 시 `Locale` union 확장 + 사전 파일 추가.
- 컨디션 기록은 3탭 이내로 완료.
- loading / error / empty 세 상태 모두 처리.
- 디자인은 심플 + 감성적, 과한 일러스트/이모지 자제.
- 색상은 부드러운 파스텔 톤, 빨강·경고색은 의료적 인상이라 본문에 사용 자제.

## 작업 진행 규칙

- STEP은 한 번에 하나씩, 사용자 승인 후 진행.
- 같은 실수 2회 발생 → 즉시 본 문서 또는 `.claude/rules/`에 한 줄 추가하고 보고.
- 문서가 80줄 초과 → 도메인별 `.claude/rules/{domain}.md`로 이전.
- AGENTS.md, .cursorrules 생성 금지 (본 문서가 단일 소스).
