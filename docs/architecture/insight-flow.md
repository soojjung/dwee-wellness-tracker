# Insight 데이터 흐름 (STEP 9.0 이후)

> B2 결정: rule 함수가 표시 문자열 책임을 화면 레이어로 이양함.
> 관련 규칙: [health-copy.md](../../.claude/rules/health-copy.md), [cycle-logic.md](../../.claude/rules/cycle-logic.md).

## After (STEP 9.0)

```mermaid
flowchart TD
    subgraph domain["lib/insight (순수 함수)"]
        R1["dataNeededRule(ctx)"]
        R2["cycleRegularityRule(ctx)"]
        GEN["generator.ts<br/>generateInsights()"]
    end

    subgraph types["types/insight.ts"]
        IR["Insight (discriminated union)<br/>{ id, kind, confidence, ...payload }"]
    end

    subgraph ui["UI Layer (app/)"]
        IC["InsightCard 컴포넌트<br/>useT() 호출"]
        T["i18n Dictionary (ko / en)<br/>t.insight.cycleRegularity.bodyPrefix<br/>t.insight.cycleRegularity.bodySuffix<br/>t.insight.dataNeeded.body"]
        OUT["최종 렌더<br/>'최근 평균 주기는 약 28일로 추정돼요.'"]
    end

    R1 -->|"{ kind: 'data_needed', confidence: 'unknown' }"| IR
    R2 -->|"{ kind: 'cycle_regularity', averageDays: 28, confidence: 'medium' }"| IR
    IR --> GEN
    GEN -->|"Insight[]"| IC
    IC -->|"kind 분기 → prefix/suffix 조립"| T
    T --> OUT
```

핵심:
- rule 함수는 `kind` + 숫자/날짜 payload + `confidence` 만 반환. 표시 문자열 생성 금지.
- 화면 컴포넌트가 `useT()`로 prefix/suffix 키를 조립하고 동적 값(`averageDays` 등)을 JSX로 보간 (B1: 정적 키 + JSX, `tFn` 헬퍼 금지).
- 의존성 방향: `domain/lib/insight → types ← UI`. domain이 i18n에 의존하지 않음.

## Before (STEP 9.0 이전)

```mermaid
flowchart TD
    R_OLD["cycleRegularityRule()<br/>title/body 한국어 하드코딩"]
    IC_OLD["InsightCard<br/>title/body 그대로 출력"]
    R_OLD -->|"{ title, body, ... }"| IC_OLD
```

문제점:
1. 한국어 문자열이 domain에 박혀 영어 로케일에서도 한국어 노출.
2. rule이 표시 책임까지 가져 단일 책임 원칙 위반.
3. `tFn` 헬퍼 도입 시 rule이 i18n 레이어에 의존 → 의존성 방향 위반.
