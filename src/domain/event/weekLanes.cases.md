# weekLanes — Unit test cases

Last run: 2026-09-14 — 17/17 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns an empty array when cells is empty | `events=[event('a','2026-03-01','2026-03-05')]`, `cells=[]` | `[]` | ✅ |
| 2 | returns an empty array when events is empty | `events=[]`, `cells=baseRow` (7 in-month cells 03-01..03-07) | `[]` | ✅ |
| 3 | lays out a single-day event on its own column with no continuation flags | `event('a','2026-03-03','2026-03-03')` on `baseRow` | `lane=0`, `startCol=2`, `endCol=2`, `continuesBefore=false`, `continuesAfter=false` | ✅ |
| 4 | lays out a multi-day event fully inside the row as one continuous bar | `event('a','2026-03-02','2026-03-05')` on `baseRow` | `lane=0`, `startCol=1`, `endCol=4`, both continues flags `false` | ✅ |
| 5 | clips an event that starts before the row and sets continuesBefore | `event('a','2026-02-25','2026-03-03')` on `baseRow` | `startCol=0`, `endCol=2`, `continuesBefore=true`, `continuesAfter=false` | ✅ |
| 6 | clips an event that ends after the row and sets continuesAfter | `event('a','2026-03-05','2026-03-12')` on `baseRow` | `startCol=4`, `endCol=6`, `continuesBefore=false`, `continuesAfter=true` | ✅ |
| 7 | omits an event that only touches out-of-month cells | `event('a','2026-02-27','2026-02-28')` on row with cols 0-1 `inCurrentMonth=false` | `[]` | ✅ |
| 8 | clips the visible span to in-month cells when the event bleeds into a leading out-of-month cell | `event('a','2026-02-27','2026-03-02')` on row with cols 0-1 `inCurrentMonth=false` | `startCol=2`, `endCol=3`, `continuesBefore=true`, `continuesAfter=false` | ✅ |
| 9 | clips the visible span to in-month cells when the event bleeds into a trailing out-of-month cell | `event('a','2026-03-05','2026-03-09')` on row with cols 5-6 `inCurrentMonth=false` | `startCol=4`, `endCol=4`, `continuesBefore=false`, `continuesAfter=true` | ✅ |
| 10 | assigns overlapping events to lanes 0 and 1 | `a('2026-03-01','2026-03-03')`, `b('2026-03-02','2026-03-04')` on `baseRow` | `a→lane0`, `b→lane1` | ✅ |
| 11 | keeps non-overlapping events on the same lane 0 | `a('2026-03-01','2026-03-02')`, `b('2026-03-04','2026-03-05')` on `baseRow` | `a→lane0`, `b→lane0` | ✅ |
| 12 | bumps an event to lane 1 when it overlaps lane 0 on only one shared column | `a('2026-03-01','2026-03-05')`, `b('2026-03-05','2026-03-06')` on `baseRow` | `a→lane0`, `b→lane1` | ✅ |
| 13 | drops the 4th fully-overlapping event when it exceeds the default maxLanes (MAX_BADGES_PER_DAY) | 4 same-day (`2026-03-01`) events ids `1..4`, default `maxLanes` on `baseRow` | ids `1,2,3` returned at lanes `0,1,2`; id `4` omitted | ✅ |
| 14 | respects an explicit maxLanes override | 2 same-day events ids `1,2`, `maxLanes=1` on `baseRow` | only id `1` returned at `lane0` | ✅ |
| 15 | sorts overlapping events with the same startDate longest-first | input order `[short('2026-03-01','2026-03-02'), long('2026-03-01','2026-03-04')]` on `baseRow` | order `[long→lane0, short→lane1]` | ✅ |
| 16 | breaks a same-range tie by earlier createdAt first | input order `[later(createdAt='2026-01-02'), earlier(createdAt='2026-01-01')]`, both `2026-03-01..03-03` | order `[earlier→lane0, later→lane1]` | ✅ |
| 17 | breaks a same-range, same-createdAt tie by smaller id first | input order `[b, a]`, both `2026-03-01..03-03`, same createdAt | order `[a→lane0, b→lane1]` | ✅ |

- Row fixtures: `baseRow` = 7 in-month cells `2026-03-01`..`2026-03-07`. Rows 7-9 use a variant with 2 out-of-month cells at the leading or trailing edge.
