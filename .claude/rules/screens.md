---
description: 화면(페이지/라우트) 작성 규칙
paths:
  - 'src/app/**'
  - 'src/screens/**'
---

# 화면 규칙

## 0) 화면 플로우 다이어그램

- 분기/state machine을 가진 화면은 `docs/flows/<name>.md`에 Mermaid로 기록.
- 사용자 시나리오형 그림(행위자 범례 + 번호 단계)은 `docs/diagrams/<name>.excalidraw` + 같은 이름 `.png` 로 두고 해당 flow 문서 상단에 `<img>` 로 삽입. 현재: login-flow, body-type-diagnose, diary-sticker-capture.
- 현재 등록: [onboarding](../../docs/flows/onboarding.md), [home](../../docs/flows/home.md), [calendar (DiaryScreen 내장)](../../docs/flows/calendar.md), [customize](../../docs/flows/customize.md), [log](../../docs/flows/log.md), [diagnose](../../docs/flows/diagnose.md), [settings (MyPage)](../../docs/flows/settings.md)

## 1) 라우트 그룹

- `(intro)` — 풀스크린, BottomTabNav 없음. 흰 테마(`(auth)`와 색이 달라 그룹을 분리). 기기 최초 실행 시 1회만 보이는 소개 슬라이드(`/onboarding`) 전용. `AuthGuard`가 감싸지 않는다 — `OnboardingScreen`이 자체적으로 hydrate·리다이렉트.
- `(auth)` — 풀스크린, BottomTabNav 없음. 로그인(`/login`) 전용. 마찬가지로 `AuthGuard` 밖.
- `(legal)` — 공개 문서(`/legal/terms`, `/legal/privacy`, `/legal/support`). `AuthGuard` 밖, 세션 없이 열린다(App Store·OAuth 동의 화면 URL). `PublicLegalShell` 이 settings 만 hydrate 하고 `?lang=` 으로 언어 고정. 본문은 `components/legal/*Article` 로 `/settings/*` 화면과 공유.
- `(app)` — `<AppShell>` 자동 래핑. BottomTabNav 항상 표시.
- `(fullscreen)` — 풀스크린, BottomTabNav 없음. AppShell 밖의 몰입형 편집 화면 전용.  
  현재 포함: `/home/customize`, `/home/customize/edit-photos`, `/home/customize/edit-photos/[slot]`, `/log/customize`, `/foods/[id]`, `/magazine/[slug]`, `/magazine/bookmarks`, `/magazine/personal-body-type/diagnose`, `/magazine/personal-body-type/diagnose/result`, `/magazine/personal-body-type/share/[type]`, `/settings/account`, `/settings/withdraw`.
- 새 화면 추가 시 넷 중 어디에 둘지 먼저 결정.
- **인증 게이트**: `AuthGuard` 가 `(app)`/`(fullscreen)` 레이아웃만 감싸 세션 없으면 `/login`(또는 기기 최초 실행이면 `/onboarding`) 으로 보낸다. 예외는 `AuthGuard.tsx` 의 `PUBLIC_PREFIXES` 화이트리스트(현재 `/magazine/personal-body-type/share`)뿐 — 남에게 건넨 공유 링크를 첫 방문자가 세션 없이도 볼 수 있게 하는 용도. 새 화면을 이 목록에 추가하는 것은 "첫 진입 강제 로그인" 정책의 예외이므로 신중히 결정할 것 (자세한 배경: [`docs/flows/diagnose.md`](../../docs/flows/diagnose.md) §"공유 (Share)"). 첫 진입 라우팅 전체 흐름은 [`docs/flows/onboarding.md`](../../docs/flows/onboarding.md).

**모바일 셸 (mobile shell):** 다섯 라우트 그룹 모두 최상위 layout 에서 `max-w-md` (448px) + `mx-auto` 로 콘텐츠 폭을 고정합니다. 데스크톱 브라우저에서도 모바일 폭을 유지하는 것이 의도된 동작입니다. `(app)` 은 `AppShell` 내부 `main` 에서, `(intro)`·`(auth)`·`(fullscreen)` 은 각 `layout.tsx` 의 wrapper div 에서 적용합니다. 새 레이아웃을 추가할 때도 `max-w-md mx-auto w-full` 을 유지하세요.

## 2) i18n

- 페이지/컴포넌트의 모든 사용자 노출 텍스트는 `useT()` 경유.
- 인라인 한국어/영어 문자열 금지. 신규 키는 `src/i18n/locales/{ko,en}.ts` 양쪽 동시 추가.
- 자세한 톤·키 룰은 `.claude/rules/health-copy.md`.

## 3) 클라이언트/서버 경계

- `useT()`, store, `usePathname` 등을 쓰는 페이지는 `'use client'` 선언.
- 라우트 그룹 layout(`(auth)/layout.tsx`, `(app)/layout.tsx`)은 server 유지가 기본.
- `(app)` 은 `AppShell`, `(fullscreen)` 은 `FullscreenShell` 이 client 컴포넌트로 `useCoreStoresHydration()` 을 호출해 mount 시 settings · auth · bookmarks 스토어를 각 1회 hydrate 한다 (2026-09-14: 풀스크린 라우트가 빠져 있어 새로고침·딥링크 진입 시 언어·공휴일 설정이 기본값으로 뜨던 버그를 고침).
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

- 데이터 화면(홈/캘린더/주기리포트)은 loading / error / empty 모두 표시.
- 빈 상태 카피는 사전(`empty.*`, `t.myPage.cycle.insufficient`, `t.report.chartEmpty` 등)에서. `home.insufficientData` 키는 삭제됨 — 자세한 내용은 `.claude/rules/cycle-logic.md` §3.

## 8) BottomTabNav

- 4개 탭(home/log/magazine/settings). calendar 탭은 없음 — 캘린더는 `/log` Diary 뷰 안에 통합.
- `BottomTabNav`는 `SHOW_NAV_PATHS`(`['/', '/log', '/magazine', '/settings']`, 4개 탭 루트) 정확히 일치하는 경로에서만 렌더된다 — 서브 라우트(`/settings/account`, `/log/customize` 등)는 탭바가 없다. `BottomTabNav.tsx`의 `TABS` 배열은 탭 목록(아이콘·라벨·href)이고 `SHOW_NAV_PATHS`는 노출 여부 판정이라 **서로 다른 배열**이다. 탭을 추가/삭제할 땐 두 배열을 함께 수정할 것 — `TABS`만 고치면 새 탭이 서브 라우트에서 사라지거나, 반대로 탭 없는 화면에 탭바가 뜨는 불일치가 생긴다.
- 활성 탭 판정: 루트(`/`)는 정확 일치, 그 외는 `startsWith`.

## 9) 탭 화면 하단 여백

- `(app)` 탭 화면이 `BottomTabNav`에 가리지 않도록 두는 하단 여백(`pb-24`)은 **`AppShell`이 아니라 각 화면이 자체 컨테이너에** 둔다.
- `AppShell`의 `<main>`에 두면 자식 화면의 배경(`bg-...`) 영역 밖이 되어, 화면 하단에 부모(`AppShell`) 배경색 띠가 그대로 노출된다 — 실제 발생했던 버그.
- Home/Magazine/Diary/MyPage 모두 각자 최상위 컨테이너에 `pb-24`(또는 동등한 값)를 둘 것.

## 10) 텍스트 줄바꿈

- 한국어가 글자 단위로 끊겨 어절이 쪼개지는 문제를 막기 위한 `word-break: keep-all` + `overflow-wrap: break-word`는 `src/app/globals.css`의 `html, body`에 전역으로 걸려 있다. 상속되므로 앱 전체에 자동 적용된다.
- 화면·컴포넌트별로 같은 규칙을 `break-keep` 클래스나 인라인 스타일로 다시 넣지 않는다. 국소적으로 다르게 끊어야 하는 예외(코드 블록 등)에만 해당 요소에 override.

## 11) 안전영역(safe-area) 여백

- iOS 노치·홈 인디케이터 여백은 `src/app/globals.css`의 `.pt-safe`/`.pb-safe` 유틸리티(`env(safe-area-inset-*)`)로 전역 정의돼 있다. 화면마다 같은 `env()` 계산을 다시 적지 말고 이 클래스를 쓸 것.
- 기본 여백(예: 8px)까지 함께 필요하면 `pt-safe` 옆에 별도 padding 클래스를 붙이지 않는다 — 같은 CSS property 를 두 클래스가 다투면 나중에 생성된 쪽이 이겨 하나가 무시된다. `pt-[calc(0.5rem+env(safe-area-inset-top,0px))]` 처럼 한 클래스로 합쳐 쓸 것.
- **실기기 QA 라운드 1 (2026-09-24)**: 약 30개 화면의 고정/스티키 헤더·하단 바가 실기기(iPhone 13)에서 노치·홈 인디케이터에 가려지는 문제를 고쳤다. 대부분 `.pt-safe`/`.pb-safe` 로는 부족한 케이스라(기본 padding·고정 height 와 함께 계산해야 함) 인라인 `pt-[env(safe-area-inset-top,0px)]`/`pb-[calc(...+env(safe-area-inset-bottom,0px))]` 클래스를 화면별로 직접 붙였다 — 유틸리티 클래스를 없앤 것은 아니고, 계산이 필요한 자리에서 위 두 번째 규칙(별도 클래스 병합)을 그대로 따른 것.

## 13) 엣지 스와이프 뒤로가기 (`SwipeBackGesture`)

- `src/components/app/SwipeBackGesture.tsx` 가 루트 레이아웃(`app/layout.tsx`)에 한 번만 마운트되어 화면 왼쪽 가장자리(28px)에서 시작하는 스와이프를 전역으로 감지한다. 제스처는 화면을 직접 이동시키지 않고, 그 순간 DOM 에 있는 **마지막(가장 위) `[data-swipe-back]` 엘리먼트를 찾아 클릭**한다 — 화면마다 "뒤로가기"의 의미가 링크 이동 / `history.back()` / 변경사항 확인 다이얼로그로 다르기 때문.
- 새 풀스크린/서브 화면의 뒤로가기 버튼에는 `data-swipe-back` 속성을 붙일 것. 겹쳐 뜨는 시트(예: `EventDetailScreen` 위의 `EventFormSheet`)처럼 여러 개가 동시에 DOM 에 있을 수 있는 경우, DOM 순서상 나중에 렌더되는 쪽(=위에 보이는 화면)의 버튼에 붙여야 스와이프가 올바른 레이어를 닫는다.
- `role="dialog"`/`role="alertdialog"` 가 열려 있으면 제스처가 비활성화된다(모달 뒤 화면이 실수로 스와이프되는 것 방지) — 모달 규칙(`.claude/rules/modals.md`)을 따르는 오버레이는 자동으로 이 예외에 걸린다.

## 12) 풀스크린 화면의 상태바·주소창 뒤 배경 (`data-page-bg`)

- 상태바 뒤·주소창 뒤·오버스크롤 영역은 화면 콘텐츠가 아니라 브라우저가 **`body` 배경색**으로 칠한다(iOS Safari 는 `theme-color` 메타도 여기엔 쓰지 않는다). `body`는 앱 공통 회색이라, 배경이 다른 풀스크린 화면(로그인·스플래시 = 핑크, 소개 슬라이드 = 흰색)을 그대로 두면 위아래에 회색 띠가 남는다.
- 그런 화면은 최상위 wrapper div에 `data-page-bg="pink"` 또는 `"white"`를 붙인다. `src/app/globals.css`가 모바일 폭(`max-width: 28rem`)에서만 `body:has([data-page-bg=...])`로 `body` 배경을 그 색으로 맞춘다(데스크톱은 가운데 448px 열 바깥의 회색 여백이 의도된 모양이라 제외). 현재 사용처: `(auth)/layout.tsx`(pink), `(intro)/layout.tsx`(white), `SplashScreen`(pink).
- 새 값이 필요하면 `globals.css`의 `@media` 블록에 규칙을 추가하고 여기 목록에 한 줄 추가할 것 — 값 없이 속성만 붙이면 조용히 무시된다(다른 페이지 배경 없이는 아무 효과 없음).
