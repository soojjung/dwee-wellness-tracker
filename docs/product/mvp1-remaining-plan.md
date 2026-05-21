# dwee MVP1 잔여 작업 마스터 계획

---

## 메타

- **작성일:** 2026-05-15
- **참조 문서:**
  - `docs/product/mvp1-spec.md` — MVP1 기획 원본
  - `CLAUDE.md` — 코딩 표준 · 도메인 표현 · 명시적 제외 항목
  - `.claude/rules/cycle-logic.md` — 주기 로직 가드레일
  - `.claude/rules/storage.md` — 저장소 추상화 규칙
  - `.claude/rules/screens.md` — 화면 작성 규칙
  - `.claude/rules/health-copy.md` — 헬스 카피 · i18n 규칙
- **마지막 업데이트 책임자:** requirement-planner 에이전트 (계획 변경 시 이 파일 갱신 후 MEMORY.md 포인터도 업데이트)
- **현재 완료 상태:** STEP 0~8, 7.5, 9.0 완료. 6개 화면 placeholder 상태 (Batch 2 STEP 9.1 Onboarding부터 진행 예정).

### 완료 로그 (2026-05-15)

- **STEP 7.5**: 결정 D-2 = tagline 노출하지 않음. STEP 7 종결 (코드 변경 없음).
- **STEP 9.2**: Home 화면 완료. `HomeScreen` (150줄, 분기 4-state) + `StartPeriodControl` + `InsightCard` 신규. `currentPhase()` 5가지 매핑, `predictNextPeriod()`, `generateInsights()` 바인딩. A4: −2/−1/0일 3 버튼 (master plan "±2일" 추천에서 미래값 제외). i18n 키 `home.*` 추가 (phase 5, 시작 컨트롤, 빈/에러/로딩). 다이어그램: `docs/flows/home.md`.
- **STEP 9.1**: Onboarding 화면 완료. 2-step state machine (`DateStep` → `CycleStep` → save → `/`). A2 적용 (숫자 입력 + 버튼). i18n 키 `onboarding.*` 17개 추가. 다이어그램: `docs/flows/onboarding.md`. screens.md §0 링크.
- **STEP 9.0**: i18n / Insight 정비 완료.
  - `Insight` 타입을 discriminated union으로 재설계 (`{ kind: 'data_needed' | 'cycle_regularity', confidence, ...payload }`). `title`/`body` 문자열 제거.
  - rule 함수 2개에서 한국어 하드코딩 제거 (순수 데이터 반환).
  - i18n 사전 ko/en에 `insight.{dataNeeded,cycleRegularity}` 키 추가 (B1 적용: bodyPrefix/bodySuffix 쌍).
  - 다이어그램: `docs/architecture/insight-flow.md` 신규.
  - `cycle-logic.md` §6/§7, `health-copy.md` §3 갱신.

---

## 현황 요약 (코드 실측 기준)

### 완료된 자산

| 레이어 | 파일 | 상태 |
|--------|------|------|
| stores | `periodStore`, `conditionStore`, `settingsStore` | 완료 (loading/error/hydrated 3-state) |
| repositories | `PeriodRepository`, `ConditionRepository`, `SettingsRepository` | 인터페이스 완료 |
| adapters | IndexedDB 3종 + migrations | 완료 |
| domain | `aggregate.ts`, `phase.ts`, `predictor.ts`, `types.ts` | 완료 (순수 함수) |
| lib/insight | `generator.ts`, `cycleRegularityRule.ts`, `dataNeededRule.ts` | 완료 (rule 2개) |
| i18n | `ko.ts`, `en.ts` — 기본 키 완비 | 완료 |
| UI 컴포넌트 | `Button`, `Toast`, `ChoiceGroup`, `PageContainer`, `AppShell`, `BottomTabNav` | 완료 |
| 화면 | 6개 화면 모두 placeholder | **미완료 — 이번 잔여 작업 대상** |

### 코드에서 확인된 핵심 사실

1. `currentPhase()` 반환 phase 열거: `menstrual | follicular | ovulation | luteal | unknown`
2. `cycleRegularityRule.ts` 본문 문자열이 파일 내 하드코딩됨 → B2 결정 후 반드시 이전
3. `conditionStore.byDate`는 `Record<string, DailyConditionLog>` 구조 → `hydrateRange(monthStart, monthEnd)` 호출 가능
4. `UserSettings`에 `weekStartsOn` 필드 없음 → A9(주 시작 요일 설정 가능) 선택 시 타입 · 어댑터 · migration 추가 필요
5. `dataNeededRule.ts`, `cycleRegularityRule.ts` 본문도 하드코딩 → B2 결정 후 함께 이전
6. `InsightKind`: `cycle_regularity | cycle_phase | pain_pattern | mood_trend | data_needed` — `cycle_phase`, `pain_pattern`, `mood_trend` 룰 미구현
7. settings 화면은 언어 토글만 있음 — 알림·데이터 초기화·버전 정보 미구현

---

## 잔여 STEP 트리 (요약 표)

| STEP | 한 줄 설명 | 의존성 | 사이즈 | 다이어그램 |
|------|-----------|--------|--------|-----------|
| **7.5** | i18n 신규 키 일괄 추가 | — | S | 불필요 |
| **9.0** | 온보딩 라우팅 가드 (settings.onboardingCompleted 기반) | 7.5 | S | 불필요 |
| **9.1** | 온보딩 화면 구현 (주기 입력 + 완료 기록) | 9.0 | M | 필요 (흐름도) |
| **9.2** | 홈 화면 구현 (phase 카드 + 예측일 + 생리 시작/종료 버튼) | 9.1 | M | 필요 (상태도) |
| **9.3** | 컨디션 기록(Log) 화면 구현 (react-hook-form + ChoiceGroup) | 9.0 | M | 불필요 |
| **9.4** | 캘린더 화면 구현 (월간 뷰 + 셀 상태 + 날짜 선택) | 9.2, 9.3 | L | 필요 (셀 상태도) |
| **9.5** | 인사이트 화면 구현 (InsightCard 목록 + 룰 3개 추가) | 9.2 | M | 필요 (생성기 흐름) |
| **9.6** | 설정 화면 polish (알림 mock · 데이터 초기화 · 버전) | 9.0 | S | 불필요 |
| **10.1** | 샘플 시드 데이터 스크립트 (개발/QA용) | 9.6 | S | 불필요 |
| **10.2** | Edge case 검증 — 첫 사용 / 데이터 없음 / 주기 이상치 | 10.1 | M | 불필요 |
| **10.3** | 오프라인 UX 검증 (Capacitor 네트워크 끊김) | 10.2 | S | 불필요 |
| **11.1** | 리팩토링 — 100줄 초과 컴포넌트 분리 + 하드코딩 카피 제거 | 10.3 | M | 불필요 |
| **11.2** | MVP2 가드 자리 마련 (TODO 주석 + 확장 포인트 문서화) | 11.1 | S | 불필요 |
| **11.3** | 최종 typecheck · 빌드 통과 확인 + README 최소 업데이트 | 11.2 | S | 불필요 |

---

## STEP별 상세

---

### STEP 7.5 — i18n 신규 키 일괄 추가

**목적:** 이후 9.x 화면 구현이 기다리지 않도록 ko/en 사전에 필요한 모든 키를 미리 추가한다.

**변경/추가 파일:**
- `src/i18n/locales/ko.ts`
- `src/i18n/locales/en.ts`

**주요 작업:**
1. 아래 키 그룹을 양쪽 사전에 동시 추가 (en은 `Dictionary` 타입 강제라 컴파일로 누락 감지됨)
2. 온보딩 그룹: `onboarding.title`, `onboarding.cycleInputLabel`, `onboarding.periodInputLabel`, `onboarding.startCta`, `onboarding.skipCta`
3. 홈 그룹: `home.phase.menstrual`, `home.phase.follicular`, `home.phase.ovulation`, `home.phase.luteal`, `home.phase.unknown`, `home.daysUntilPeriod`, `home.daysUntilPeriodUnit`, `home.startPeriodButton`, `home.endPeriodButton`, `home.todayLoggedBadge`, `home.phaseTitle`
4. 캘린더 그룹: `calendar.title`, `calendar.today`, `calendar.noCondition`, `calendar.conditionSummary`
5. 인사이트 그룹: `insights.title`, `insights.cycleRegularityTitle`, `insights.cycleRegularityBody` (보간 방식은 B2 결정 후 확정), `insights.dataNeededTitle`, `insights.dataNeededBody`, `insights.noInsights`
6. 설정 그룹: `settings.notifications`, `settings.notificationsToggle`, `settings.dataReset`, `settings.dataResetConfirm`, `settings.version`, `settings.appVersion`
7. 공통: `common.save`, `common.cancel`, `common.confirm`, `common.loading`, `common.error`

**검증 방법:**
- `pnpm typecheck` — en.ts가 `Dictionary` 타입 불충족 시 컴파일 실패로 즉시 확인
- 브라우저에서 언어 토글 후 신규 키가 undefined 없이 출력되는지 확인

**결정 필요 항목:** B1(보간 방식), B2(Insight 본문 위치) — 이 STEP에서는 정적 키 우선 추가, 보간이 필요한 키는 B2 결정 후 7.5 재방문 또는 9.5에서 처리

**다이어그램:** 불필요

---

### STEP 9.0 — 온보딩 라우팅 가드

**목적:** 앱 첫 진입 시 `settings.onboardingCompleted === false`이면 온보딩으로 리다이렉트하는 가드를 설치한다. 이후 모든 화면 구현의 진입 전제.

**변경/추가 파일:**
- `src/app/(app)/layout.tsx` (현재 `AppShell` 래퍼) — guard 로직 추가
- `src/components/app/AppShell.tsx` — hydrate 완료 후 라우팅 판단

**주요 작업:**
1. `AppShell`에서 `settingsStore.hydrate()` 완료 후 `onboardingCompleted` 확인
2. `false`이면 `router.replace('/onboarding')` 실행 (replace로 백버튼 루프 방지)
3. hydrate 전(loading=true) 동안은 스켈레톤 또는 빈 화면 유지 (사용자에게 깜빡임 최소화)
4. 이미 온보딩 완료 상태이면 가드 미작동

**검증 방법:**
- IndexedDB 초기화 후 앱 진입 시 `/onboarding`으로 이동 확인
- 온보딩 완료 후 재진입 시 홈으로 정상 진입 확인
- `pnpm typecheck`

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

### STEP 9.1 — 온보딩 화면 구현

**목적:** 첫 사용자가 평균 주기/생리 기간을 입력하고 `onboardingCompleted = true`를 기록하여 홈으로 진입하게 한다.

**변경/추가 파일:**
- `src/app/(auth)/onboarding/page.tsx` — placeholder 교체
- `src/components/onboarding/CycleSetupForm.tsx` — 신규
- `src/i18n/locales/ko.ts`, `en.ts` — 이미 7.5에서 추가

**데이터 바인딩 흐름:**
- store: `useSettingsStore` (`update`, `settings.averageCycleLength`, `settings.averagePeriodLength`)
- domain: 없음 (단순 설정값 저장)
- i18n 키: `onboarding.*` 전체

**주요 작업:**
1. `CycleSetupForm` 컴포넌트 작성 — react-hook-form 사용, 입력 필드는 A2 결정에 따라 형태 확정
2. 유효성: 주기 15~60일, 생리 기간 1~14일 (cycle-logic.md 이상치 기준 동일하게 적용)
3. 제출 시 `settingsStore.update({ averageCycleLength, averagePeriodLength, onboardingCompleted: true })` 호출
4. 완료 후 `router.replace('/')` 실행
5. 건너뛰기(A2 결정에 따라) 시 기본값(28/5)으로 완료 처리

**검증 방법:**
- 주기 범위 벗어난 값 입력 시 에러 메시지 출력 확인
- 완료 후 IndexedDB에 `onboardingCompleted: true` 저장 확인
- 언어 전환 후 텍스트 정상 출력 확인
- `pnpm typecheck`

**결정 필요 항목:** A2 (입력 UI 형태)

**다이어그램 위치:** `docs/architecture/flows/onboarding-flow.md` (온보딩 진입 → 입력 → 완료 → 홈 전환 흐름도)

---

### STEP 9.2 — 홈 화면 구현

**목적:** 현재 주기 단계 카드, 다음 예정일 표시, 생리 시작/종료 버튼을 실제 데이터로 바인딩한다.

**변경/추가 파일:**
- `src/app/(app)/page.tsx` — placeholder 교체
- `src/components/home/PhaseCard.tsx` — 신규
- `src/components/home/NextPeriodBanner.tsx` — 신규
- `src/components/home/PeriodActionButton.tsx` — 신규

**데이터 바인딩 흐름:**
- store: `usePeriodStore` (`periods`, `add`, `update`, `hydrate`), `useSettingsStore` (`settings`)
- domain: `currentPhase(today, periods, settings)` → `phase`, `confidence` / `predictNextPeriod(periods, settings)` → `predictedDate`, `confidence`
- i18n 키: `home.phase.*`, `home.daysUntilPeriod`, `home.startPeriodButton`, `home.endPeriodButton`, `home.insufficientData`, `home.confidence*`, `home.todayLoggedBadge`

**주요 작업:**
1. `usePeriodStore.hydrate()` 호출 (AppShell에서 이미 settingsStore hydrate → period hydrate도 여기서 트리거)
2. `currentPhase()` 결과에 따라 `PhaseCard`에 단계명과 confidence 표시 (도메인 표현 규칙 준수: "~로 추정돼요")
3. `predictNextPeriod()` 결과로 `NextPeriodBanner` 렌더 — `predictedDate === null`이면 `home.insufficientData` 표시
4. 생리 중(`phase === 'menstrual'`)이면 "생리 종료" 버튼, 그 외는 "생리 시작" 버튼 표시 (A4 결정에 따라 날짜 선택 여부 확정)
5. loading / error / empty 3-state 모두 처리

**검증 방법:**
- 데이터 없음: `home.insufficientData` 출력 확인
- 데이터 1건: `confidence: 'low'` 배너 출력 확인
- 데이터 4건 이상: `confidence: 'high'` 전환 확인
- 생리 시작 탭 후 IndexedDB 저장 + 버튼 전환 확인
- `pnpm typecheck`

**결정 필요 항목:** A4 (생리 기록 날짜 방식)

**다이어그램 위치:** `docs/architecture/flows/home-state.md` (데이터 건수별 홈 화면 상태 분기도)

---

### STEP 9.3 — 컨디션 기록(Log) 화면 구현

**목적:** 오늘의 기분·에너지·통증·붓기·식욕·피부 + 메모를 3탭 이내로 저장하게 한다.

**변경/추가 파일:**
- `src/app/(app)/log/page.tsx` — placeholder 교체
- `src/components/log/ConditionForm.tsx` — 신규
- `src/components/log/ConditionSavedBadge.tsx` — 신규 (오늘 이미 기록한 경우 표시)

**데이터 바인딩 흐름:**
- store: `useConditionStore` (`upsert`, `getByDate`, `hydrateRange`)
- domain: 없음 (단순 저장)
- i18n 키: `log.*`, `condition.*` (conditionOptions는 이미 완비), `common.save`

**주요 작업:**
1. 컴포넌트 마운트 시 `hydrateRange(오늘, 오늘)` 호출 후 `getByDate(today)` — 이미 기록 있으면 기존값 pre-fill
2. `ChoiceGroup` 재사용하여 각 항목 선택 UI 구성 (총 6개 항목)
3. 메모 입력은 선택 필드 (`<textarea>`, `log.memoPlaceholder` i18n 키)
4. 제출 시 `conditionStore.upsert({ date: today, ...values })` 호출 → Toast로 `log.saved` 표시
5. UX 원칙: 3탭 이내 완료 — 단일 스크롤 페이지로 유지, 별도 스텝 분리 금지

**검증 방법:**
- 6개 항목 + 메모 입력 후 저장 → IndexedDB 확인
- 당일 재진입 시 기존값 pre-fill 확인
- `log.saved` Toast 출력 확인
- `pnpm typecheck`

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

### STEP 9.4 — 캘린더 화면 구현

**목적:** 월간 그리드에서 생리일, 예정일, 컨디션 기록 여부를 한눈에 보고 날짜 선택 시 컨디션 요약을 확인한다.

**변경/추가 파일:**
- `src/app/(app)/calendar/page.tsx` — placeholder 교체
- `src/components/calendar/MonthGrid.tsx` — 신규
- `src/components/calendar/DayCell.tsx` — 신규
- `src/components/calendar/DayDetailSheet.tsx` — 신규 (선택 날짜 컨디션 요약 바텀시트)
- `src/lib/date/calendarGrid.ts` — 신규 (월 그리드 날짜 배열 생성 순수 함수)

**데이터 바인딩 흐름:**
- store: `usePeriodStore` (`periods`), `useConditionStore` (`hydrateRange`, `getByDate`)
- domain: `predictNextPeriod()` (예정일 표시용)
- i18n 키: `calendar.*`, `nav.calendar`, `condition.*` (요약 표시)

**주요 작업:**
1. `calendarGrid(year, month, weekStartsOn)` 순수 함수 — 6주×7일 배열 생성, `lib/date/` 위치
2. 월 이동 시 `hydrateRange(월 시작일, 월 마지막일)` 호출
3. `DayCell` — 셀 상태: `menstrual`(실제 생리일) / `predicted`(예측 예정일) / `hasCondition`(컨디션 기록) / `today` / `default` → 색 토큰은 tailwind.config.ts에 등록
4. 날짜 선택 시 `DayDetailSheet` 표시 — 해당 날의 `DailyConditionLog` 요약
5. 이전/다음 월 네비게이션 버튼
6. loading(hydrateRange 진행 중) / error / empty(해당 월 기록 없음) 3-state

**검증 방법:**
- 오늘 날짜 셀 강조 확인
- 생리 기록된 날 셀 색상 확인
- 예측 예정일 셀 확인
- 날짜 탭 후 DayDetailSheet 출력 확인
- 이전/다음 월 이동 후 hydrateRange 재호출 확인
- `pnpm typecheck`

**결정 필요 항목:** A9 (주 시작 요일)

**다이어그램 위치:** `docs/architecture/flows/calendar-cell-states.md` (셀 상태 결정 트리)

---

### STEP 9.5 — 인사이트 화면 구현

**목적:** rule-based 인사이트를 카드 목록으로 보여준다. 기존 2개 룰에 `cycle_phase`, `pain_pattern`, `mood_trend` 룰을 추가한다.

**변경/추가 파일:**
- `src/app/(app)/insights/page.tsx` — placeholder 교체
- `src/components/insights/InsightCard.tsx` — 신규
- `src/lib/insight/rules/cyclePhaseRule.ts` — 신규
- `src/lib/insight/rules/painPatternRule.ts` — 신규
- `src/lib/insight/rules/moodTrendRule.ts` — 신규
- `src/lib/insight/generator.ts` — 신규 룰 3개 등록
- `src/i18n/locales/ko.ts`, `en.ts` — 인사이트 본문 키 (B2 결정 후 확정)
- `src/lib/insight/rules/cycleRegularityRule.ts` — 하드코딩 본문 제거, i18n 키로 교체 (B2 결정 후)

**데이터 바인딩 흐름:**
- store: `usePeriodStore` (`periods`), `useConditionStore` (전체 range 로드), `useSettingsStore` (`settings`)
- domain: `generateInsights(ctx)` → `Insight[]`
- i18n 키: `insights.title`, `insights.noInsights`, 각 rule별 title/body 키

**주요 작업:**
1. 인사이트 페이지에서 `generateInsights({ today, periods, conditions, settings })` 호출
2. `InsightCard` — `title`, `body`, `confidence` 배지 표시 (confidence별 색 구분, 파스텔 톤)
3. `cyclePhaseRule`: `currentPhase()` 결과 기반 — 현재 단계 설명 카드 (도메인 표현 규칙 준수)
4. `painPatternRule`: 생리 1~2일차 컨디션 중 `pain !== 'none'` 빈도 계산 — 3회 이상 패턴 시 카드 생성
5. `moodTrendRule`: 생리 전 3일 `mood === 'down' | 'low'` 빈도 계산 — 3회 이상 패턴 시 카드 생성
6. 결과 없음 / 데이터 부족: `insights.noInsights` 표시 (data_needed 룰이 커버)
7. loading / error 3-state

**검증 방법:**
- 데이터 부족 시 `data_needed` 카드만 출력 확인
- 주기 2건 이상 시 `cycle_regularity` 카드 출력 확인
- 하드코딩 문자열 없음 확인 (grep으로 ko/en 인라인 문자열 검사)
- `pnpm typecheck`

**결정 필요 항목:** B2 (Insight rule 본문 위치)

**다이어그램 위치:** `docs/architecture/flows/insight-generator.md` (InsightContext 입력 → rules 평가 → Insight[] 출력 흐름)

---

### STEP 9.6 — 설정 화면 polish

**목적:** 알림 토글(mock), 데이터 초기화, 앱 버전 표시를 추가하여 설정 화면을 완성한다.

**변경/추가 파일:**
- `src/app/(app)/settings/page.tsx` — 기능 추가
- `src/components/settings/NotificationToggle.tsx` — 신규 (mock)
- `src/components/settings/DataResetSection.tsx` — 신규

**데이터 바인딩 흐름:**
- store: `useSettingsStore` (`settings.notificationsEnabled`, `update`)
- domain: 없음
- i18n 키: `settings.notifications`, `settings.notificationsToggle`, `settings.dataReset`, `settings.dataResetConfirm`, `settings.version`, `settings.appVersion`

**주요 작업:**
1. 알림 토글 — `notificationsEnabled` 값을 `ChoiceGroup` 또는 `<input type="checkbox">` + `settingsStore.update` 연결. 실제 푸시 없음(mock), 버튼에 주석 `// TODO(MVP2): 실제 푸시 알림 연동`
2. 데이터 초기화 버튼 — 탭 시 confirm 알럿 (`settings.dataResetConfirm` i18n 키), 확인 시 IndexedDB 3개 store 초기화 후 `router.replace('/onboarding')` 리다이렉트
3. 앱 버전 표시 — `package.json`의 `version` 필드를 빌드 시 env로 주입하거나 상수로 관리 (`settings.appVersion`)

**검증 방법:**
- 알림 토글 후 `settingsStore.settings.notificationsEnabled` 변경 확인
- 데이터 초기화 후 온보딩 화면으로 이동 확인
- 버전 텍스트 출력 확인
- `pnpm typecheck`

**결정 필요 항목:** 없음 (알림은 mock 고정)

**다이어그램:** 불필요

---

### STEP 10.1 — 샘플 시드 데이터 스크립트

**목적:** 개발 및 QA 환경에서 인사이트·캘린더·홈 화면을 실제 데이터로 확인할 수 있도록 IndexedDB에 시드 데이터를 주입하는 스크립트를 만든다.

**변경/추가 파일:**
- `src/dev/seedData.ts` — 신규 (개발 전용, 프로덕션 빌드에서 제외)
- `src/app/(app)/settings/page.tsx` — 개발 모드에서만 "시드 데이터 주입" 버튼 표시 (`process.env.NODE_ENV === 'development'` 조건부)

**주요 작업:**
1. `PeriodLog` 6개 (3~6개월치, 현실적인 간격 변동 포함)
2. `DailyConditionLog` 30일치 (생리일 전후 통증·기분 패턴 포함)
3. `UserSettings.onboardingCompleted = true`
4. 시드 실행 후 모든 store `hydrate()` 재호출

**검증 방법:**
- 시드 주입 후 홈/캘린더/인사이트 화면에 실제 데이터 출력 확인
- `pnpm typecheck`

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

### STEP 10.2 — Edge case 검증

**목적:** 첫 사용, 데이터 없음, 주기 이상치 시나리오를 수동으로 검증하고 미처리 케이스를 수정한다.

**변경/추가 파일:** 검증 중 발견된 파일만 수정 (사전에 특정 불가)

**주요 작업:**
1. 첫 사용(IndexedDB 완전 초기화): 온보딩 → 홈 → 생리 시작 기록 → 컨디션 기록 전체 흐름
2. 데이터 없음: `home.insufficientData`, `insights.noInsights` 등 empty state 카피 출력 확인
3. 이상치 주기(13일, 61일 등 입력 또는 시드 주입): `aggregate.ts`에서 필터링 후 결과에 반영 확인
4. 생리 종료일 미기록 상태에서 다음 주기 시작 기록: 기존 `periodLog.endDate === null` 허용 확인
5. 언어 전환(ko → en → ko) 후 화면 텍스트 전환 확인

**검증 방법:** 위 5개 시나리오 수동 체크리스트 통과 + `pnpm typecheck`

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

### STEP 10.3 — 오프라인 UX 검증

**목적:** Capacitor 환경에서 네트워크를 끊어도 앱이 정상 동작(IndexedDB는 로컬이므로 읽기/쓰기 가능)함을 확인한다.

**변경/추가 파일:** 검증 중 발견된 파일만 수정

**주요 작업:**
1. 브라우저 DevTools 오프라인 모드에서 전체 화면 순회
2. 외부 CDN(Pretendard 폰트)이 캐시 없는 오프라인에서 폰트 폴백 출력 확인
3. `error` 상태가 네트워크 오류가 아닌 IndexedDB 오류에만 트리거됨을 확인

**검증 방법:** 오프라인 시나리오 수동 체크 + `pnpm typecheck`

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

### STEP 11.1 — 리팩토링

**목적:** 100줄 초과 컴포넌트 분리, 하드코딩 카피 제거, 인라인 문자열 잔존 여부 최종 정리.

**변경/추가 파일:** 분석 후 확정 (사전에 특정 불가)

**주요 작업:**
1. `src/**/*.tsx` grep — 인라인 한국어/영어 문자열 잔존 여부 확인 후 사전으로 이전
2. `cycleRegularityRule.ts`, `dataNeededRule.ts` 하드코딩 본문 → i18n 키로 교체 (B2 결정 결과 반영)
3. 100줄 초과 컴포넌트 `src/components/{도메인}/` 하위로 추출
4. `tailwind.config.ts` auth.bg 색 토큰 중복 정리 (progress.md 메모 항목)

**검증 방법:**
- `grep -rn '"[가-힣]' src/` — 인라인 한국어 없음 확인
- `pnpm typecheck`

**결정 필요 항목:** B2 결과 이미 반영된 상태여야 함

**다이어그램:** 불필요

---

### STEP 11.2 — MVP2 가드 자리 마련

**목적:** 향후 MVP2 기능(인증, 서버 연동, 실제 푸시 등) 진입점에 `// TODO(MVP2):` 주석을 달아 확장 포인트를 명시한다.

**변경/추가 파일:**
- `src/app/(auth)/login/page.tsx` — 인증 TODO 주석
- `src/components/settings/NotificationToggle.tsx` — 실제 푸시 TODO 주석
- `src/data/index.ts` — Supabase 교체 TODO 주석

**주요 작업:**
1. 명시적 제외 항목 각각에 TODO 주석 위치 확인 후 통일 포맷으로 추가
2. `docs/architecture/mvp2-extensions.md` — 확장 포인트 1페이지 문서 작성 (선택)

**검증 방법:** `pnpm typecheck`

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

### STEP 11.3 — 최종 빌드 통과 확인

**목적:** `pnpm typecheck` + `pnpm build` 전체 통과 후 MVP1 완료 선언.

**변경/추가 파일:** 빌드 에러 발생 시 해당 파일만 수정

**주요 작업:**
1. `pnpm typecheck` — TypeScript strict 에러 0건 확인
2. `pnpm build` — Next.js 정적 빌드 성공 확인
3. 빌드 아티팩트로 Capacitor iOS/Android 동기화 가능 상태 확인 (`npx cap sync` — 실행은 선택)
4. `README.md` 최소 업데이트: 로컬 실행 방법 + 스택 한 줄 정리

**검증 방법:** 빌드 성공 로그 + `pnpm typecheck` 에러 0건

**결정 필요 항목:** 없음

**다이어그램:** 불필요

---

## 결정 필요 항목 일괄 리스트

---

### A2 — 온보딩 주기 입력 UI 형태

**질문:** 온보딩에서 평균 주기(15~60일)와 생리 기간(1~14일)을 어떻게 입력받을까?

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A2-a. 숫자 입력 (`<input type="number">`)** | 직접 숫자 타이핑 | 구현 단순, 정확한 값 입력 가능 | 키보드 팝업, 모바일 UX 덜 감성적 |
| **A2-b. 슬라이더** | 범위 내 드래그 조정 | 터치 친화적, 입력 부담 없음 | 정밀도 낮음, 구현 M 사이즈 |
| **A2-c. 라디오 그룹 (구간 선택)** | 예: "25~28일", "29~32일" 등 구간 | 가장 쉬운 결정, 도메인 표현 유리 | 세밀한 값 입력 불가 |

**추천:** A2-a (숫자 입력 + react-hook-form 유효성). 구현 최소, 추후 슬라이더로 교체 용이. 건너뛰기(기본값 28/5 적용) 버튼 함께 제공.

---

### A4 — 홈 화면 생리 기록 날짜 방식

**질문:** 홈 화면의 "생리 시작" 버튼을 탭했을 때 날짜를 어떻게 처리할까?

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A4-a. 즉시 오늘** | 버튼 탭 → 오늘 날짜로 즉시 저장 | 가장 빠름, UX 단순 | 어제 기록 못 함 |
| **A4-b. 날짜 선택기 (±2일)** | 탭 → 오늘/어제/그제 선택 후 저장 | 늦게 기록하는 사용자 배려 | 바텀시트 추가, 구현 M |
| **A4-c. 날짜 선택기 (자유 선택)** | 풀 달력 선택 | 가장 유연 | 구현 L, UX 무거움 |

**추천:** A4-b (±2일). 핵심 사용 시나리오(어제 시작 오늘 기록)를 커버하면서 구현 비용 적절.

---

### A9 — 캘린더 주 시작 요일

**질문:** 캘린더 주 시작을 월요일로 고정할까, 사용자가 설정할 수 있게 할까?

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A9-a. 월요일 고정** | 한국 표준 달력 | 구현 단순, UserSettings 변경 없음 | 일요일 시작 선호 사용자 배려 못 함 |
| **A9-b. 설정 가능 (월/일)** | `UserSettings.weekStartsOn` 필드 추가 | 국제 사용자 배려 | 타입 · 어댑터 · migration 추가 필요, STEP 사이즈 L↑ |

**추천:** A9-a (월요일 고정). MVP1에서는 한국어 기본이므로 월요일이 표준. MVP2에서 설정 추가 시 `UserSettings.weekStartsOn` 필드 + migration 1건으로 확장 가능. `calendarGrid()` 함수 시그니처에 `weekStartsOn` 파라미터를 받도록 설계해두면 후속 변경 minimal.

---

### B1 — i18n 동적 값 보간 처리 방식

**질문:** "최근 평균 주기는 약 N일로 추정돼요" 처럼 숫자가 들어가는 문자열을 어떻게 처리할까?

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **B1-a. 정적 키 분리** | `insights.cycleRegularityBody`를 고정 문자열로, 숫자는 별도 `<span>`으로 JSX 조합 | 사전에 인라인 변수 없음, 구현 단순 | JSX 조합 로직이 컴포넌트에 들어감 |
| **B1-b. tFn 헬퍼 도입** | `tFn.insights.cycleRegularityBody({ avg: 28 })` 형태 함수 | ko/en 어순 완전 지원, 일관성 | 헬퍼 타입 설계 필요, M 사이즈 추가 |
| **B1-c. 템플릿 문자열 (단순 치환)** | `"최근 평균 주기는 약 {{avg}}일"` → replace 유틸 | 구현 빠름 | 어순 다른 언어에서 불안전 |

**추천:** B1-a (정적 키 분리 + JSX 조합). MVP1 규모에서 보간 필요 문자열이 2~3개 수준이라 tFn 도입 대비 복잡도 적음. 단, B1-b가 필요한 문장이 5개 이상이면 즉시 재검토.

---

### B2 — Insight rule 본문 위치

**질문:** `cycleRegularityRule.ts`, `dataNeededRule.ts`에 하드코딩된 한국어 본문을 어디로 옮길까?

현재 상태: `cycleRegularityRule.ts` 13번째 줄에 `"최근 평균 주기는 약 ${avg}일로 추정돼요..."` 직접 기재됨.

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **B2-a. i18n 사전 (`ko.ts`/`en.ts`)** | `insights.cycleRegularityBody` 키로 이전, rule은 키만 반환 | `useT()` 일관성, 헬스카피 규칙 준수 | rule 파일이 i18n 키 문자열에 의존 (도메인 순수성 약간 손상) |
| **B2-b. `constants/copy.ts`** | rule 전용 카피를 constants에 모음, 화면에서 locale에 따라 선택 | rule 파일 순수 유지 | 사전·constants 두 곳 관리 |
| **B2-c. rule 반환값에 i18n 키만** | `Insight.titleKey`, `Insight.bodyKey` 필드로 변경, 화면이 `t[bodyKey]` 조합 | 완전 분리 | `Insight` 타입 변경, 기존 화면 코드 수정 범위 넓음 |

**추천:** B2-a (i18n 사전으로 이전). `health-copy.md`의 "toast/alert/placeholder 모두 사전에서" 원칙과 일관. rule 파일은 키 문자열 상수만 참조하는 형태로 타협. B1-a와 조합 시 rule은 정적 title/body 키를 반환, 보간 필요 부분만 컴포넌트에서 처리.

---

### 참고: 기타 결정 항목 (A1, A3, A5~A8, C1~C4)

아래 항목은 이번 세션 이전부터 존재하나, 위 5개보다 우선순위가 낮거나 STEP 진행 중 자연스럽게 확정되는 항목들입니다.

| 항목 | 내용 | 확정 시점 |
|------|------|-----------|
| A1 | 로그인 시안 v1/v2/v3 택일 및 미사용 폴더 정리 | MVP1 범위 외(인증 제외) — MVP2에서 결정 |
| A3 | 워드마크 raster 이미지 사용 여부 | 브랜드 결정 — 별도 논의 |
| A5 | 온보딩 건너뛰기 허용 여부 | A2 결정 시 함께 확정 |
| A6 | 생리 종료일 입력 위치 (홈 버튼 vs. 캘린더 편집) | A4와 함께 STEP 9.2에서 확정 |
| A7 | DayDetailSheet 열기 트리거 (탭 vs. 롱프레스) | STEP 9.4에서 확정 |
| A8 | InsightCard confidence 배지 색상 매핑 | STEP 9.5 디자인 시 확정 |
| C1 | Capacitor 플랫폼 우선순위 (iOS/Android 동시 vs. iOS 우선) | 빌드 단계에서 확정 |
| C2 | `pnpm build` static export 여부 | Capacitor 빌드 방식에 따라 확정 |
| C3 | 앱 버전 주입 방식 (env var vs. 상수) | STEP 9.6에서 확정 |
| C4 | 시드 데이터 버튼 dev-only 노출 방식 | STEP 10.1에서 확정 |

---

## 진행 방식 옵션

| 방식 | 설명 | 안전성 | 속도 | 리스크 |
|------|------|--------|------|--------|
| **(a) STEP 단위 승인** | 각 STEP 완료 후 사용자 검토 · 승인 후 다음 STEP 진행 | 높음 | 느림 | 방향 틀림 시 1 STEP 손실 |
| **(b) 화면 단위 묶음** | 9.x 화면 1개 완료(예: 9.1+9.0 묶음)마다 1회 승인 | 중간 | 중간 | 2~3 STEP 되돌아올 수 있음 |
| **(c) 자율 실행** | 결정 항목(A2, A4, A9, B1, B2) 일괄 답변 후 senior-code-craftsman이 11.3까지 자동 진행 | 낮음 | 빠름 | 방향 오류 시 전체 재작업 가능성 |

**현재 CLAUDE.md 원칙:** "STEP은 한 번에 하나씩, 사용자 승인 후 진행" → 기본값은 **(a)**. 단, 사용자가 신뢰도를 높이고 싶다면 **(b)**를 추천.

---

## 사용자 액션 가이드

이 계획을 실행하려면 아래 **5개 결정에 답하고 진행 방식(a/b/c)을 선택**해 주세요.

```
A2: 온보딩 주기 입력 UI → [a.숫자 / b.슬라이더 / c.라디오 구간]
A4: 홈 생리 기록 날짜   → [a.즉시 오늘 / b.±2일 선택 / c.자유 선택]
A9: 캘린더 주 시작 요일 → [a.월요일 고정 / b.설정 가능(월/일)]
B1: i18n 보간 방식      → [a.정적 키+JSX / b.tFn 헬퍼 / c.템플릿 치환]
B2: Insight 본문 위치   → [a.i18n 사전 / b.constants/copy.ts / c.rule이 키만 반환]

진행 방식: [a.STEP 단위 / b.화면 단위 / c.자율 실행]
```

답변 후 **STEP 7.5**부터 실행을 시작합니다.
