---
description: 생리 주기 계산·예측·인사이트 생성 로직 가드레일
paths:
  - 'src/domain/cycle/**'
  - 'src/lib/insight/**'
---

# 주기·인사이트 로직 규칙

## 1) 라이브러리 제약

- ML/AI 라이브러리(tensorflow, onnx, scikit-learn 등) import 금지.
- 통계 라이브러리 도입 전 사용자 승인. 기본은 vanilla TS + date-fns만.

## 2) 함수 시그니처

- 모든 예측·인사이트 함수는 부수효과 없는 순수 함수.
- 모든 예측 함수 반환값에 `confidence: 'low' | 'medium' | 'high' | 'unknown'` 포함.
- 'unknown' = 데이터 부족 / 'low' = 표본 부족 / 'medium' = 기본 / 'high' = 4회 이상 안정.

## 3) 데이터 부족 처리

- 추정값 강제 생성 금지. 부족하면 `null` 또는 `confidence: 'unknown'` 반환.
- 화면 노출은 `COPY.home.insufficientData` ("아직 예측하기 어려워요").

## 4) 이상치 정책

- 주기 길이 < 15일 또는 > 60일 → 평균 계산에서 제외.
- 생리 기간 < 1일 또는 > 14일 → 평균 계산에서 제외.
- 사용자에게 제거 사실 별도 표기 안 함 (참고용 전제).

## 5) 의료적 단언 금지

- "정상", "비정상", "진단", "치료" 사용 금지.
- 결과 노출 시 "추정/예상/참고용/패턴" 중 하나 동반.

## 6) 룰 추가

- 새 룰은 `src/lib/insight/rules/{name}Rule.ts` 한 파일.
- 입력 부족 시 `null` 반환 (빈 배열 X). `generator.ts` 배열에 등록.
- rule 반환값에 표시 문자열(`title`/`body`) 금지. `kind` + 숫자/날짜 payload + `confidence` 만. 표시는 화면이 `useT()`로 조립.

## 7) 데이터 흐름

→ 다이어그램: [docs/architecture/insight-flow.md](../../docs/architecture/insight-flow.md)

## 8) 주기 상태(cycle status) 판정 기준

주기리포트에서 최근 기록을 바탕으로 아래 7단계 중 하나를 반환한다. 라벨 자체가 아니라 "상태 코드"만 도메인에서 결정하고 표시 문자열은 화면이 `useT()`로 조립.

우선순위 (위에서부터 먼저 매칭되는 것 채택):

1. **insufficient** — `periods.length < 3` (기록 3회 미만). 나머지 계산 스킵.
2. **shortPeriod** — 최근 종료된 기록의 기간이 2일 이하.
3. **longPeriod** — 최근 종료된 기록의 기간이 8일 이상.
4. **irregular** — 최근 주기 변동폭(range) 15일 이상. (변동폭 = max cycle − min cycle)
5. **slightlyIrregular** — 최근 주기 변동폭 8~14일.
6. **stable** — 기간 3~7일, 주기 21~35일, 변동 ±7일 이내(변동폭 ≤ 7일) 모두 만족.
7. **regular** — 위 조건 어디에도 해당하지 않는 나머지 (주기는 짧거나 길지만 일정하게 반복).

계산 세부:

- 주기 길이 계산은 `averageCycleLength` 와 동일하게 이상치(15~60일 밖) 제외 후 남은 gap 배열 사용.
- `shortPeriod`/`longPeriod` 는 이상치 제외(1~14일)한 뒤에도 최근 완료된 기록이 있어야 판정. 그렇지 않으면 스킵.
- 반환값은 `{ status, confidence }` — `confidence` 는 `.claude/rules/cycle-logic.md` §2 규칙과 동일하게 `'unknown' | 'low' | 'medium' | 'high'`.
- 표시 색상/카피는 화면에서 `t.report.status[status]` 로 조립. 도메인은 문자열 반환 금지.

카피 톤(예시, en source-of-truth · ko 번역):

| status | 조건 요약 | ko 예시 |
|---|---|---|
| stable | 기간 3~7일, 주기 21~35일, 변동 ±7일 | 현재 생리 패턴이 비교적 일정한 편이에요. |
| regular | 주기가 조금 짧거나 길지만 일정하게 반복 | 일정한 리듬으로 생리하고 있어요. |
| slightlyIrregular | 주기 변동 8~14일 | 최근 주기가 조금 달라지고 있어요. 컨디션을 함께 살펴보세요. |
| irregular | 주기 변동 15일 이상 | 최근 생리 주기의 변화가 큰 편이에요. 조금 더 지켜보는 것을 추천해요. |
| shortPeriod | 최근 기간 2일 이하 | 생리 기간이 평소보다 짧은 편이에요. |
| longPeriod | 최근 기간 8일 이상 | 생리 기간이 다소 긴 편이에요. |
| insufficient | 기록 3회 미만 | 조금 더 기록하면 패턴을 분석해 볼 수 있어요. |

의료적 단언은 여전히 금지(§5). 모든 표시 문자열에 "패턴/추정" 뉘앙스 유지.
