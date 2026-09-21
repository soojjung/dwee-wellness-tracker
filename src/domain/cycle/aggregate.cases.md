# aggregate — Unit test cases

Last run: 2026-09-21 — 19/19 passed

> No test file existed for `aggregate.ts` before this session (it was zero-coverage pure domain logic). Added alongside the `cycleGap.ts` constant-extraction refactor since the caller's regression-check scope assumed a baseline that didn't exist.

## averageCycleLength

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns null for an empty list | `periods=[]` | `null` | ✅ |
| 2 | returns null for a single record (no gap to measure) | `periods=[a:'2026-01-01']` | `null` | ✅ |
| 3 | returns the single gap for two records | `a:'2026-01-01', b:'2026-01-29'` | `28` | ✅ |
| 4 | averages multiple countable gaps | `a:'2026-01-01', b:'2026-01-29', c:'2026-02-26'` (gaps 28,28) | `28` | ✅ |
| 5 | includes a 15-day gap (countable minimum boundary) | `a:'2026-01-01', b:'2026-01-16'` | `15` | ✅ |
| 6 | excludes a 14-day gap (just below the countable minimum) | `a:'2026-01-01', b:'2026-01-15'` | `null` | ✅ |
| 7 | includes a 60-day gap (countable maximum boundary) | `a:'2026-01-01', b:'2026-03-02'` | `60` | ✅ |
| 8 | excludes a 61-day gap (just above the countable maximum) | `a:'2026-01-01', b:'2026-03-03'` | `null` | ✅ |
| 9 | sorts unsorted input before computing gaps | same as #4, array order shuffled | `28` | ✅ |
| 10 | rounds the average half up | gaps `[27, 30]` → avg 28.5 | `29` | ✅ |
| 11 | drops out-of-range gaps but keeps the countable ones | gaps `[9 (excluded), 28 (included)]` | `28` | ✅ |

## averagePeriodLength

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 12 | returns null for an empty list | `periods=[]` | `null` | ✅ |
| 13 | returns null when no record has an endDate | `periods=[a:'2026-01-01' (no end)]` | `null` | ✅ |
| 14 | includes a 1-day period (countable minimum boundary, same start/end) | `'2026-01-05'~'2026-01-05'` | `1` | ✅ |
| 15 | includes a 14-day period (countable maximum boundary) | `'2026-01-01'~'2026-01-14'` | `14` | ✅ |
| 16 | excludes a 15-day period (just above the countable maximum) | `'2026-01-01'~'2026-01-15'` | `null` | ✅ |
| 17 | excludes a period whose endDate is before its startDate (negative length) | `'2026-01-10'~'2026-01-05'` | `null` | ✅ |
| 18 | only averages records that have an endDate | `a` (5-day, ended), `b` (no end) | `5` | ✅ |
| 19 | rounds the average half up | lengths `[5, 6]` → avg 5.5 | `6` | ✅ |

- Both functions share the `cycleGap.ts` (15~60) / period-length (1~14) filter policy documented in `.claude/rules/cycle-logic.md` §4 — rows 5–8 and 14–16 pin those boundaries so the `CYCLE_GAP_MIN_DAYS`/`CYCLE_GAP_MAX_DAYS` import refactor in this diff can't silently drift the thresholds.
