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
