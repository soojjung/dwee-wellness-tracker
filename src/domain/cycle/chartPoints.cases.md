# chartPoints — Unit test cases

Last run: 2026-09-28 — 12/12 passed

창 `APR_TO_SEP_2026` = 2026년 4~9월 6칸. `position` 은 가로축 0~1, 한 달 = 1/6, 그 달 안에서는 `(일 − 0.5) / 그 달 일수`.

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns no points when periods is empty | `[]` | `[]` | ✅ |
| 2 | makes no point for the very first period on record (no previous) | `[05-10]` | `[]` | ✅ |
| 3 | makes a point for the gap ending at a start inside the window | `[07-28, 08-29]` | `{ startDate: 08-29, cycleDays: 32 }` | ✅ |
| 4 | places a late-month start near the right edge of its month slot | `[07-28, 08-29]` | `position = (4 + 28.5/31)/6`, 8월 칸 오른쪽 끝(4.9/6 ~ 5/6) | ✅ |
| 5 | places a 1st-of-month start just right of the slot start | `[05-02, 06-01]` | `position = (2 + 0.5/30)/6` | ✅ |
| 6 | uses the real month length (February 2026 has 28 days) | `[01-31, 02-28]`, 창 `[2026-02]` | `position = 27.5/28` | ✅ |
| 7 | makes one point per start when a month holds two starts | `[04-10, 05-01, 05-30]` | 점 2개 `05-01:21`, `05-30:29`, 왼→오 순서 | ✅ |
| 8 | skips a 14-day gap and keeps a 15-day gap (countable minimum) | `[05-17, 05-31]` / `[05-16, 05-31]` | `[]` / `cycleDays 15` | ✅ |
| 9 | keeps a 60-day gap and skips a 61-day gap (countable maximum) | `[04-02, 06-01]` / `[04-01, 06-01]` | `cycleDays 60` / `[]` | ✅ |
| 10 | uses a previous period outside the window, but skips starts outside it | `[03-20, 04-18, 10-07]` | `[04-18:29]` 만 (10-07 은 창 밖) | ✅ |
| 11 | sorts unsorted input and matches months by year across a year boundary | `[2026-01-25, 2025-01-10, 2025-12-20]`, 창 `[2025-12, 2026-01]` | `[2026-01-25:36]`, `position > 0.5` | ✅ |
| 12 | regression: real user record has no points when every gap is out of range | `[06-23, 08-29, 09-09, 09-14]` (간격 67·11·5) | `[]` | ✅ |
