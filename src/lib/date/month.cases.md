# `lib/date/month` — Unit test cases

대상: `src/lib/date/month.ts` 의 `shiftMonth(m, delta)` + `monthBoundsISO(m)` + `monthKey(m)`.

Last run: 2026-09-21 — 14/14 passed

## `shiftMonth`

| #   | 설명 (`it` title)                                     | 입력                              | 기대 결과                        | 결과 |
| --- | ------------------------------------------------------ | --------------------------------- | --------------------------------- | ---- |
| 1   | rolls forward from December into January of next year  | `{2026,11}`, `delta=1`            | `{2027,0}`                        | ✅   |
| 2   | rolls backward from January into December of prev year | `{2026,0}`, `delta=-1`            | `{2025,11}`                       | ✅   |
| 3   | returns the same month unchanged for delta=0            | `{2026,5}`, `delta=0`             | `{2026,5}`                        | ✅   |
| 4   | handles a +13 overflow spanning more than one year      | `{2026,5}`, `delta=13`            | `{2027,6}`                        | ✅   |
| 5   | handles a -13 overflow spanning more than one year      | `{2026,5}`, `delta=-13`           | `{2025,4}`                        | ✅   |
| 6   | handles a large negative delta crossing several years   | `{2026,0}`, `delta=-25`           | `{2023,11}`                       | ✅   |
| 7   | handles a large positive delta crossing several years   | `{2026,11}`, `delta=25`           | `{2029,0}`                        | ✅   |

## `monthBoundsISO`

| #   | 설명 (`it` title)                                | 입력           | 기대 결과                                | 결과 |
| --- | -------------------------------------------------- | -------------- | ------------------------------------------ | ---- |
| 8   | returns the first/last day of a 31-day month       | `{2026,0}`     | `{start:'2026-01-01', end:'2026-01-31'}`   | ✅   |
| 9   | returns Feb 1-28 for a non-leap year               | `{2026,1}`     | `{start:'2026-02-01', end:'2026-02-28'}`   | ✅   |
| 10  | returns Feb 1-29 for a leap year                   | `{2024,1}`     | `{start:'2024-02-01', end:'2024-02-29'}`   | ✅   |
| 11  | returns the first/last day of December (year-end)  | `{2026,11}`    | `{start:'2026-12-01', end:'2026-12-31'}`   | ✅   |

## `monthKey`

| #   | 설명 (`it` title)                                | 입력           | 기대 결과   | 결과 |
| --- | -------------------------------------------------- | -------------- | ----------- | ---- |
| 12  | zero-pads a single-digit month                    | `{2026,0}`     | `'2026-01'` | ✅   |
| 13  | does not pad a two-digit month                     | `{2026,11}`    | `'2026-12'` | ✅   |
| 14  | reflects monthIndex + 1 as the calendar month number | `{2026,8}`   | `'2026-09'` | ✅   |

## monthsBackToCover

| #   | 설명 (`it` title)                                   | 입력 (today, earliest, min)          | 기대 결과 | 결과 |
| --- | ----------------------------------------------------- | ------------------------------------ | --------- | ---- |
| 15  | returns the minimum when there is no record          | `'2026-09-26', null, 24`             | `24`      | ✅   |
| 16  | keeps the minimum when the earliest record is within it | `'2026-09-26', '2025-03-10', 24`  | `24`      | ✅   |
| 17  | reaches back to the month of an older record         | `'2026-09-26', '2023-11-30', 24`     | `34`      | ✅   |
| 18  | counts by calendar month, ignoring the day           | `'2026-09-01', '2024-08-31', 24`     | `25`      | ✅   |
| 19  | crosses the year boundary                            | `'2027-01-05', '2024-12-20', 24`     | `25`      | ✅   |

**Notes**

- `shiftMonth` 는 `year*12+monthIndex` 를 정수 산술로 넘기고 나눠 되돌리는 방식 — `new Date(year, monthIndex+delta, 1)` 정규화와 동일한 결과를 내는 것을 `year 1990~2050 × monthIndex 0~11 × delta ∈ {±1,±6,±12,±13,±25,±100,0}` 전수 비교로 검증(별도 스크립트, 0 mismatch). `DiaryScreen` 의 스와이프 커밋과 `InlineDatePicker` 의 이전/다음 달 이동이 이 함수로 교체됨.
- `monthBoundsISO` 는 `DiaryScreen` 의 컨디션 범위 하이드레이션(`new Date(y,m,1)` / `new Date(y,m+1,0)`)을 대체 — 동일한 ISO 문자열을 반환함을 확인.
- `monthsBackToCover` 는 `PeriodSelectSheet` 가 보여줄 과거 달 수(기본 12, 더 오래된 기록이 있으면 그 달까지)를 정한다 — TestFlight R3-6 후속. 기본 12 + "이전 달 더 보기" 로 12씩 추가.
- `monthKey` 는 `PeriodSelectSheet`(월 그리드 키, 현재 달 키)와 `chartPoints.ts`(달별 매칭 키)의 인라인 템플릿 문자열을 대체.
