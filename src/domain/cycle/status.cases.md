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

- 우선순위: insufficient → shortPeriod → longPeriod → irregular → slightlyIrregular → stable → regular.
- gap 이상치 필터: `[15, 60]`. period 이상치 필터: `[1, 14]`.
- 표시 문자열은 화면 (`t.report.status.*`) 이 조립. 도메인은 상태 코드만 반환.
