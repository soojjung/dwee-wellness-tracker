# Menstrual Cycle Domain Logic

## Overview

dwee는 사용자의 생리 주기를 4단계로 구분하고 rule-based 로직으로 현재 단계와 다음 생리 예상일을 추정합니다. 모든 계산은 평균 주기와 최근 기록을 기반으로 하며, 데이터 부족 시 추정값을 강제하지 않습니다.

## 4-Phase Cycle Definition

### 월경기 (Menstrual Phase)
- **범위**: 생리 시작일 + 0일 ~ 생리 기간(평균) 이전
- **생리학적 근거**: 실제 생리가 진행되는 기간. 에스트로겐·프로게스테론 모두 저점.
- **특징**: 피로, 복통, 집중력 저하 등이 흔함.
- **경계**: `dayInCycle < averagePeriodLength`

### 난포기 (Follicular Phase)
- **범위**: 생리 종료 ~ 배란 전 2일
- **생리학적 근거**: 난소에서 난포가 성숙하며 에스트로겐 상승. 에너지·기분·인지 기능 개선.
- **경계**: `dayInCycle >= averagePeriodLength && dayInCycle < ovulationDay - 2`
  - `ovulationDay = averageCycleLength - 14`

### 배란기 (Ovulation Phase)
- **범위**: 배란 예상일 ± 2일 (총 4일)
- **생리학적 근거**: 난자 배출 시점. LH 급증. 에너지·사회성 피크. 일부는 배란통/소량 출혈.
- **경계**: `dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 1`
  - `±2일` 폭은 배란 시점의 개인차(±2일) 반영

### 황체기 (Luteal Phase)
- **범위**: 배란 후 ~ 생리 전
- **생리학적 근거**: 황체에서 프로게스테론 분비. 하강 시 PMS(부종, 감정 기복, 식욕 변화, 피로) 가능.
- **경계**: `dayInCycle > ovulationDay + 1 && dayInCycle < averageCycleLength`

### Unknown
- **조건**: 데이터 부족 또는 계산 불가능 상태
- **반환**: `{ phase: 'unknown', confidence: 'unknown' }`

## Phase 판정 알고리즘

### 의사 코드

```
FUNCTION currentPhase(today, periods, settings) -> PhaseEstimate
  IF periods.length == 0
    RETURN { phase: 'unknown', confidence: 'unknown' }
  END IF

  last_period = periods[sorted by startDate][length - 1]
  dayInCycle = days_between(last_period.startDate, today)
  
  IF dayInCycle < 0
    RETURN { phase: 'unknown', confidence: 'low' }
  END IF

  cycle_length = average_cycle_length(periods) OR settings.averageCycleLength
  period_length = average_period_length(periods) OR settings.averagePeriodLength
  ovulation_day = cycle_length - 14

  DETERMINE phase FROM dayInCycle:
    IF dayInCycle < period_length
      phase = 'menstrual'
    ELSE IF dayInCycle < ovulation_day - 2
      phase = 'follicular'
    ELSE IF dayInCycle <= ovulation_day + 1
      phase = 'ovulation'
    ELSE IF dayInCycle < cycle_length
      phase = 'luteal'
    ELSE
      phase = 'unknown'
    END IF

  confidence = periods.length >= 3 ? 'medium' : 'low'
  
  RETURN { phase, confidence }
END FUNCTION
```

### 입력/출력 스펙

#### 입력 (Input)
- `today: string` (ISO 8601, e.g., "2026-06-04")
- `periods: PeriodLog[]`
  - `PeriodLog.startDate: string` (ISO 8601)
  - `PeriodLog.endDate?: string` (선택, ISO 8601)
- `settings: UserSettings`
  - `averageCycleLength: number` (기본값: 28, 범위: 15-60)
  - `averagePeriodLength: number` (기본값: 5, 범위: 1-14)

#### 출력 (Output)
```typescript
interface PhaseEstimate {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';
  confidence: 'low' | 'medium' | 'high' | 'unknown';
}
```

- `phase`: 현재 추정 단계
- `confidence`:
  - `'unknown'`: 데이터 0개 또는 계산 불가능 (dayInCycle < 0 또는 >= cycle)
  - `'low'`: 데이터 1-2개, 또는 dayInCycle < 0 상태
  - `'medium'`: 데이터 3개 이상
  - `'high'`: 미사용 (현재 phase 로직에서는 'medium'만 사용)

## 데이터 부족 시 동작

### 0개 기록
```
currentPhase() → { phase: 'unknown', confidence: 'unknown' }
UI: "아직 예측하기 어려워요"
```

### 1개 기록
```
- 해당 기록이 오늘 이전이면: dayInCycle 계산 가능, confidence: 'low'
- 해당 기록이 미래면: dayInCycle < 0, phase: 'unknown', confidence: 'low'
```

### 2개 이상 기록
- `averageCycleLength()`, `averagePeriodLength()` 계산 가능 (aggregate.ts)
- confidence: 'low' (3개 미만)
- confidence: 'medium' (3개 이상)

### 평균 주기 계산 불가능 시 (e.g., 이상치)
- `aggregate.averageCycleLength()` → `null` 반환
- `phase.ts` 라인 17에서 `settings.averageCycleLength` fallback
- 사용자 설정값(기본 28)으로 대체

## 진행 중인 생리 (Ongoing Period)

### 상황
- `PeriodLog.endDate === undefined` 상태의 생리 기록

### 처리
- `currentPhase()` 계산: `dayInCycle` 기반이므로 자동 반영
- `averagePeriodLength()` 계산: `endDate` 있는 항목만 필터링 (aggregate.ts:17)
  - 진행 중인 생리는 기간 추정에 미포함 → 과거 데이터만 사용

### 결과
- 진행 중인 생리 기간 중: `phase = 'menstrual'` (dayInCycle < periodLen)
- 기간 추정은 과거 완료된 생리들의 평균값 사용

## Edge Cases

### Case 1: dayInCycle < 0 (기록 미래 날짜)
```
phase: 'unknown', confidence: 'low'
원인: 최근 생리 기록이 오늘보다 미래
조치: 데이터 정합성 확인 필요
```

### Case 2: dayInCycle >= cycle (예상 주기 초과)
```
phase: 'unknown', confidence: ?
원인: 다음 생리가 예상 시점을 지나도 없음
조치: 장기 주기 변동 또는 누락된 기록 가능성
```

### Case 3: 극단적 주기 (< 15 또는 > 60일)
```
aggregate.ts의 이상치 필터 (lines 10, 21)
- 주기 < 15일: 제외
- 주기 > 60일: 제외
- 기간 < 1일: 제외
- 기간 > 14일: 제외

결과: 평균값 계산에서 제외, settings 값 fallback
```

### Case 4: 단일 완료된 생리 기간만 기록
```
- averagePeriodLength() → null (최소 1개 endDate 필요하지만, 평균은 불가)
  → settings.averagePeriodLength (기본 5) fallback
```

## Phase → UI 매핑 테이블

| Phase | 컴포넌트 | i18n 키 | 노출 텍스트 (ko) | 신뢰도 영향 |
|---|---|---|---|---|
| menstrual | PhaseAdvicePill | `home.phaseAdvice.menstrual` | "몸이 힘들 수 있어요. 편안하게 보내세요" | 0 (phase만 의존) |
| follicular | PhaseAdvicePill | `home.phaseAdvice.follicular` | "에너지가 차오르는 시기예요" | 0 |
| ovulation | PhaseAdvicePill | `home.phaseAdvice.ovulation` | "활동성이 좋은 시기예요" | 0 |
| luteal | PhaseAdvicePill | `home.phaseAdvice.luteal` | "피곤할 수 있는 날이니 휴식을 추천해요" | 0 |
| unknown | PhaseAdvicePill | `home.phaseAdvice.unknown` | "오늘도 평안하게 보내세요" | 0 |
| menstrual | KeywordCards | `home.keywords.menstrual[0-3]` | 4개 카드 (휴식, 마무리, 집순이, 따뜻함) | 0 |
| follicular | KeywordCards | `home.keywords.follicular[0-3]` | 4개 카드 (시작, 시도, 도전, 사람) | 0 |
| ovulation | KeywordCards | `home.keywords.ovulation[0-3]` | 4개 카드 (만남, 실행, 발표, 모험) | 0 |
| luteal | KeywordCards | `home.keywords.luteal[0-3]` | 4개 카드 (정리, 유지, 안정, 내부) | 0 |
| unknown | KeywordCards | `home.keywords.unknown[0-3]` | 4개 카드 (비우기, 관찰, 천천히, 호흡) | 0 |
| menstrual | ActivitySuggestions | `home.activities.menstrual` | 카테고리: "셀프 케어", 5개 items | 0 |
| follicular | ActivitySuggestions | `home.activities.follicular` | 카테고리: "새 시도", 5개 items | 0 |
| ovulation | ActivitySuggestions | `home.activities.ovulation` | 카테고리: "활동적인 시간", 5개 items | 0 |
| luteal | ActivitySuggestions | `home.activities.luteal` | 카테고리: "마음 챙기기", 6개 items | 0 |
| unknown | ActivitySuggestions | `home.activities.unknown` | 카테고리: "부드러운 루틴", 4개 items | 0 |

**주석**:
- 신뢰도 영향 = 0: 현재 UI가 `phase` 값만 의존, confidence 값은 미사용
- 추후 UI 개선 시 confidence를 시각적 불확실성 표현(e.g., "참고용") 추가 가능

## 사용 위치 (Code References)

### 직접 호출
- `src/components/app/HomeScreen.tsx:70-73`
  ```typescript
  const phase = useMemo(
    () => currentPhase(today, periods, settings),
    [today, periods, settings],
  );
  ```

### Phase 값 소비
- `PhaseAdvicePill` (line 140): `phase.phase` → i18n lookup
- `KeywordCards` (line 144): `phase.phase` → i18n lookup
- `ActivitySuggestions` (line 147): `phase.phase` → i18n lookup

### 저장소 연결
- `usePeriodStore` → `periods` 배열 제공
- `useSettingsStore` → `settings` 객체 제공

## 도메인 표현 규칙 준수

### ✅ 현황
- 모든 UI 노출 텍스트가 추정형/제안형 사용
- 의료 단어(진단, 치료, 처방, 정상, 비정상) 없음
- 다이어트 유도 없음
- 단정형 표현 없음 (모두 "~예요", "~할 수 있어요", "~로 보여요" 등)

## 변경 이력

| 날짜 | 변경 | 영향 범위 | 상태 |
|---|---|---|---|
| 2026-06-04 | 초기 문서화 | phase.ts, aggregate.ts, predictor.ts 로직 검증 및 문서화 | 완료 |
| 2026-06-04 | 황체기 phase advice 카피 완충 어조로 조정 ("휴식을 추천해요" → "잠시 쉬어가도 좋아요" / "rest is recommended" → "taking it easy may help") | `home.phaseAdvice.luteal` ko/en | 완료 |

## 향후 계획

### Phase 신뢰도 UI 표현
- 현재: phase 값만 노출, confidence 미사용
- 미래: "참고용 추정", "안정적 패턴" 등 confidence 기반 서브텍스트 추가

### 사용자 인터페이션
- 현재: settings의 고정 평균값
- 미래: 개별 주기 기록 시 실시간 평균 재계산 및 피드백

### AI/ML 도입 (CLAUDE.md 제외 항목)
- 현재: rule-based (평균값 + 고정 주기)
- 미래: rule-based → AI 추정으로 전환 시 아키텍처 변경 필요
- 예: 개인화된 주기 변동 패턴 학습
