# chartPoints — Unit test cases

Last run: 2026-09-21 — 11/11 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns null for a month with no period starting in it | `periods=[a:'2026-01-01', b:'2026-03-01']`, `months=[2026-02]` | `[{2026,1,cycleDays:null}]` | ✅ |
| 2 | returns null when the month holds the very first period on record (no previous) | `periods=[a:'2026-02-05']`, `months=[2026-02]` | `[{2026,1,cycleDays:null}]` | ✅ |
| 3 | returns null for a 14-day gap (just below the countable minimum) | `periods=[a:'2025-12-18', b:'2026-01-01']`, `months=[2026-01]` | `cycleDays=null` | ✅ |
| 4 | returns the gap for a 15-day gap (countable minimum boundary) | `periods=[a:'2025-12-17', b:'2026-01-01']`, `months=[2026-01]` | `cycleDays=15` | ✅ |
| 5 | returns the gap for a 60-day gap (countable maximum boundary) | `periods=[a:'2025-11-02', b:'2026-01-01']`, `months=[2026-01]` | `cycleDays=60` | ✅ |
| 6 | returns null for a 61-day gap (just above the countable maximum) | `periods=[a:'2025-11-01', b:'2026-01-01']`, `months=[2026-01]` | `cycleDays=null` | ✅ |
| 7 | uses only the first start recorded in the month when there are multiple | `periods=[prev:'2026-01-01', first:'2026-02-05', second:'2026-02-20']`, `months=[2026-02]` | `cycleDays=35` (not 50) | ✅ |
| 8 | sorts unsorted input before matching | same fixture as #7, array order shuffled | `cycleDays=35` | ✅ |
| 9 | matches the month by year, not just month number, across a year boundary | `periods=[2024-12-01, 2025-01-10, 2025-12-20, 2026-01-25]`, `months=[2026-01]` | `cycleDays=36` (not 40) | ✅ |
| 10 | returns null for every month when periods is empty | `periods=[]`, `months=[2026-01, 2026-02]` | both `cycleDays=null` | ✅ |
| 11 | regression: real user record is null for every queried month (all gaps out of range) | `periods=['2026-06-23','2026-08-29','2026-09-09','2026-09-14']`, `months=2026년 4~9월` | every `cycleDays=null` | ✅ |

- Row 9: proves month matching uses the full `YYYY-MM` key (year + month), not just the month-of-year number — a bug that ignored the year would report 40 instead of 36.
- Row 11: September's first start (`09-09`) is the one used for the gap, not the later `09-14` record in the same month (see row 7's rule).
