---
description: 화면(페이지/라우트) 작성 규칙
paths:
  - 'src/app/**'
  - 'src/screens/**'
---

# 화면 규칙

## 0) 화면 플로우 다이어그램

- 분기/state machine을 가진 화면은 `docs/flows/<name>.md`에 Mermaid로 기록.
- 현재 등록: [onboarding](../../docs/flows/onboarding.md), [home](../../docs/flows/home.md), [calendar (DiaryScreen 내장)](../../docs/flows/calendar.md), [customize](../../docs/flows/customize.md), [log](../../docs/flows/log.md), [diagnose](../../docs/flows/diagnose.md), [settings (MyPage)](../../docs/flows/settings.md)

## 1) 라우트 그룹

- `(auth)` — 풀스크린, BottomTabNav 없음. 로그인/온보딩 등 진입 동선 전용.
- `(app)` — `<AppShell>` 자동 래핑. BottomTabNav 항상 표시.
- `(fullscreen)` — 풀스크린, BottomTabNav 없음. AppShell 밖의 몰입형 편집 화면 전용.  
  현재 포함: `/home/customize`, `/home/customize/edit-photos`, `/magazine/personal-body-type/diagnose`, `/settings/account` (계정 편집).
- 새 화면 추가 시 셋 중 어디에 둘지 먼저 결정.

**모바일 셸 (mobile shell):** 세 라우트 그룹 모두 최상위 layout 에서 `max-w-md` (448px) + `mx-auto` 로 콘텐츠 폭을 고정합니다. 데스크톱 브라우저에서도 모바일 폭을 유지하는 것이 의도된 동작입니다. `(app)` 은 `AppShell` 내부 `main` 에서, `(auth)` 와 `(fullscreen)` 은 각 `layout.tsx` 의 wrapper div 에서 적용합니다. 새 레이아웃을 추가할 때도 `max-w-md mx-auto w-full` 을 유지하세요.

## 2) i18n

- 페이지/컴포넌트의 모든 사용자 노출 텍스트는 `useT()` 경유.
- 인라인 한국어/영어 문자열 금지. 신규 키는 `src/i18n/locales/{ko,en}.ts` 양쪽 동시 추가.
- 자세한 톤·키 룰은 `.claude/rules/health-copy.md`.

## 3) 클라이언트/서버 경계

- `useT()`, store, `usePathname` 등을 쓰는 페이지는 `'use client'` 선언.
- 라우트 그룹 layout(`(auth)/layout.tsx`, `(app)/layout.tsx`)은 server 유지가 기본.
- `AppShell`이 client 컴포넌트라 `(app)` 하위는 mount 시 `settingsStore.hydrate()` + `authStore.hydrate()` 각 1회 자동 실행됨.
- `(auth)` 그룹은 hydrate 없음 — 데이터 의존 화면이면 별도 처리 (예: LoginScreen은 자체적으로 authStore.hydrate 트리거).

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

- 4개 탭(home/log/magazine/settings). calendar 탭은 없음 — 캘린더는 `/log` Diary 뷰 안에 통합.
- 탭 추가/삭제는 `BottomTabNav.tsx`의 `TABS` 배열만 수정.
- 활성 탭 판정: 루트(`/`)는 정확 일치, 그 외는 `startsWith`.

## 9) 탭 화면 하단 여백

- `(app)` 탭 화면이 `BottomTabNav`에 가리지 않도록 두는 하단 여백(`pb-24`)은 **`AppShell`이 아니라 각 화면이 자체 컨테이너에** 둔다.
- `AppShell`의 `<main>`에 두면 자식 화면의 배경(`bg-...`) 영역 밖이 되어, 화면 하단에 부모(`AppShell`) 배경색 띠가 그대로 노출된다 — 실제 발생했던 버그.
- Home/Magazine/Diary/MyPage 모두 각자 최상위 컨테이너에 `pb-24`(또는 동등한 값)를 둘 것.

## 10) 텍스트 줄바꿈

- 한국어가 글자 단위로 끊겨 어절이 쪼개지는 문제를 막기 위한 `word-break: keep-all` + `overflow-wrap: break-word`는 `src/app/globals.css`의 `html, body`에 전역으로 걸려 있다. 상속되므로 앱 전체에 자동 적용된다.
- 화면·컴포넌트별로 같은 규칙을 `break-keep` 클래스나 인라인 스타일로 다시 넣지 않는다. 국소적으로 다르게 끊어야 하는 예외(코드 블록 등)에만 해당 요소에 override.
