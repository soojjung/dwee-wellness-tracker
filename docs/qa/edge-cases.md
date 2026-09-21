# Edge case 수동 검증 체크리스트

> 코드 리뷰 기반 — 브라우저에서 사용자가 직접 검증해야 하는 시나리오.
> 사전 준비: `pnpm dev`, 크롬 DevTools → Application → IndexedDB.

## 1. 첫 사용 (IndexedDB 완전 초기화)

### 준비
1. DevTools → Application → IndexedDB → `keyval-store` → **Delete database** (또는 Application → Clear site data)
2. localStorage / cookies 도 클리어
3. 페이지 새로고침

### 기대 동작
- [ ] 기기 최초 실행이므로 `/onboarding`(스플래시 → 소개 슬라이드 3장) → `/login` 순으로 진입. 상세: [`docs/flows/onboarding.md`](../flows/onboarding.md)
- [ ] "로그인 없이 사용하기" → `/` 이동, 익명 세션 발급
- [ ] HomeScreen empty 상태 진입 (`periods.length === 0`):
  - `HomeHero` — `/home/default-hero.jpg` 기본 이미지, `!isCustom && !hasUserText` 라 `editHint` 안내 노출
  - `WeekStrip` — 예측 데이터 없이 오늘 날짜 원만 표시
  - `PhaseAdvicePill` / Keywords / Activities / Foods 섹션 → 각각 `EmptyHintCard` placeholder
- [ ] 계정에 기록이 없고 `onboardingCompleted` 가 false면 첫 홈 진입 시 생리일 기입 바텀시트(`PeriodSelectSheet variant="intro"`)가 한 번 더 뜬다 — 선택 없이 시작해도 완료로 기록되어 다시 묻지 않음
- [ ] 우상단 캘린더 아이콘 탭 → `PeriodSelectSheet` (바텀 시트 캘린더) 오픈, 날짜 선택 후 저장하면 화면이 즉시 데이터 상태로 전환 (리다이렉트 없음)
- [ ] `/log` Diary 뷰: 빈 그리드에 생리 셀 없음. Report 뷰: `CycleReportEmpty` 안내

---

## 2. 데이터 없음 / 부족 (각 화면별 empty·insufficient state)

### 기대 동작
- [ ] **HomeScreen** (`periods.length === 0`): EmptyHintCard 계열만 노출, 인사이트 섹션 없음 (`generateInsights()`가 호출되긴 하지만 각 rule이 자체 조건으로 null 반환)
- [ ] **HomeScreen** (`periods.length === 1`): 데이터 상태 진입. `cycleRegularityRule` 은 `cycleLengths.length < 2` 로 null (카드 없음). 나머지 세 rule(`cyclePhaseRule`/`painPatternRule`/`moodTrendRule`)은 조건 충족 시 각자 평가
- [ ] **HomeScreen** (`periods.length >= 2`, conditions=0): `cycleRegularityRule` + `cyclePhaseRule` 만 카드로 뜸. `painPatternRule`/`moodTrendRule` 은 `conditions.length === 0` 이면 null
- [ ] **MyPage `CycleSummaryCard`** (`periods.length < 3`): `classifyCycleStatus()` 가 `status: 'insufficient'` 반환 → `t.myPage.cycle.insufficient` 표시
- [ ] **`/log` Report `CycleReportCard`** (`periods.length < 3`): `t.report.chartEmpty` (기록 부족 안내). 기록 3회 이상인데 최근 6개월에 셀 수 있는 주기가 0개면 `t.report.chartNoCycles` (상세: [`docs/flows/log.md`](../flows/log.md))
- [ ] **DiaryScreen — Diary 뷰** (`periods.length === 0`): 빈 그리드. 셀에 배경 없음
- [ ] **EventFormSheet / EventConditionSection** (오늘 기록 없음): 모든 `ConditionRow` 미선택 상태, 저장 안 해도 폼 제출 가능(컨디션은 선택 사항)

### 자동 점검됨
- `src/lib/insight/generator.ts`: `dataNeededRule` 은 2026-08-16 부로 주석 처리(은퇴) — import 안 됨. 현재 등록된 4개 rule: `cycleRegularityRule`/`cyclePhaseRule`/`painPatternRule`/`moodTrendRule`
- `painPatternRule`/`moodTrendRule`: `if (periods.length < 2 || conditions.length === 0) return null` (코드 검증 완료)

---

## 3. 이상치 주기 (15일 미만 / 60일 초과)

### 준비
1. /settings → 시드 데이터 주입 (dev 모드)
2. 또는 DevTools → IndexedDB → `dwee:periods` 직접 편집해서 비현실적 gap 삽입 (예: 7일짜리 + 70일짜리)

### 기대 동작
- [ ] `aggregate.ts` `averageCycleLength`:
  - gap < 15 또는 > 60 자동 필터링 (`cycleGap.ts`의 `CYCLE_GAP_MIN_DAYS`/`CYCLE_GAP_MAX_DAYS`)
  - 모든 gap 이 이상치면 `null` 반환 → `settings.averageCycleLength`(기본 28) fallback
  - 일부만 이상치면 정상 gap 만으로 평균 계산
- [ ] `aggregate.ts` `averagePeriodLength`:
  - length < 1 또는 > 14 필터링
  - endDate 미입력 row 는 자동 제외

### 자동 점검됨
- `cycleGap.ts`: `gap >= CYCLE_GAP_MIN_DAYS(15) && gap <= CYCLE_GAP_MAX_DAYS(60)` (코드 검증 완료)
- length 필터: `.filter((l) => l >= 1 && l <= 14)` (코드 검증 완료)

---

## 4. 생리 종료일(endDate) 미기록 상태

### 준비
1. DevTools → IndexedDB → `dwee:periods` 에서 한 row 의 `endDate` 필드를 `undefined` 로
2. 또는 시드 후 첫 period 만 endDate 직접 제거

### 기대 동작
- [ ] `PeriodLog` 타입: `endDate?: string` 이라 undefined 허용
- [ ] `isPeriodDate()`(`src/domain/cycle/cellState.ts`): endDate 있으면 range, 없으면 startDate 만 매치 (단일 일자)
- [ ] DiaryScreen (Diary 뷰): 해당 startDate 셀만 menstrual 배경, 나머지는 default
- [ ] WeekStrip: 동일 (startDate 하루만)
- [ ] `averagePeriodLength`: 해당 row 제외하고 계산 진행
- [ ] 다음 주기 시작 기록도 정상 진행 (`PeriodSelectSheet` 또는 `LogEntryDialog` 으로 추가)

### 자동 점검됨
- `cellState.isPeriodDate`: `if (p.endDate) { ... } else if (date === p.startDate) return true` (코드 검증 완료)
- `aggregate.averagePeriodLength`: `p is PeriodLog & { endDate: string }` 필터 (코드 검증 완료)

---

## 5. 언어 전환 (ko ↔ en)

### 기대 동작
- [ ] `/settings` → 언어 → `English` 탭 → 화면 전체 텍스트 영어로 교체 (HomeScreen, DiaryScreen, `/log` Report, EventFormSheet, BottomTabNav 라벨 모두)
- [ ] 다시 `한국어` 탭 → 한국어로 교체
- [ ] 전환 후 새로고침 → 선택 locale 유지 (`settings.locale` IndexedDB/Supabase 영속)
- [ ] InsightCard 본문 동적 보간(`averageDays` 등) 도 locale 따라 prefix/suffix 교체
- [ ] `EventConditionSection` / `LogEntryDialog` 의 condition 라벨 (mood/energy/pain/bloating/appetite/skin/sleep/exercise) 도 교체

### 자동 점검됨
- 모든 사용자 노출 텍스트가 `useT()` 경유 (그렙: 사용자 노출 한국어 인라인 0건)
- `useT` 는 `useSettingsStore((s) => s.settings.locale)` 구독 → 변경 시 Zustand 가 re-render 트리거 (코드 검증 완료)

---

## 검증 외 결정 — `/onboarding` 라우트 의미 변화

- 2026-05-22 온보딩 머지 당시 `/onboarding` 은 "생리일 입력 폼"이었고, 이후 한동안 라우트 자체가 없었다(홈 빈 상태 inline form 으로 대체).
- **2026-09-19 갱신**: `/onboarding` 라우트가 다시 생겼다 — 단, 의미가 다르다. "생리일 입력 폼"이 아니라 **기기 최초 실행 시 1회** 보여주는 소개 슬라이드(스플래시 → 슬라이드 1/2/3 → 로그인)다. 현재 첫 진입 흐름은 [`docs/flows/onboarding.md`](../flows/onboarding.md) 참고.

---

## 자동 회귀 방지

- 모든 수정 후 `pnpm typecheck` 통과
- 한국어 인라인 grep: `grep -rnE "[가-힣]" src/ --include="*.tsx" --include="*.ts" | grep -v "//"` (사용자 노출 0건 확인)

---

## 6. 짧은 주기 입력 — 현재 도달 불가 (참고용으로만 보존)

> `evaluateNewStart`(`src/domain/cycle/recordPolicy.ts`)와 이를 소비하던 `ShortCycleConfirmDialog` 는 더 이상 연결돼 있지 않다. `ShortCycleConfirmDialog.tsx` 파일 자체가 삭제됐고, `PeriodSelectSheet`/`LogEntryDialog` 어느 쪽도 `evaluateNewStart` 를 호출하지 않는다. 아래는 순수 함수·테스트로만 남아 있는 예전 설계를 참고용으로 남겨 둔 것이며, 브라우저에서 재현 가능한 시나리오가 아니다.

### (참고) 원래 설계: 6/10 기록 → 6/16 다시 입력 시

- `shortGap` 판정(직전 startDate 와 15일 미만 간격) 시 세 선택지 제공 예정: "아직 생리 중이에요"(`extendThrough`) / "날짜를 잘못 입력했어요"(`replace`) / "그래도 저장할게요"(`add`).
- `DailyConditionLog` 는 `date` 키 기반(PK)이라 `PeriodLog.id` 와 FK 관계가 없다 — `replace` 로 직전 PeriodLog가 삭제되어도 같은 날짜의 condition은 보존된다.

### 자동 점검됨 (도메인 함수 단위로는 계속 유효)

- `src/domain/cycle/recordPolicy.test.ts` 의 `evaluateNewStart` describe 블록: idempotent / no prior / 14일 gap / 6일 gap / 15일 경계 / 가장 가까운 prior 선택 / 미래 record 무시 / 임계치 동기화 — 8 케이스, 모두 통과. UI 미연결 상태와 무관하게 순수 함수 자체는 정확하다.
