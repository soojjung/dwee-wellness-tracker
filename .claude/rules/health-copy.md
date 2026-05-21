---
description: 사용자 노출 텍스트(카피) 검수 규칙 — 의료/다이어트 톤 금지 + i18n
paths:
  - 'src/**/*.tsx'
  - 'src/**/*.ts'
  - 'src/i18n/locales/**'
---

# 헬스 카피 규칙

## 1) 톤 (모든 언어 공통)

- 단언형 금지 → 추정형 사용
  - "당신은 배란기입니다" ❌ → "배란기로 추정돼요" ✅
  - "You are ovulating" ❌ → "Likely ovulation phase" ✅
- 의료 단어 금지: "진단/치료/처방/정상/비정상", "diagnosis/treatment/normal/abnormal" → "참고용 패턴" / "reference pattern"으로 대체
- 다이어트 유도 금지: "체중 관리/감량/칼로리", "weight management/loss/calories" 사용 자체 금지
- 데이터 부족 시 추정값 만들지 말기 → "아직 예측하기 어려워요" / "Not enough data yet"

## 2) i18n 규칙

- 인라인 한국어·영어 문자열 금지. 항상 `useT()` 훅 경유.
- 신규 문구 추가 시 `src/i18n/locales/ko.ts` + `src/i18n/locales/en.ts` 양쪽에 동시 추가.
- en 사전은 `Dictionary` 타입(= `typeof ko`)으로 강제 — 키가 빠지면 컴파일 실패.
- 같은 키에 대한 ko/en 의미가 어긋나지 않도록 작성.
- 디바이스 locale 자동 감지(`detectInitialLocale()`)는 첫 진입 시 1회만. 사용자가 설정에서 바꾸면 그 선택 우선.

## 3) 동적 값 처리

- 문장에 숫자·날짜를 끼워넣을 때 ko/en 어순이 다를 수 있음. 사전 키 자체를 분리.
- **B1 결정 (2026-05-15)**: 정적 키 + JSX 조합으로 통일. `bodyPrefix`/`bodySuffix` 키 쌍에 동적 값을 JSX로 끼워넣음. `tFn(args)` 헬퍼 도입 금지.
  - 예: `<>{t.insight.cycleRegularity.bodyPrefix}<strong>{avg}</strong>{t.insight.cycleRegularity.bodySuffix}</>`

## 4) 사전 외 위치 금지

- toast/alert/aria-label/placeholder/title 모두 사전에서.
- 단, 디버그 console.log·에러 throw 메시지는 영어 고정으로 사전 외 허용.
