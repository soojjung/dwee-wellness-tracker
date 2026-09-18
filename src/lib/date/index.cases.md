# `lib/date` — Unit test cases

대상: `src/lib/date/index.ts` 의 `ISO_DATE_RE` 정규식 + `isValidISODate(s: unknown): s is ISODate` 타입 가드 + `formatFullDate(d, locale)` + `calendarGrid(year, monthIndex, weekStartsOn)` (`./calendarGrid`, `index.ts` 에서 재수출).

Last run: 2026-09-18 — 30/30 passed

## `ISO_DATE_RE`

| #   | 설명 (`it` title)                           | 입력           | 기대 결과 | 결과 |
| --- | ------------------------------------------- | -------------- | --------- | ---- |
| 1   | matches a well-formed YYYY-MM-DD string     | `'2026-02-01'` | `true`    | ✅   |
| 2   | does not match strings missing zero padding | `'2026-2-1'`   | `false`   | ✅   |
| 3   | does not match strings without dashes       | `'20260201'`   | `false`   | ✅   |

## `isValidISODate`

| #   | 설명 (`it` title)                                               | 입력                                   | 기대 결과     | 결과 |
| --- | --------------------------------------------------------------- | -------------------------------------- | ------------- | ---- |
| 4   | returns true for a well-formed date                             | `'2026-02-01'`                         | `true`        | ✅   |
| 5   | returns true for a leap-year Feb 29                             | `'2024-02-29'`                         | `true`        | ✅   |
| 6   | returns true for year/month boundaries                          | `'2026-12-31'`, `'2026-01-01'`         | `true` (both) | ✅   |
| 7   | returns false when the format is wrong (single-digit month/day) | `'2026-2-1'`                           | `false`       | ✅   |
| 8   | returns false when the format is wrong (no dashes)              | `'20260201'`                           | `false`       | ✅   |
| 9   | returns false when the format is wrong (slashes)                | `'2026/02/01'`                         | `false`       | ✅   |
| 10  | returns false for a non-date string                             | `'not a date'`                         | `false`       | ✅   |
| 11  | returns false for an invalid month (> 12)                       | `'2026-13-01'`                         | `false`       | ✅   |
| 12  | returns false for an invalid day (Feb 30)                       | `'2026-02-30'`                         | `false`       | ✅   |
| 13  | returns false for Feb 29 on a non-leap year                     | `'2025-02-29'`                         | `false`       | ✅   |
| 14  | returns false for non-string inputs                             | `undefined`, `null`, `123`, `{}`, `[]` | `false` (all) | ✅   |
| 15  | returns false for an empty string                               | `''`                                   | `false`       | ✅   |

**Notes**

- `ISO_DATE_RE` 는 문자열 형식만 검사 (regex). 의미적 유효성(예: 2026-02-30, 2025-02-29)은 통과시킨다.
- `isValidISODate` 는 regex 통과 + `parseISO`의 `isValid` 둘 다 만족해야 true. 두 단계로 잘못된 값을 잡는다.

## `formatFullDate`

| #   | 설명 (`it` title)                                                         | 입력                                              | 기대 결과                          | 결과 |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------- | ---- |
| 16  | renders ko full date with weekday for a Monday                            | `'2026-06-15'`, `'ko'`                            | `'2026년 6월 15일 월요일'`         | ✅   |
| 17  | renders en full date with weekday for a Monday                            | `'2026-06-15'`, `'en'`                            | `'Monday, June 15, 2026'`          | ✅   |
| 18  | renders a Sunday in ko                                                    | `'2026-06-14'`, `'ko'`                            | `'2026년 6월 14일 일요일'`         | ✅   |
| 19  | renders a Sunday in en                                                    | `'2026-06-14'`, `'en'`                            | `'Sunday, June 14, 2026'`          | ✅   |
| 20  | produces the same output for an ISO string and its equivalent Date object | `fromISO('2026-06-15')` vs `'2026-06-15'`, `'en'` | both calls return identical string | ✅   |
| 21  | renders the last day of a month correctly                                 | `'2026-01-31'`, `'en'`                            | `'Saturday, January 31, 2026'`     | ✅   |
| 22  | renders the first day of the next month correctly                         | `'2026-02-01'`, `'en'`                            | `'Sunday, February 1, 2026'`       | ✅   |

## `calendarGrid`

| #   | 설명 (`it` title)                                                                      | 입력                                                    | 기대 결과                                              | 결과 |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | ---- |
| 23  | returns a 5-week (35-cell) grid for a month needing 5 rows, Sunday start               | `calendarGrid(2026, 8, 0)` (Sep 2026)                   | `length=35`, first `'2026-08-30'`, last `'2026-10-03'` | ✅   |
| 24  | returns a 4-week (28-cell) grid when the month exactly fills whole weeks, Sunday start | `calendarGrid(2026, 1, 0)` (Feb 2026)                   | `length=28`, first `'2026-02-01'`, last `'2026-02-28'` | ✅   |
| 25  | returns a 6-week (42-cell) grid for a month needing 6 rows, Sunday start               | `calendarGrid(2026, 7, 0)` (Aug 2026)                   | `length=42`, first `'2026-07-26'`, last `'2026-09-05'` | ✅   |
| 26  | shifts the leading padding when weekStartsOn is Monday                                 | `calendarGrid(2026, 8, 1)` (Sep 2026, Mon start)        | `length=35`, first `'2026-08-31'`, last `'2026-10-04'` | ✅   |
| 27  | marks leading and trailing padding cells as outside the current month                  | `calendarGrid(2026, 8, 0)` cells `[0,1]` and last 3     | `inCurrentMonth=false` for both groups                 | ✅   |
| 28  | marks every day within the target month as inCurrentMonth                              | `calendarGrid(2026, 8, 0)` filtered to `2026-09-01..30` | 30 cells, all `inCurrentMonth=true`                    | ✅   |
| 29  | marks every cell true when the month exactly fills whole weeks                         | `calendarGrid(2026, 1, 0)` (Feb 2026, no padding)       | every cell `inCurrentMonth=true`                       | ✅   |
| 30  | produces consecutive ISO dates with no gaps or duplicates                              | `calendarGrid(2026, 7, 0)` (Aug 2026, 42 cells)         | each cell is exactly 1 day after the previous          | ✅   |

**Notes**

- Weekday facts verified with `python3` (`datetime.date(...).strftime('%A')`) before writing expectations: 2026-09-01 = Tue, 2026-02-01 = Sun (28-day Feb), 2026-08-01 = Sat.
- Row #23/#26 cover the bug this changeset fixes: the grid used to always pad to 42 cells (6 weeks); now it returns only the weeks the month actually spans (28/35/42).
