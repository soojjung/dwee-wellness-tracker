# 홈 화면 플로우

> 위치: `src/components/app/{HomeScreen,HomeHero,WeekStrip,EmptyHintCard,PhaseAdvicePill,ScratchKeywordCard,ActivitySuggestions,FoodSuggestions,TodayDateHeading,CalendarAddIcon,PeriodSelectSheet}.tsx`, `src/app/(app)/page.tsx`

## 생리 기록 진입점

**우상단 캘린더 아이콘**이 유일한 진입점입니다. `TodayDateHeading` 컴포넌트의 캘린더 아이콘을 탭하면 `PeriodSelectSheet` (바텀 시트 캘린더)가 열립니다. 기존 우하단 FAB(`AddPeriodFab`)과 `PeriodRangeDialog` + `ShortCycleConfirmDialog` 조합은 제거되었습니다.

`PeriodSelectSheet`는 최근 N개월 캘린더 그리드를 보여주며, 날짜 셀을 탭하면 `domain/cycle/periodEdit.ts`의 순수 함수로 드래프트를 조작합니다. 저장 시 `PeriodChange[]` diff를 `HomeScreen.handlePeriodChanges`로 전달해 add / update / remove를 일괄 적용합니다.

```mermaid
flowchart TD
    Icon(["캘린더 아이콘\n(TodayDateHeading 우상단)"])
    Sheet["PeriodSelectSheet\n(바텀 시트 캘린더)"]
    Tap{"셀 탭 — 날짜 상태?"}
    Remove["removeDay()\n기존 기간에서 제거"]
    Extend["extendTo()\n인접 기간 연장"]
    Range["addRange()\n새 범위 추가"]
    Save["computeChanges() →\nhandlePeriodChanges()"]
    Done(["완료"])

    Icon --> Sheet
    Sheet -->|"Cancel"| Done
    Sheet -->|"날짜 탭"| Tap
    Tap -->|"기존 기간 내 날짜"| Remove --> Sheet
    Tap -->|"인접 기간 근처\n(≤ 7일)"| Extend --> Sheet
    Tap -->|"새 날짜\n(첫 탭)"| Sheet
    Tap -->|"새 날짜\n(두 번째 탭)"| Range --> Sheet
    Sheet -->|"Save (dirty)"| Save --> Done

    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    classDef store fill:#F0E8FD,stroke:#BDA8E5,color:#4A3A5C;
    class Icon,Sheet,Done ui;
    class Tap,Remove,Extend,Range logic;
    class Save store;
```

## 화면 상태 분기

```mermaid
flowchart TD
    Mount["HomeScreen mount"] --> Auth{"authHydrated?"}
    Auth -->|"No (AuthGuard → /login)"| Done2(["리다이렉트"])
    Auth -->|"Yes"| Hydrate["periodStore.hydrate()\nconditionStore.hydrateRange(−90d, today)"]
    Hydrate --> Check{"settingsHydrated &&\nperiodsHydrated?"}
    Check -->|"No"| Loading["loading 표시\nt.home.loadingLabel"]
    Check -->|"Error"| Error["error 표시\nt.home.errorLabel"]
    Check -->|"periods 0개"| Empty["isEmpty 분기\nEmptyHintCards + WeekStrip(today circle)"]
    Check -->|"periods 1개+"| Normal["데이터 상태\nPhaseAdvicePill + Keywords\n+ Activities + Foods + InsightCards"]

    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    class Mount,Loading,Error,Empty,Normal,Done2 ui;
    class Auth,Hydrate,Check logic;
```

### isEmpty 분기 상세

- **HomeHero**: `isEmpty && !isCustom && !hasUserText` 조건이 모두 참일 때만 `editHint` 가이드 문구 표시.  
  `isCustom` = photoCount 슬롯이 전부 채워진 경우, `hasUserText` = mainText 또는 subText 가 비어있지 않은 경우.  
  배경은 기본 `bg-brand-gray300`. 사진이 있으면 `PhotoLayout`(1/2/4 그리드), 텍스트가 있으면 `HomeHeroText` 오버레이 표시.
- **WeekStrip**: 예측 데이터 없이 오늘 날짜 원만 표시 (pink50 배경, pink800 텍스트)
- **PhaseAdvicePill**: 숨김 → `EmptyHintCard`(`t.home.empty.bodyPrefix` + 캘린더 아이콘 인라인 + `t.home.empty.bodySuffix`) 로 대체
- **Keywords / Activities / Foods**: 각 섹션에 `EmptyHintCard` placeholder 삽입. 섹션 간 간격 `gap-12`.

> 이전 `setupMode` (인라인 `SetupPeriodPicker` 캘린더 picker) 는 삭제됨.  
> 이전 우하단 `AddPeriodFab` 도 삭제됨.  
> 이전 `PeriodRangeDialog` + `ShortCycleConfirmDialog` 조합도 제거됨 — 파일은 남아 있으나 `HomeScreen`에서 미사용.  
> 기록 진입은 `TodayDateHeading` 캘린더 아이콘 → `PeriodSelectSheet` 로 통일.

## 데이터 흐름 (데이터 상태)

```mermaid
flowchart LR
    PS["periodStore.periods"] --> CP["currentPhase()"]
    SS["settingsStore.settings"] --> CP
    PS --> PNP["predictNextPeriod()"]
    SS --> PNP
    PS --> GI["generateInsights()"]
    CS["conditionStore.byDate"] --> GI
    SS --> GI
    MS["mediaStore\n(photoCount/urls/text)"] -->|"decor"| Hero

    CP -->|"PhaseEstimate"| Hero["HomeHero\n+ HomeHeroText\n+ PhotoLayout"]
    CP -->|"phase"| Cards["PhaseAdvicePill\nKeywords · Activities · Foods"]
    PNP -->|"CyclePrediction"| Strip["WeekStrip"]
    GI -->|"Insight[]"| IC["InsightCard 반복"]

    classDef store fill:#F0E8FD,stroke:#BDA8E5,color:#4A3A5C;
    classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    class PS,SS,CS,MS store;
    class CP,PNP,GI logic;
    class Hero,Cards,Strip,IC ui;
```

## WeekStrip 색상 분기

WeekStrip은 날짜마다 `CycleState`(`'actualPeriod' | 'predictedPeriod' | 'predictedFertile' | null`)를 계산하고 우선순위 순(실제 생리 > 예측 생리 > 예측 가임기 > 기본)으로 스타일을 적용합니다.

| 날짜 유형 (`CycleState`) | 외곽선 | 배경 | 텍스트 |
|--------------------------|--------|------|--------|
| `actualPeriod` — 실제 생리 기록 | 없음 | `brand-pink100` (fill) | `brand-pink900` |
| `predictedPeriod` — 예측 생리일 | `brand-pink100` (outline) | 없음 | `brand-pink800` |
| `predictedFertile` — 예측 가임기 | `brand-lavender100` (outline) | 없음 | `brand-lavender400` |
| `null` / 오늘 (isEmpty) | 없음 | `brand-pink50` (today circle) | `brand-pink800` |
| `null` / 오늘 (데이터 있음, 해당 없음) | 강조 원 | 위 분류 우선 | — |

가임기 예측은 `domain/cycle/fertile.ts`의 `predictFertileWindow(predictedDate, predictionConfidence)` 순수 함수가 담당하며, `predictionConfidence`가 낮으면 null을 반환해 weekeStrip에 표시하지 않습니다.

## ActivitySuggestions / FoodSuggestions 구조

- **ActivitySuggestions**: chip 필터 탭(카테고리별: emotion / exercise / work / selfcare) + 톤 순환 카드(gray → pink → dark → gray). 각 카드는 제목·인라인 이모지·설명·duration pill(`durationMinutes` + `t.home.durationSuffix`)을 표시. `src/data/homeImagery.ts`의 `ACTIVITY_CATEGORY_KEYS` 순서 기반.
- **FoodSuggestions**: 그릇 컴포지션(bowl illustration) — 그릇 하단 고정, 음식 이모지 4개가 그릇 상단에 회전값 적용되어 겹쳐 배치됨. 각 이모지 위에 dark pill 라벨. phase 기반 음식 목록은 `home.foods.{phase}` i18n 키에서 조회.

## 검증 케이스

- `periods.length === 0` → isEmpty 분기. 모든 콘텐츠 섹션에 EmptyHintCard. WeekStrip은 오늘만 표시.
- `periods.length === 1` → 데이터 상태. `cycle_regularity` 인사이트는 안 뜸 (rule이 `cycleLengths.length < 2` 로 null).
- `periods.length >= 2` → 두 인사이트 모두 평가됨, 적합한 것만 카드로 표시.
- `prediction.predictedDate === null` → "Not enough data yet" / "아직 예측하기 어려워요" 표시.
- 다음 생리까지 0일 → "around today" / "오늘 즈음" 표시.
- 다음 생리 예정일이 지남 (`diff < 0`) → "N days late" / "N일 지남" 표시.
- 짧은 주기 (`evaluateNewStart` → `shortGap`) → `ShortCycleConfirmDialog` 노출. 세 선택지: extend / replace / saveAnyway. (상세: `docs/qa/edge-cases.md` 시나리오 6)
- 의료적 단정 표현 없음 — 모든 phase 카피에 "추정/보여요/패턴" / "estimated/pattern/reference" 어휘 동반 (health-copy.md §1).
