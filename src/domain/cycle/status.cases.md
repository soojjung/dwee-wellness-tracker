# classifyCycleStatus 케이스

| # | 입력 요약 | 기대 status | 기대 confidence | 비고 |
|---|-----------|-------------|-----------------|------|
| 1 | 기록 2개 (< 3) | insufficient | unknown | 3회 미만이면 다른 조건 무시 |
| 2 | 최신 기간 2일 | shortPeriod | 판정 결과 | shortPeriod 는 range 판정보다 우선 |
| 3 | 최신 기간 9일 | longPeriod | 판정 결과 | longPeriod 는 range 판정보다 우선 |
| 4 | 주기 range ≥ 15일 | irregular | ≥ medium | 최신 기간이 정상 범위일 때 |
| 5 | 주기 range 8~14일 | slightlyIrregular | ≥ medium | |
| 6 | 기간 3~7, 주기 21~35, range ≤ 7 | stable | high(4+ gap) | 모든 조건 만족해야 stable |
| 7 | 주기 ~19일이지만 range ≤ 7 | regular | high | stable 범위 밖이면 regular |
| 8 | 5개 기록, 안정적 | stable | high | gap 4+ 로 confidence high |
| 9 | 정확히 3개 기록 | 판정 결과 | medium | gap 2개 = medium |
| 10 | 중간에 14일 gap 포함 | insufficient 아님 | 판정 결과 | 이상치는 제외되고 나머지로 계산 |
| 11 | 3개 기록, 모든 gap > 60일 | regular | low | 모든 gap 이 이상치 → `averageCycleDays=null`, `regular` 로 fallback (CycleSummaryCard 뱃지/본문 미스매치 원인) |
| 12 | 3개 기록, 모든 gap < 15일 | regular | low | 모든 gap 이 이상치 → 위와 같은 fallback |
| 13 | 최신 기간 2일 + 모든 gap 이상치 | shortPeriod | low | 우선순위상 shortPeriod 가 regular fallback 보다 먼저 매칭 |
| 14 | 최신 기간 9일 + 모든 gap 이상치 | longPeriod | low | 위와 같은 우선순위 검증 |

- 우선순위: insufficient → shortPeriod → longPeriod → irregular → slightlyIrregular → stable → regular.
- gap 이상치 필터: `[15, 60]`. period 이상치 필터: `[1, 14]`.
- 표시 문자열은 화면 (`t.report.status.*`) 이 조립. 도메인은 상태 코드만 반환.
- 케이스 11~14 는 `records ≥ 3` 이지만 유효 gap 이 0 개인 상황을 문서화 — 이 경우 status 는 `regular`(또는 shortPeriod/longPeriod) 로 떨어지지만 `averageCycleDays` 는 `null`. UI 는 두 값을 함께 봐서 "데이터 부족" 뷰로 처리해야 한다 (`CycleSummaryCard` 참고).
