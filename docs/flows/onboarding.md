# 온보딩 플로우 (STEP 9.1)

> 위치: `src/components/auth/OnboardingFlow.tsx`, `src/app/(auth)/onboarding/page.tsx`
> 결정 적용: A2 = 평균 주기는 숫자 입력 (+/- 버튼 조정).

## State machine

```mermaid
stateDiagram-v2
    [*] --> DateStep
    DateStep --> DateStep : 시작일 변경
    DateStep --> Error_MissingDate : Next (date 비어있음)
    DateStep --> Error_FutureDate : Next (date > today)
    Error_MissingDate --> DateStep
    Error_FutureDate --> DateStep
    DateStep --> CycleStep : Next (date OK)
    CycleStep --> CycleStep : +/- (15~60 clamp)
    CycleStep --> DateStep : Back
    CycleStep --> Error_CycleRange : Done (15~60 외)
    Error_CycleRange --> CycleStep
    CycleStep --> Saving : Done (cycle OK)
    Saving --> Home : success → router.push('/')
    Saving --> CycleStep : add() 실패 (errorMissingDate 표시)
```

## 데이터 흐름

```mermaid
flowchart LR
    UI["OnboardingFlow"]
    PR["periodRepo.add({startDate})"]
    SR["settingsRepo.update({averageCycleLength, onboardingCompleted: true})"]
    PS["periodStore"]
    SS["settingsStore"]
    HOME["/  (HomePage)"]

    UI -->|"1. addPeriod"| PS --> PR
    UI -->|"2. updateSettings"| SS --> SR
    UI -->|"3. router.push"| HOME
```

## 검증 케이스

- 시작일 미입력 → "시작일을 골라주세요." 표시 후 step 전환 안 됨
- 시작일이 오늘 이후 → "오늘 이전 날짜를 골라주세요." 표시
- cycleLength `<` 15 또는 `>` 60 → +/- 버튼이 clamp하므로 발생 불가, 단 방어 코드는 존재
- Back 버튼 → DateStep 복귀, 입력값 보존
- Done → 저장 중에는 버튼 disabled, 저장 후 `/` 이동
