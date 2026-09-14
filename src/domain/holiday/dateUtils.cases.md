# dateUtils — Unit test cases

Last run: 2026-09-14 — 20/20 passed

| #   | 설명 (`it` title)                                                                   | 입력                         | 기대 결과      | 결과 |
| --- | ----------------------------------------------------------------------------------- | ---------------------------- | -------------- | ---- |
| 1   | pads single-digit month and day with a leading zero                                 | `iso(2026, 1, 5)`            | `'2026-01-05'` | ✅   |
| 2   | leaves already-two-digit month and day unchanged                                    | `iso(2026, 12, 31)`          | `'2026-12-31'` | ✅   |
| 3   | adds days forward within the same month                                             | `addDays('2026-03-10', 5)`   | `'2026-03-15'` | ✅   |
| 4   | subtracts days backward across a month boundary                                     | `addDays('2026-03-10', -15)` | `'2026-02-23'` | ✅   |
| 5   | returns the same date when adding zero days                                         | `addDays('2026-06-15', 0)`   | `'2026-06-15'` | ✅   |
| 6   | rolls Feb 28 -> Feb 29 in a leap year                                               | `addDays('2028-02-28', 1)`   | `'2028-02-29'` | ✅   |
| 7   | rolls Feb 28 -> Mar 1 in a non-leap year                                            | `addDays('2027-02-28', 1)`   | `'2027-03-01'` | ✅   |
| 8   | rolls Dec 31 -> Jan 1 of the next year                                              | `addDays('2027-12-31', 1)`   | `'2028-01-01'` | ✅   |
| 9   | returns 0 (Sunday) with no drift around a US DST transition date                    | `weekday('2026-03-08')`      | `0`            | ✅   |
| 10  | returns 6 for a known Saturday                                                      | `weekday('2026-01-03')`      | `6`            | ✅   |
| 11  | returns 1 for a known Monday                                                        | `weekday('2026-01-05')`      | `1`            | ✅   |
| 12  | returns true for Saturday                                                           | `isWeekend('2026-01-03')`    | `true`         | ✅   |
| 13  | returns true for Sunday                                                             | `isWeekend('2026-01-04')`    | `true`         | ✅   |
| 14  | returns false for a weekday                                                         | `isWeekend('2026-01-07')`    | `false`        | ✅   |
| 15  | finds the 1st occurrence of a weekday in the month                                  | `nthWeekday(2026, 3, 0, 1)`  | `'2026-03-01'` | ✅   |
| 16  | finds the 3rd occurrence of a weekday in the month                                  | `nthWeekday(2026, 1, 1, 3)`  | `'2026-01-19'` | ✅   |
| 17  | finds the 4th occurrence of a weekday in the month                                  | `nthWeekday(2026, 11, 4, 4)` | `'2026-11-26'` | ✅   |
| 18  | finds the last occurrence of a weekday in the month                                 | `lastWeekday(2026, 5, 1)`    | `'2026-05-25'` | ✅   |
| 19  | finds the last occurrence of a weekday in December without leaking into next year   | `lastWeekday(2026, 12, 4)`   | `'2026-12-31'` | ✅   |
| 20  | returns the last day of the month itself when it already matches the target weekday | `lastWeekday(2026, 2, 6)`    | `'2026-02-28'` | ✅   |

- Row 9 doubles as the DST-transition edge case: 2026-03-08 is the Sunday US clocks spring forward, and the UTC-based `weekday` must not drift to Saturday/Monday.
- Row 8 doubles as the year-rollover edge case for `addDays`.
- Row 19 exercises the month-rollover branch inside `lastWeekday` (it computes `firstOfNext` via `year + 1, 1` when `month === 12`).
