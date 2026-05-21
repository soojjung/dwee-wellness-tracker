---
description: 화면(페이지/라우트) 작성 규칙
paths:
  - 'src/app/**'
  - 'src/screens/**'
---

# 화면 규칙

## 0) 화면 플로우 다이어그램

- 분기/state machine을 가진 화면은 `docs/flows/<name>.md`에 Mermaid로 기록.
- 현재 등록: [onboarding](../../docs/flows/onboarding.md), [home](../../docs/flows/home.md), [calendar](../../docs/flows/calendar.md)

## 1) 라우트 그룹

- `(auth)` — 풀스크린, BottomTabNav 없음. 로그인/온보딩 등 진입 동선 전용.
- `(app)` — `<AppShell>` 자동 래핑. BottomTabNav 항상 표시.
- 새 화면 추가 시 둘 중 어디에 둘지 먼저 결정.

## 2) i18n

- 페이지/컴포넌트의 모든 사용자 노출 텍스트는 `useT()` 경유.
- 인라인 한국어/영어 문자열 금지. 신규 키는 `src/i18n/locales/{ko,en}.ts` 양쪽 동시 추가.
- 자세한 톤·키 룰은 `.claude/rules/health-copy.md`.

## 3) 클라이언트/서버 경계

- `useT()`, store, `usePathname` 등을 쓰는 페이지는 `'use client'` 선언.
- 라우트 그룹 layout(`(auth)/layout.tsx`, `(app)/layout.tsx`)은 server 유지가 기본.
- `AppShell`이 client 컴포넌트라 `(app)` 하위는 mount 시 `settingsStore.hydrate()` 1회 자동 실행됨.
- `(auth)` 그룹은 hydrate 없음 — 데이터 의존 화면이면 별도 처리.

## 4) 컴포넌트 분리 기준

- 페이지가 100줄 가까워지면 `src/components/{도메인}/...`로 추출.
- 같은 화면을 다른 색·자산으로 반복 노출하면 props로 분리(`LoginScreen`처럼).
- 페이지 파일은 가능하면 props만 넘기는 얇은 래퍼 유지.

## 5) 시안 비교 패턴

- 동일 화면의 디자인 시안 비교가 필요하면 폴더로 분기: `login/`, `login/v2/`, `login/v3/`.
- 본 시안은 루트 경로(`/login`), 후보는 v2/v3.
- 결정이 끝나면 v2/v3 폴더와 미사용 자산 즉시 제거 (시안 잔존 금지).

## 6) 색·토큰 사용

- 정적 색은 `tailwind.config.ts`의 `theme.extend.colors`에 등록 후 클래스로 사용.
- props로 동적 주입하는 색(시안 비교 등)은 inline `style={{ ... }}`.
- 디자인 토큰 변경은 한 곳에서만 — 화면이 hex를 직접 박지 않게.

## 7) 상태 3-state

- 데이터 화면(홈/캘린더/인사이트)은 loading / error / empty 모두 표시.
- 빈 상태 카피는 사전(`empty.*`, `home.insufficientData` 등)에서.

## 8) BottomTabNav

- 5개 탭(home/log/calendar/insights/settings) 외 추가는 사용자 결정 사항.
- 탭 라우트 변경 시 `BottomTabNav.tsx`의 `TABS` 배열만 수정.
- 활성 탭 판정: 루트(`/`)는 정확 일치, 그 외는 `startsWith`.
