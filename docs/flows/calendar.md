# Calendar 화면 흐름

## 셀 상태 결정 트리

```mermaid
flowchart TD
  A[셀 date 입력] --> B{periods 내 포함?}
  B -- yes --> M[background=menstrual]
  B -- no --> N[background=null]
  M --> P{predictedDate === date?}
  N --> P
  P -- yes --> R[predicted=true]
  P -- no --> S[predicted=false]
  R --> T{conditionByDate[date]?}
  S --> T
  T -- yes --> U[hasCondition=true · 점 표시]
  T -- no --> V[hasCondition=false]
  U --> W{date === today?}
  V --> W
  W -- yes --> X[isToday=true · ring 표시]
  W -- no --> Y[isToday=false]
```

## 월 네비게이션 데이터 흐름

```mermaid
sequenceDiagram
  participant U as User
  participant C as CalendarScreen
  participant CS as conditionStore
  participant PS as periodStore

  U->>C: 마운트
  C->>PS: hydrate() (최초 1회)
  C->>CS: hydrateRange(이번달 1일~말일)
  CS-->>C: byDate 업데이트
  PS-->>C: periods 업데이트
  C->>C: deriveCellMarkers + predictNextPeriod
  C-->>U: MonthGrid 렌더

  U->>C: ‹ 또는 › 클릭
  C->>C: cursor = shiftMonth(cursor, ±1)
  C->>CS: hydrateRange(새 월 범위)
  CS-->>C: byDate merge
  C-->>U: 새 MonthGrid 렌더

  U->>C: DayCell tap
  C->>C: selectedDate = date
  C-->>U: DayDetailSheet 오픈
  U->>C: 시트 외부 클릭/Esc
  C->>C: selectedDate = null
```

## DayDetailSheet 액션 버튼

`selectedDate`와 `periods` 상태에 따라 버튼이 조건부로 노출됩니다.

```mermaid
flowchart TD
  SD[selectedDate 결정됨] --> CA{canAdd?\n선택일 ≤ today\n&& 해당 startDate 없음}
  SD --> OR{openRecordId?\n미종료 record 있고\nstartDate ≤ selectedDate}
  SD --> SM{startMatchId?\n해당 날짜가\nstartDate 인 record 있음}

  CA -- yes --> BAdd["[primary] 생리 시작으로 기록\n→ selectedDate 닫고\nrangeStartSeed = date 세트"]
  OR -- yes --> BEnd["[secondary/primary] 종료일로 기록\n→ periodStore.update(id, endDate)"]
  SM -- yes --> BRem["[ghost] 기록 삭제\n→ periodStore.remove(id)"]

  BAdd --> RD[PeriodRangeDialog 오픈\ninitialStartDate = rangeStartSeed]
  RD --> |"onSubmit"| PA["periodStore.add\n{startDate, endDate}"]
  PA --> Toast["toast: 추가됨"]

  classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
  classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
  class SD,BAdd,BEnd,BRem,RD,Toast ui;
  class CA,OR,SM,PA logic;
```

- 세 버튼은 중첩될 수 있습니다 (예: 미종료 record 가 있고 동시에 다른 startDate 도 있는 날).
- `canAdd` 조건: `selectedDate <= today` 이고 해당 날짜를 startDate 로 갖는 record 가 없음.
- `openRecordId`: endDate 가 없는 record 중 `startDate <= selectedDate` 를 만족하는 가장 최근 record.
- `PeriodRangeDialog` 는 FAB 과 캘린더 양쪽에서 공유하는 컴포넌트 (`src/components/app/PeriodRangeDialog.tsx`).

## 결정 사항

- **A9** = 주 시작 요일: 일요일 (`WEEK_STARTS_ON = 0`).
- 셀 상태 우선순위: `menstrual`(배경) > `predicted`(ring) > `hasCondition`(하단 점) > `today`(얇은 ring).
  - 같은 셀에 여러 상태 중첩 가능 (예: 오늘이면서 생리 기록 + 컨디션).
- 6주×7일 = 42칸 고정. 5주만 필요한 달은 padding으로 유지 (UX 일관성).
- 월 이동마다 `hydrateRange`로 해당 월 conditions만 로드 (전체 로드 없음).
- 예측 날짜는 `predictNextPeriod()` 단일 값 — 다음 한 사이클만 표시.
