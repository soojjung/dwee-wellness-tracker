# Edge case 수동 검증 체크리스트 (STEP 10.2)

> 코드 리뷰 기반 — 브라우저에서 사용자가 직접 검증해야 하는 시나리오 5종.
> 사전 준비: `pnpm dev`, 크롬 DevTools → Application → IndexedDB.

## 1. 첫 사용 (IndexedDB 완전 초기화)

### 준비
1. DevTools → Application → IndexedDB → `keyval-store` → **Delete database** (또는 Application → Clear site data)
2. localStorage / cookies 도 클리어
3. 페이지 새로고침

### 기대 동작
- [ ] `/login` 접근 시 LoginScreen 정상 노출
- [ ] "로그인 없이 사용하기" → `/` 이동 (구 `/onboarding` 으로 가지 않음)
- [ ] HomeScreen empty 상태 진입: **HomeHero** + **HomeEmptyForm** 노출
  - HomeHero 는 기본 이미지(`/brand/home-hero.png`) 보여줌
  - 우상단 연필/+ 버튼 클릭 가능
- [ ] HomeEmptyForm 에서:
  - 시작일 미입력 + 저장 → `onboarding.errorMissingDate` 메시지
  - 미래 날짜 + 저장 → `onboarding.errorFutureDate` 메시지
  - 주기 +/- 동작 (15~60 clamp)
  - 정상 입력 + 저장 → 화면이 **즉시** main 상태로 flip (페이지 리다이렉트 없이)
- [ ] /log, /insights 도 데이터 있는 상태로 정상 표시
- [ ] /calendar 에 생리 셀 / 예측 ring 출력

### 자동 점검됨
- LoginScreen → `/` href 확정 (grep: 0건의 `/onboarding` 참조)

---

## 2. 데이터 없음 (각 화면별 empty state)

### 기대 동작
- [ ] **HomeScreen** (periods=0): HomeHero + HomeEmptyForm. emptyHello + emptyDescription 출력
- [ ] **HomeScreen** (periods=1): main 상태 진입. 하지만 cycleRegularity 카드는 안 보임 (avg 계산 불가). data_needed insight 만 노출 (룰 진입은 periods<2)
- [ ] **InsightsScreen** (periods=0): `data_needed` 카드 1개 (룰이 항상 트리거). `noInsights` 메시지는 표시되지 않음
- [ ] **InsightsScreen** (periods≥2, conditions=0): cycle_regularity + cycle_phase 만. pain/mood 룰은 conditions 없으면 null 반환
- [ ] **CalendarScreen** (periods=0): 빈 그리드. 셀에 background 없음. `emptyMonth` 노티스 출력
- [ ] **ConditionForm** (오늘 기록 없음): 모든 ChoiceGroup 미선택 상태 (`value: null`), 배지 없음

### 자동 점검됨
- dataNeededRule: `periods.length >= 2 ? null : ...` → periods<2 일 때 트리거 (코드 검증 완료)
- painPatternRule: `if (periods.length < 2 || conditions.length === 0) return null` (코드 검증 완료)
- moodTrendRule: 동일

---

## 3. 이상치 주기 (15일 미만 / 60일 초과)

### 준비
1. /settings → 시드 데이터 주입 (dev 모드)
2. 또는 DevTools → IndexedDB → `dwee:periods` 직접 편집해서 비현실적 gap 삽입 (예: 7일짜리 + 70일짜리)

### 기대 동작
- [ ] aggregate.ts `averageCycleLength`:
  - gap < 15 또는 > 60 자동 필터링
  - 모든 gap 이 이상치면 `null` 반환 → HomeScreen `insufficientData` 표시
  - 일부만 이상치면 정상 gap 만으로 평균 계산
- [ ] aggregate.ts `averagePeriodLength`:
  - length < 1 또는 > 14 필터링
  - endDate 미입력 row 는 자동 제외

### 자동 점검됨
- aggregate.ts: `if (gap >= 15 && gap <= 60) gaps.push(gap)` (코드 검증 완료)
- length 필터: `.filter((l) => l >= 1 && l <= 14)` (코드 검증 완료)

---

## 4. 생리 종료일(endDate) 미기록 상태

### 준비
1. DevTools → IndexedDB → `dwee:periods` 에서 한 row 의 `endDate` 필드를 `undefined` 로
2. 또는 시드 후 첫 period 만 endDate 직접 제거

### 기대 동작
- [ ] PeriodLog 타입: `endDate?: string` 이라 undefined 허용
- [ ] `isPeriodDate()`: endDate 있으면 range, 없으면 startDate 만 매치 (단일 일자)
- [ ] CalendarScreen: 해당 startDate 셀만 menstrual 배경, 나머지는 default
- [ ] WeekStrip: 동일 (startDate 하루만)
- [ ] averagePeriodLength: 해당 row 제외하고 계산 진행
- [ ] 다음 주기 시작 기록도 정상 진행 (StartPeriodControl 으로 추가)

### 자동 점검됨
- cellState.isPeriodDate: `if (p.endDate) { ... } else if (date === p.startDate) return true` (코드 검증 완료)
- aggregate.averagePeriodLength: `p is PeriodLog & { endDate: string }` 필터 (코드 검증 완료)

---

## 5. 언어 전환 (ko ↔ en)

### 기대 동작
- [ ] /settings → 언어 → `English` 탭 → 화면 전체 텍스트 영어로 교체 (HomeScreen, ConditionForm, CalendarScreen, InsightsScreen, BottomTabNav 라벨 모두)
- [ ] 다시 `한국어` 탭 → 한국어로 교체
- [ ] 전환 후 새로고침 → 선택 locale 유지 (`settings.locale` IndexedDB 영속)
- [ ] InsightCard 본문 동적 보간(`averageDays`, `count`) 도 locale 따라 prefix/suffix 교체
- [ ] DayDetailSheet 의 condition 라벨 (mood/energy/...) 도 교체

### 자동 점검됨
- 모든 사용자 노출 텍스트가 `useT()` 경유 (grep: 사용자 노출 한국어 인라인 0건)
- useT 는 `useSettingsStore((s) => s.settings.locale)` 구독 → 변경 시 Zustand 가 re-render 트리거 (코드 검증 완료)

---

## 발견된 수정 사항

| 항목 | 위치 | 수정 |
|---|---|---|
| `HomeEmptyForm` repo 저장 실패 시 잘못된 에러 메시지 (`errorMissingDate`) 노출 | `src/components/app/HomeEmptyForm.tsx:34` | `t.home.errorLabel` 로 교체 |

## 검증 외 결정 — `/onboarding` 라우트 부재

- 기존 spec 의 "온보딩 → 홈" 흐름은 **온보딩 머지(2026-05-22)** 이후 "홈 빈 상태 inline form" 으로 변경됨.
- 데이터 리셋 후 redirect 목적지도 `/onboarding` → `/` 로 변경됨 (DataResetSection 확정).
- 본 체크리스트는 변경된 흐름 기준으로 작성.

---

## 자동 회귀 방지

- 모든 수정 후 `pnpm typecheck` 통과
- 한국어 인라인 grep: `grep -rnE "[가-힣]" src/ --include="*.tsx" --include="*.ts" | grep -v "//"` (사용자 노출 0건 확인)

---

## 6. 짧은 주기 입력 (직전 startDate 와 < 15일 간격)

> 도메인: `evaluateNewStart` (`src/domain/cycle/recordPolicy.ts`) → `ShortCycleConfirmDialog`.
> 임계치 `SHORT_CYCLE_THRESHOLD_DAYS = 15` 는 `aggregate.ts` 의 outlier 필터와 동기화.

### 시나리오: 6/10 기록 → 6/16 다시 입력

홈 우상단 캘린더 아이콘 → 6/16 입력 → 저장.

### 기대 동작

- [ ] `PeriodRangeDialog` 닫히고 `ShortCycleConfirmDialog` 가 열림
- [ ] 본문: "직전 생리 시작일이 **6**일 전이에요." 표시
- [ ] **세 선택지** 노출 (각 클릭 시 동작):
  - **아직 생리 중이에요** → `extendThrough(priorId, 새 endDate)`. 직전 record 의 `endDate` 가 `max(기존 endDate, 새 endDate)` 로 확장. 새 record 는 생성되지 않음.
  - **날짜를 잘못 입력했어요** → `replace(priorId, 새 input)`. 직전 record 삭제 + 새 record 추가.
  - **그래도 저장할게요** → 정상 `add`. 직전·새 record 모두 보존.
- [ ] 취소 → 두 다이얼로그 모두 닫히고 아무 쓰기도 발생하지 않음

### 데이터 정합성 노트

- **`DailyConditionLog` 는 `date` 키 기반** (PK 가 날짜) — `PeriodLog.id` 와 FK 관계 없음.
- 따라서 `replace` 로 직전 PeriodLog 가 삭제되어도 같은 날짜의 condition 은 그대로 보존. orphan 위험 없음.
- 단, 사용자 멘탈 모델에서는 "그 날의 컨디션" 이 직전 생리와 같이 사라질 거라 기대할 수도 있으므로, 향후 UX 리뷰 대상.

### 장기 생리(7일+) 안내

- `extend` 선택 후 결과 기간이 `LONG_PERIOD_NOTICE_DAYS = 7` 일 초과면 토스트로 안내 ("총 N일로 저장했어요. 다르면 언제든 수정해 주세요").
- 의료 단정 아닌 정보 제공 톤. 통계 이상치 컷오프(14일)와는 별개 — 사용자 인지용 알림.

### 자동 점검됨

- `src/domain/cycle/recordPolicy.test.ts` 의 `evaluateNewStart` describe 블록: idempotent / no prior / 14일 gap / 6일 gap (본 시나리오) / 15일 경계 / 가장 가까운 prior 선택 / 미래 record 무시 / 임계치 동기화 — 8 케이스.
