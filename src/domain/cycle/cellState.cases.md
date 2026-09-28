# cellState — Unit test cases

Last run: 2026-09-28 — 24/24 passed

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
| 14 | sets cycle=actualPeriod when the date falls in a period range | `periods=[('2026-03-08','2026-03-12')]`, `date='2026-03-10'`, `predictions=null` | `cycle='actualPeriod'` | ✅ |
| 15 | sets cycle=null when no period covers the date and predictions is null | `periods=[]`, `predictions=null` | `cycle=null` | ✅ |
| 16 | sets cycle=predictedPeriod when the date is within the predicted range (inclusive start/end) | `predictions.predictedPeriod={'2026-03-10','2026-03-14'}`, `date` at `10`/`14`/`09`/`15` | `predictedPeriod`, `predictedPeriod`, `null`, `null` | ✅ |
| 17 | sets cycle=predictedFertile when the date is within the fertile range only | `predictions.fertile={'2026-02-20','2026-02-26'}`, `date='2026-02-22'` | `cycle='predictedFertile'` | ✅ |
| 18 | prioritizes actualPeriod over an overlapping predicted period | `periods=[('2026-03-10','2026-03-12')]`, `predictions.predictedPeriod={'2026-03-10','2026-03-14'}`, `date='2026-03-11'` | `cycle='actualPeriod'` | ✅ |
| 19 | shows only actualPeriod (never predicted markers) when predictions is null | `periods=[('2026-03-08','2026-03-12')]`, `predictions=null`, `date='2026-03-10'` vs `'2026-03-20'` | `'actualPeriod'`, `null` | ✅ |
| 20 | sets hasCondition=true when the date is a key in conditionByDate | `conditionByDate={'2026-03-10': …}`, `date='2026-03-10'` | `hasCondition=true` | ✅ |
| 21 | sets hasCondition=false when the date is missing from conditionByDate | `conditionByDate={'2026-03-11': …}`, `date='2026-03-10'` | `hasCondition=false` | ✅ |
| 22 | combines cycle, hasCondition, and isToday independently for a single day | today + condition + `predictions.predictedPeriod` covering date, no actual periods | `{cycle:'predictedPeriod', hasCondition:true, isToday:true}` | ✅ |
| 23 | returns both predictedPeriod and fertile as null when predictedDate is null | `calendarPredictions(null, 5, 'medium')` | `{predictedPeriod:null, fertile:null}` | ✅ |
| 24 | matches predictedRange and predictFertileWindow for a real date and confidence | `calendarPredictions('2026-06-10', 5, 'medium')` | `{predictedPeriod: predictedRange('2026-06-10',5), fertile: predictFertileWindow('2026-06-10','medium')}` | ✅ |

- `isPeriodDate` 는 문자열 ISO 비교(`>=`, `<=`) 로 판정. 오픈 기록(endDate 없음)은 startDate 당일만 true.
- `deriveCellMarkers` 는 `CellMarkers = { cycle, hasCondition, isToday }` 3개 필드를 계산. 기존 `background`/`predicted` 필드는 제거되고 `cycle: CycleState`(`'actualPeriod' | 'predictedPeriod' | 'predictedFertile' | null`) 로 통합됨 (2026-09-28).
- `predictions: CalendarPredictions | null` — `null` 이면 달력 예측 토글이 꺼진 상태로, 실제 생리 기록(`actualPeriod`)만 표시하고 예측 구간은 전부 무시한다 (행 19).
- 우선순위는 `computeState` 와 동일: actualPeriod > predictedPeriod > predictedFertile > null.
- `calendarPredictions()` 는 `predictedRange()` 와 `predictFertileWindow()` 를 조합한 얇은 래퍼 — 행 24는 위임을 직접 검증(구현 재구현 없이 실제 헬퍼 호출 결과와 비교).
- 이 헬퍼들은 `DiaryMonthGrid`/홈 주간 스트립의 날짜 셀 표시(생리·예측·가임기·오늘·컨디션 마커) 판정에 쓰인다. `isPeriodDate`, `computeState`, `predictedRange` 는 `weekStripDays.buildDays` 에서도 재사용(`weekStripDays.test.ts` 참고).
- `src/components/calendar/cellState.ts` 에서 순수 주기 로직이므로 `src/domain/cycle/cellState.ts` 로 이동 (2026-09-21). 동작 변경 없음 — import 경로만 `@/domain/cycle/cellState` 로 바뀜.
