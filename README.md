# dwee

> 내 몸의 리듬을 부드럽게 기록해요.

여성의 생리 주기와 컨디션을 함께 기록하는 가벼운 웰니스 앱입니다.
무거운 의료 앱 대신, 매일 3탭 안에 끝나는 가벼운 기록과 rule-based 인사이트를 지향합니다.

- 배포: https://dwee-neon.vercel.app/
- 단계: **MVP2 — 서버 연동·인증 도입** (MVP1 핵심 플로우는 완료, 잔여 polish 는 MVP2 와 병행)

---

## ✨ 핵심 가치

### MVP1 (완료)

1. **생리 시작/종료 기록** — 캘린더에서 1~2탭으로 기록
2. **평균 주기 기반 예측** — 데이터가 쌓이면 다음 예상일 추정
3. **오늘의 컨디션 기록** — 기분 / 에너지 / 통증 / 붓기 / 식욕 / 피부 + 메모
4. **캘린더 확인** — 기록·예측·국면(phase)을 한 눈에
5. **rule-based 인사이트** — 단언 대신 "추정", 데이터 부족 시엔 "아직 예측하기 어려워요"

### MVP2 (진행 중)

6. **Supabase 익명 인증** — 가입 없이 익명 세션부터 시작 (이후 Apple/Google link 예정)
7. **클라우드 동기화** — 로컬(IndexedDB) 우선 + 백그라운드 sync (hybrid)
8. **다기기 사용** — 같은 계정으로 여러 기기 패턴 유지

문구는 항상 추정형으로, 의료적·다이어트 유도 표현은 사용하지 않습니다.
(상세 카피 규칙: [`/.claude/rules/health-copy.md`](./.claude/rules/health-copy.md))

---

## 🚫 명시적 제외 (추가하지 않습니다)

- AI 챗봇, 실제 푸시
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
| 저장         | IndexedDB (`idb-keyval`, 로컬) + Supabase (원격) via Repository 추상화 |
| 인증         | Supabase Auth (익명 세션)                            |
| 스타일       | Tailwind CSS                                         |
| 폼           | react-hook-form                                      |
| 날짜         | date-fns                                             |
| i18n         | 자체 사전 (`src/i18n/locales/{ko,en}.ts`) + `useT()` |
| 패키지매니저 | pnpm 9                                               |

---

## 🛠 하네스 엔지니어링 (`.claude/`)

작업 환경 자체를 코드처럼 버전 관리합니다. `.claude/` 는 Claude Code 가 매 세션 자동 로드하는 하네스로, 팀 전체가 같은 규약·도구를 공유합니다.

```
.claude/
├── agents/                  서브에이전트 정의 (역할별 system prompt + 도구 권한)
│   ├── requirement-planner.md       모호한 요청 → 요구사항/STEP 계획
│   ├── senior-code-craftsman.md     클린 아키텍처·strict TS·i18n·타입체크까지 책임지는 구현 에이전트
│   └── docs-diagram-curator.md      README/문서/Mermaid 다이어그램 관리
│
├── commands/                커스텀 슬래시 커맨드
│   └── commit.md            /commit — 브랜치 분리 + lint/typecheck + curator 호출 + PR 생성
│
├── rules/                   도메인별 규약 (CLAUDE.md 가 80줄 넘으면 여기로 이전)
│   ├── cycle-logic.md       주기 도메인 계산 규칙
│   ├── health-copy.md       헬스 카피 톤 / 의료 단언 금지
│   ├── screens.md           화면 분리 / hydrate 패턴
│   └── storage.md           Repository · Adapter 패턴
│
├── agent-memory/            에이전트별 persistent memory (인스턴스 간 학습 누적)
└── settings.local.json      로컬 권한 설정 (gitignore)
```

- 진입점: 루트 [`CLAUDE.md`](./CLAUDE.md) — 단일 source of truth. `AGENTS.md`, `.cursorrules` 생성 금지.
- 새 컨벤션은 코드와 함께 PR — 같은 실수 2회 발생 시 `CLAUDE.md` 또는 `.claude/rules/` 에 한 줄 추가.
- 에이전트가 학습한 패턴은 `agent-memory/` 에 누적되어 다음 세션에 자동 활용.

---

## 🚀 시작하기

### 사전 요구

- Node.js 20.19.0 (`.nvmrc` 참고 — `nvm use` 또는 `fnm use`)
- Corepack 활성화: `corepack enable && corepack prepare pnpm@9.12.0 --activate`

### 환경 변수

```bash
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 채우기
```

`.env.local` 이 비어 있어도 dev/build 는 통과합니다(placeholder fallback). 단 익명 로그인은 실패하며 `auth.error.missingConfig` 토스트가 뜹니다.

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
│   ├── app/                      AppShell, BottomTabNav, HomeScreen, 키워드/액티비티 카드 등
│   ├── auth/                     LoginScreen
│   └── ui/                       Button, Toast, ChoiceGroup, PageContainer
│
├── store/                        Zustand: period / condition / settings / media / auth
│
├── data/                         어댑터 패턴
│   ├── repositories/             인터페이스 (콘센트 모양)
│   ├── adapters/indexeddb/       로컬 구현 (idb-keyval)
│   ├── adapters/supabase/        원격 구현 (Supabase JS)
│   └── index.ts                  단일 진입점 (현재 IndexedDB wiring, Supabase 어댑터는 MVP2.2 부터 wiring)
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
app/  ──▶  store/  ──▶  data/repositories/  ──┬──▶  data/adapters/indexeddb/   (로컬, 현재 wiring)
                                              └──▶  data/adapters/supabase/    (원격, MVP2.2~)

domain/cycle/, lib/insight/   ← 부수효과 없는 순수 함수, 어디서든 호출 가능
constants/, types/            ← 어디서든 import 가능
```

- **단방향 의존성**: 화살표는 한 방향. 역방향 import 금지.
- **어댑터 패턴**: 같은 Repository 인터페이스를 IndexedDB / Supabase 두 어댑터가 구현. 위 레이어는 한 줄도 수정하지 않고 갈아끼움.
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

### MVP1 — 완료

- [x] STEP 0~8 — 정의 / 하네스 / 아키텍처 / 공통 타입·유틸 / Storage 추상화 / Zustand stores / 화면 골격 / UI 컴포넌트 / i18n
- [x] STEP 9 — 화면별 실제 구현 (Onboarding · Home · Log · Calendar · Insights · Settings)
- [x] STEP 10~11 — 샘플 데이터 / edge case / 리팩토링

### MVP2 — 진행 중

- [x] **MVP2.1 — Supabase 기반 셋업** (auth store, 익명 로그인, 어댑터 src/ 이동)
- [ ] MVP2.2 — Supabase 어댑터 wiring (`data/index.ts` 분기)
- [ ] MVP2.3~ — 백그라운드 sync / 충돌 해결 / 다기기 검증
- [ ] MVP2.6 — IndexedDB → Supabase 1회성 마이그레이션

