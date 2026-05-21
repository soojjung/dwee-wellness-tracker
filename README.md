# dwee

> 내 몸의 리듬을 부드럽게 기록해요.

여성의 생리 주기와 컨디션을 함께 기록하는 가벼운 웰니스 앱입니다.
무거운 의료 앱 대신, 매일 3탭 안에 끝나는 가벼운 기록과 rule-based 인사이트를 지향합니다.

- 배포: https://dwee-neon.vercel.app/
- 단계: **MVP1** (빠른 출시 / 유지보수 / 확장 가능 구조 우선)

---

## ✨ MVP1 핵심 가치

1. **생리 시작/종료 기록** — 캘린더에서 1~2탭으로 기록
2. **평균 주기 기반 예측** — 데이터가 쌓이면 다음 예상일 추정
3. **오늘의 컨디션 기록** — 기분 / 에너지 / 통증 / 붓기 / 식욕 / 피부 + 메모
4. **캘린더 확인** — 기록·예측·국면(phase)을 한 눈에
5. **rule-based 인사이트** — 단언 대신 "추정", 데이터 부족 시엔 "아직 예측하기 어려워요"

문구는 항상 추정형으로, 의료적·다이어트 유도 표현은 사용하지 않습니다.
(상세 카피 규칙: [`/.claude/rules/health-copy.md`](./.claude/rules/health-copy.md))

---

## 🚫 명시적 제외 (MVP1에 추가하지 않습니다)

- 실제 로그인/인증, 서버 동기화, AI 챗봇, 실제 푸시
- Apple Health / Google Fit 연동
- 체중·칼로리·운동·식단·다이어트 유도
- 임신·피임·성생활·커뮤니티
- ML/AI 라이브러리 (rule-based만 사용)

---

## 🧰 기술 스택

| 영역         | 선택                                                 |
| ------------ | ---------------------------------------------------- |
| 프레임워크   | Next.js 15 (App Router) + React 19                   |
| 언어         | TypeScript (strict)                                  |
| 모바일       | Capacitor 6 (iOS)                                    |
| 상태         | Zustand (+ persist)                                  |
| 저장         | IndexedDB (`idb-keyval`) via Repository 추상화       |
| 스타일       | Tailwind CSS                                         |
| 폼           | react-hook-form                                      |
| 날짜         | date-fns                                             |
| i18n         | 자체 사전 (`src/i18n/locales/{ko,en}.ts`) + `useT()` |
| 패키지매니저 | pnpm 9                                               |

---

## 🚀 시작하기

### 사전 요구

- Node.js 20.19.0 (`.nvmrc` 참고 — `nvm use` 또는 `fnm use`)
- Corepack 활성화: `corepack enable && corepack prepare pnpm@9.12.0 --activate`

### 로컬 개발

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### 빌드 / 검증

```bash
pnpm build        # Next.js production build
pnpm typecheck    # tsc --noEmit (strict)
pnpm lint         # eslint
pnpm format       # prettier --write
```

### iOS (Capacitor)

```bash
pnpm cap:sync     # next build && cap sync
pnpm cap:ios      # Xcode 열기
```

---

## 🗂 폴더 구조

```
src/
├── app/                          Next.js App Router
│   ├── (auth)/                   로그인 / 온보딩
│   │   ├── login/                v1 (+ v2, v3 시안)
│   │   └── onboarding/
│   └── (app)/                    인증 후 메인
│       ├── page.tsx              홈 (다음 예상일)
│       ├── log/                  오늘의 컨디션 기록
│       ├── calendar/             캘린더
│       ├── insights/             rule-based 인사이트
│       └── settings/             설정 (언어 등)
│
├── components/
│   ├── app/                      AppShell, BottomTabNav
│   ├── auth/                     LoginScreen
│   └── ui/                       Button, Toast, ChoiceGroup, PageContainer
│
├── store/                        Zustand: period / condition / settings
│
├── data/                         어댑터 패턴
│   ├── repositories/             인터페이스 (콘센트 모양)
│   ├── adapters/indexeddb/       구현 (플러그)
│   └── index.ts                  단일 진입점
│
├── domain/cycle/                 순수 함수: aggregate, predictor, phase
├── lib/
│   ├── date/                     날짜 유틸
│   ├── insight/                  rule-based 인사이트 생성
│   └── cn.ts                     clsx + tailwind-merge
│
├── i18n/                         ko / en 사전 + useT()
├── constants/                    공용 상수 (copy 등)
└── types/                        도메인 타입
```

---

## 🏛 아키텍처 원칙

```
app/  ──▶  store/  ──▶  data/repositories/  ──▶  data/adapters/indexeddb/

domain/cycle/, lib/insight/   ← 부수효과 없는 순수 함수, 어디서든 호출 가능
constants/, types/            ← 어디서든 import 가능
```

- **단방향 의존성**: 화살표는 한 방향. 역방향 import 금지.
- **어댑터 패턴**: 저장 기술(IndexedDB → Supabase 등)은 `src/data/adapters/` 안에서 갈아끼움. 위 레이어는 한 줄도 수정하지 않음.
- **순수 도메인**: `domain/cycle/`, `lib/insight/`는 외부 호출/저장 없이 입력→출력만.
- **단일 진입점**: store는 어댑터를 직접 import 하지 않고 `@/data` 한 곳만 import.

상세: [`docs/architecture/data-layer.md`](./docs/architecture/data-layer.md)

---

## 🌐 i18n

- 기본 언어: 한국어. 영어 사전은 `Dictionary` 타입(`typeof ko`)으로 강제 → 키 누락 시 컴파일 에러.
- 사용자 노출 텍스트는 **항상** `useT()` 훅 경유. 인라인 한국어/영어 문자열 금지.
- 첫 진입 시 디바이스 locale 자동 감지(`detectInitialLocale()`), 이후엔 사용자 설정 우선.

```ts
// 사용 예
const t = useT();
return <h1>{t.home.nextPeriodTitle}</h1>;
```

신규 문구는 `src/i18n/locales/ko.ts`와 `en.ts`에 동시에 추가합니다.

---

## 🗺 진행 상태 (Roadmap)

- [x] STEP 0~3 — 정의 / 하네스 / 아키텍처 / 파일 계획
- [x] STEP 4 — 공통 타입·상수·유틸
- [x] STEP 5 — Storage abstraction (Repository + IndexedDB Adapter)
- [x] STEP 6 — Zustand stores (period / condition / settings)
- [x] STEP 7 — 화면 골격 (라우트 그룹, AppShell, 6개 placeholder)
- [x] STEP 8 — 공통 UI 컴포넌트 (Button, Toast, ChoiceGroup, PageContainer)
- [x] i18n (ko/en 사전 + `useT()`)
- [ ] **STEP 9 — 화면별 실제 구현** (Onboarding → Home → Log → Calendar → Insights → Settings)
- [ ] STEP 10 — 샘플 데이터 + edge case
- [ ] STEP 11 — 리팩토링 + MVP2 가드

---

## 📐 작업 규약

- TypeScript strict, `any` 금지 (꼭 필요하면 주석으로 사유).
- 화면(UI)과 비즈니스 로직 분리 — 화면은 store/service 호출만.
- 컴포넌트 100줄 넘으면 분할 검토.
- 주석은 "왜"가 비자명할 때만. "무엇"은 코드로 말한다.
- Claude Code로 작업할 때의 규칙은 [`CLAUDE.md`](./CLAUDE.md) 참고.
