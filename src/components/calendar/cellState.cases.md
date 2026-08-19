# cellState — Unit test cases

Last run: 2026-08-19 — 19/19 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns false when there are no periods | `periods=[]`, `date='2026-03-10'` | `false` | ✅ |
| 2 | returns true when target equals startDate of a closed period | `period('a','2026-03-01','2026-03-05')`, `date='2026-03-01'` | `true` | ✅ |
| 3 | returns true when target equals endDate of a closed period (inclusive upper) | `period('a','2026-03-01','2026-03-05')`, `date='2026-03-05'` | `true` | ✅ |
| 4 | returns true when target is strictly between start and end | `period('a','2026-03-01','2026-03-05')`, `date='2026-03-03'` | `true` | ✅ |
| 5 | returns false when target is before startDate of a closed period | `period('a','2026-03-01','2026-03-05')`, `date='2026-02-28'` | `false` | ✅ |
| 6 | returns false when target is after endDate of a closed period | `period('a','2026-03-01','2026-03-05')`, `date='2026-03-06'` | `false` | ✅ |
| 7 | returns true only for startDate when the period has no endDate (open record) | `period('a','2026-03-01')`, `date='2026-03-01'` vs `'2026-03-02'` | `true`, `false` | ✅ |
| 8 | handles a single-day closed period (startDate === endDate) | `period('a','2026-06-15','2026-06-15')`, `date='2026-06-15'` vs `'2026-06-16'` | `true`, `false` | ✅ |
| 9 | handles year boundaries via lexical ISO comparison | `period('a','2025-12-31','2026-01-02')`, `date='2026-01-01'` | `true` | ✅ |
| 10 | returns true if any period in the list covers the target date | 3 periods, `date='2026-03-03'` inside middle | `true` | ✅ |
| 11 | returns false when no period covers the target date (mixed list) | 2 periods, `date='2026-03-15'` between them | `false` | ✅ |
| 12 | marks today with isToday=true when date === today | `date='2026-03-10'`, `today='2026-03-10'` | `isToday=true` | ✅ |
| 13 | marks isToday=false when date !== today | `date='2026-03-11'`, `today='2026-03-10'` | `isToday=false` | ✅ |
| 14 | sets background=menstrual when the date falls in a period range | `periods=[('2026-03-08','2026-03-12')]`, `date='2026-03-10'` | `background='menstrual'` | ✅ |
| 15 | sets background=null when no period covers the date | `periods=[]`, `date='2026-03-10'` | `background=null` | ✅ |
| 16 | sets predicted=true only when predictedDate matches the date exactly | `date='2026-03-10'` vs `predictedDate={'2026-03-10','2026-03-11',null}` | `true`, `false`, `false` | ✅ |
| 17 | sets hasCondition=true when the date is a key in conditionByDate | `conditionByDate={'2026-03-10': …}`, `date='2026-03-10'` | `hasCondition=true` | ✅ |
| 18 | sets hasCondition=false when the date is missing from conditionByDate | `conditionByDate={'2026-03-11': …}`, `date='2026-03-10'` | `hasCondition=false` | ✅ |
| 19 | combines all four markers independently for a single day | today + in-period + condition + predicted 모두 true | 모든 marker 동시 세팅 | ✅ |

- `isPeriodDate` 는 문자열 ISO 비교(`>=`, `<=`) 로 판정. 오픈 기록(endDate 없음)은 startDate 당일만 true.
- `deriveCellMarkers` 는 4개 marker(`background`, `predicted`, `hasCondition`, `isToday`)를 독립적으로 계산.
- 이 헬퍼들은 `DiaryScreen`/`CalendarScreen` 의 날짜 셀 표시 및 탭 상세 팝업 (`DayDetailSheet`) 진입 판정에 공용으로 쓰인다.
