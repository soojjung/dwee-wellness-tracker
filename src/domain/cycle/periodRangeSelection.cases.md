# `periodRangeSelection` — Unit test cases

대상: `src/domain/cycle/periodRangeSelection.ts`

Last run: 2026-10-16 — 16/16 passed

공용 달력 탭 규칙 — 홈 `PeriodSelectSheet` 와 리포트 `PeriodRecordSheet` 가 같이 쓴다 (R7-4). 입력은 빈 상태에서 차례로 누른 날짜.

## `tapPeriodDate(state, date, newKey)`

| # | 설명 (`it` title) | 탭 순서 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | sets a pending start on the first tap | 11 | 범위 없음, 시작 대기 11 | ✅ |
| 2 | clears the pending start when it is tapped again | 11 → 11 | 빈 상태 | ✅ |
| 3 | completes a range on the second tap | 11 → 12 | 11~12 | ✅ |
| 4 | completes a range when the second tap is before the start | 14 → 11 | 11~14 | ✅ |
| 5 | keeps earlier days on a 3rd consecutive tap (11 → 12 → 13) | 11 → 12 → 13 | 11~13 | ✅ |
| 6 | removes only the re-tapped end day (11·12, tap 12 → 11) | 11 → 12 → 12 | 11~11 | ✅ |
| 7 | splits a range when a middle day is re-tapped | 11 → 15 → 13 | 11~12, 14~15 | ✅ |
| 8 | drops a one-day range when its only day is re-tapped | 11 → 12 → 12 → 11 | 빈 상태 | ✅ |
| 9 | extends a range up to 7 days after its end | 11 → 12 → 19 | 11~19 | ✅ |
| 10 | starts a new pending start more than 7 days after a range | 1 → 2 → 20 | 1~2, 시작 대기 20 | ✅ |
| 11 | extends a range backward when the day right before it is tapped | 12 → 13 → 11 | 11~13 | ✅ |
| 12 | keeps a tap 2+ days before a range as a pending start | 12 → 13 → 10 | 12~13, 시작 대기 10 | ✅ |

**Notes**
- 행 5·6: TestFlight R7-4 제보 그대로 (세 번째 탭에서 초기화, 재탭 시 전체 초기화).
- 행 9: 끝난 뒤 7일(`EXTEND_GAP_DAYS`) 이내 탭은 사이를 채워 늘린다 — 홈 시트의 기존 규칙.
- 행 11: 시작 대기로 두면 저장 때 평균 기간으로 채워져 화면에 보인 것(11~13)보다 길게 저장되므로 바로 붙인다.

## `finalizePeriodDrafts(state, averagePeriodLength)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 13 | returns drafts as-is when there is no pending start | 11 → 13, 평균 5 | 11~13 그대로 | ✅ |
| 14 | fills a lone start with the average period length | 11, 평균 5 | 11~15 | ✅ |

## `selectedPeriodDates(state)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 15 | is empty for the empty state | 빈 상태 | 크기 0 | ✅ |
| 16 | includes every day of each range plus the pending start | 11 → 13 → 25 | 11, 12, 13, 25 | ✅ |
